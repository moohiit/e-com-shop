import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import SellerOrder from "../models/SellerOrder.js";
import SellerTransaction from "../models/SellerTransaction.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationEmail } from "../utils/emailTemplates.js";

// Initiate Razorpay Payment (from cart — NO DB order created yet)
export const initiateRazorpayPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Initiate Razorpay payment error:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

// Verify Razorpay Payment AND Create Order (payment-first flow)
export const verifyAndCreateOrder = async (req, res) => {
  const stockAdjustments = [];
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderData,
      email,
    } = req.body;
    const userId = req.user._id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderData) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 1b. Idempotency: a payment can only be processed once
    const existingTx = await Transaction.findOne({ paymentId: razorpayPaymentId });
    if (existingTx) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        order: existingTx.order,
        transactionId: existingTx._id,
      });
    }

    // 2. Validate products and atomically reserve stock
    const { orderItems, shippingAddress, paymentMethod, shippingPrice = 0 } = orderData;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    // Server-side recompute of all monetary totals
    let calculatedItemsPrice = 0;
    let calculatedTotalDiscount = 0;
    let calculatedTaxPrice = 0;
    let calculatedItemsTotal = 0;
    const normalizedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      // Atomic conditional decrement (prevents oversell race)
      const reserved = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!reserved) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${product.name}`,
        });
      }
      stockAdjustments.push({ id: item.product, qty: item.quantity });

      // Trust ONLY server-side numbers
      const basePrice = product.basePrice;
      const discountAmount = product.discountAmount;
      const taxAmount = product.taxAmount;
      const finalPrice = product.finalPrice;

      calculatedItemsPrice += basePrice * item.quantity;
      calculatedTotalDiscount += discountAmount * item.quantity;
      calculatedTaxPrice += taxAmount * item.quantity;
      calculatedItemsTotal += finalPrice * item.quantity;

      normalizedItems.push({
        product: item.product,
        name: product.name,
        quantity: item.quantity,
        price: finalPrice,
        basePrice,
        discountPercentage: product.discountPercentage,
        discountAmount,
        taxPercentage: product.taxPercentage,
        taxAmount,
        seller: product.seller,
      });
    }

    const calculatedTotalPrice = +(calculatedItemsTotal + Number(shippingPrice || 0)).toFixed(2);

    // 3. Create DB Order using server-computed values
    const order = new Order({
      user: userId,
      orderItems: normalizedItems.map((item) => ({
        ...item,
        orderStatus: "Processing",
        isCancelled: false,
        isDelivered: false,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice: +calculatedItemsPrice.toFixed(2),
      totalDiscount: +calculatedTotalDiscount.toFixed(2),
      shippingPrice: Number(shippingPrice || 0),
      taxPrice: +calculatedTaxPrice.toFixed(2),
      totalPrice: calculatedTotalPrice,
      isPaid: true,
      paidAt: new Date(),
    });

    const createdOrder = await order.save();

    // 4. Create Seller Orders
    const sellerGroups = {};
    normalizedItems.forEach((item) => {
      const key = item.seller.toString();
      if (!sellerGroups[key]) sellerGroups[key] = [];
      sellerGroups[key].push(item);
    });

    const sellerOrderIds = [];

    for (const sellerId in sellerGroups) {
      const sellerItems = sellerGroups[sellerId];

      const sellerItemsPrice = sellerItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
      const sellerTotalDiscount = sellerItems.reduce((sum, item) => sum + item.discountAmount * item.quantity, 0);
      const sellerTaxPrice = sellerItems.reduce((sum, item) => sum + item.taxAmount * item.quantity, 0);
      const sellerTotalPrice = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const sellerOrder = new SellerOrder({
        order: createdOrder._id,
        seller: sellerId,
        user: userId,
        items: sellerItems.map((item) => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          basePrice: item.basePrice,
          discountPercentage: item.discountPercentage,
          discountAmount: item.discountAmount,
          taxPercentage: item.taxPercentage,
          taxAmount: item.taxAmount,
          orderStatus: "Processing",
          isCancelled: false,
          isDelivered: false,
        })),
        itemsPrice: +sellerItemsPrice.toFixed(2),
        totalDiscount: +sellerTotalDiscount.toFixed(2),
        taxPrice: +sellerTaxPrice.toFixed(2),
        totalPrice: +sellerTotalPrice.toFixed(2),
        isPaid: true,
        paidAt: new Date(),
      });

      const savedSellerOrder = await sellerOrder.save();
      sellerOrderIds.push(savedSellerOrder._id);

      // Create seller transaction (no raw payment payload persisted)
      await SellerTransaction.create({
        seller: sellerId,
        sellerOrder: savedSellerOrder._id,
        paymentId: razorpayPaymentId,
        paymentMethod: "Razorpay",
        status: "success",
        amount: +sellerTotalPrice.toFixed(2),
        currency: "INR",
        paymentTime: new Date(),
      });
    }

    // Link seller orders to main order
    createdOrder.sellerOrders = sellerOrderIds;

    // 5. Create main transaction
    const transaction = await Transaction.create({
      user: userId,
      order: createdOrder._id,
      paymentId: razorpayPaymentId,
      paymentMethod: "Razorpay",
      status: "success",
      amount: calculatedTotalPrice,
      currency: "INR",
      email,
      paymentTime: new Date(),
    });

    createdOrder.transaction = transaction._id;
    await createdOrder.save();

    // 6. Send confirmation email
    try {
      const user = await User.findById(userId).select("name email");
      if (user?.email) {
        const { subject, html } = orderConfirmationEmail(createdOrder, user.name);
        await sendEmail(user.email, subject, html);
      }
    } catch (emailErr) {
      console.error("Order confirmation email failed:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Payment verified and order created",
      order: createdOrder,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Verify and create order error:", error);
    // Best-effort rollback of any stock we already decremented
    for (const adj of stockAdjustments) {
      try {
        await Product.findByIdAndUpdate(adj.id, { $inc: { stock: adj.qty } });
      } catch (rbErr) {
        console.error("Stock rollback failed for", adj.id, rbErr.message);
      }
    }
    res.status(500).json({ message: "Failed to verify payment and create order" });
  }
};

// Legacy: Create Razorpay Order from existing DB order (kept for retrying unpaid orders)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.isPaid) return res.status(400).json({ message: "Order is already paid" });

    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

// Legacy: Verify Razorpay Payment for existing order (kept for retrying unpaid orders)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, email } = req.body;
    const userId = req.user._id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ownership check — caller must own this order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized for this order" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Idempotency: this paymentId can only succeed once
    const existingTx = await Transaction.findOne({ paymentId: razorpayPaymentId });
    if (existingTx) {
      return res.status(200).json({
        success: true,
        message: "Payment already processed",
        transactionId: existingTx._id,
      });
    }

    const transaction = await Transaction.create({
      user: userId,
      order: order._id,
      paymentId: razorpayPaymentId,
      paymentMethod: "Razorpay",
      status: "success",
      amount: order.totalPrice,
      currency: "INR",
      email,
      paymentTime: new Date(),
    });

    order.isPaid = true;
    order.paidAt = new Date();
    order.transaction = transaction._id;
    await order.save();

    const sellerOrders = await SellerOrder.find({ _id: { $in: order.sellerOrders } });
    for (const sellerOrder of sellerOrders) {
      const sellerTransaction = await SellerTransaction.create({
        seller: sellerOrder.seller,
        sellerOrder: sellerOrder._id,
        paymentId: razorpayPaymentId,
        paymentMethod: "Razorpay",
        status: "success",
        amount: sellerOrder.totalPrice,
        currency: "INR",
        paymentTime: new Date(),
      });

      sellerOrder.isPaid = true;
      sellerOrder.paidAt = new Date();
      sellerOrder.transaction = sellerTransaction._id;
      await sellerOrder.save();
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify Razorpay payment" });
  }
};

// Get getTransactionById
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate([
      { path: "order", select: "totalPrice isPaid orderStatus paidAt" },
      { path: "user", select: "name email" },
    ]);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    // Ownership / role check — caller must own this transaction or be admin
    const isOwner = transaction.user?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this transaction" });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get transaction" });
  }
};

// Get all transactions (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 25, 100);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .populate([
          { path: "order", select: "totalPrice isPaid orderStatus paidAt" },
          { path: "user", select: "name email" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(),
    ]);

    res.json({
      success: true,
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get transactions" });
  }
};

// Delete Transaction (Admin)
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    await Transaction.findByIdAndDelete(id);
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

// Get all user transactions
export const getAllUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).populate([
      { path: "order", select: "totalPrice isPaid orderStatus paidAt" },
      { path: "user", select: "name email" },
    ]);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get user transactions" });
  }
};

// Get all transactions for a specific user (Admin)
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ user: userId }).populate([
      { path: "order", select: "totalPrice isPaid orderStatus paidAt" },
      { path: "user", select: "name email" },
    ]);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get user transactions" });
  }
};

// Update transaction status (Admin)
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    transaction.status = status;
    await transaction.save();
    res.json({ success: true, message: "Transaction status updated successfully", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update transaction status" });
  }
};

// Get seller transactions (Seller)
export const getSellerTransactions = async (req, res) => {
  try {
    const transactions = await SellerTransaction.find({ seller: req.user._id }).populate([
      { path: "sellerOrder", select: "totalPrice isPaid orderStatus paidAt" },
      { path: "seller", select: "name email" },
    ]);
    const totalSales = transactions.reduce((sum, tx) => {
      return tx.status === "success" ? sum + tx.amount : sum;
    }, 0);
    res.json({ success: true, transactions, totalSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get seller transactions" });
  }
};
