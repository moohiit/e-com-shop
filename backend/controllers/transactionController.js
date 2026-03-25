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

    // 2. Validate products and adjust stock (same logic as createOrder)
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, totalDiscount, shippingPrice, taxPrice, totalPrice } = orderData;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${item.name}. Available: ${product.stock}`,
        });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // 3. Create DB Order
    const order = new Order({
      user: userId,
      orderItems: orderItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        basePrice: item.basePrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxPercentage: item.taxPercentage,
        taxAmount: item.taxAmount,
        seller: item.seller,
        orderStatus: "Processing",
        isCancelled: false,
        isDelivered: false,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      totalDiscount,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
    });

    const createdOrder = await order.save();

    // 4. Create Seller Orders
    const sellerGroups = {};
    orderItems.forEach((item) => {
      if (!sellerGroups[item.seller]) sellerGroups[item.seller] = [];
      sellerGroups[item.seller].push(item);
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
        itemsPrice: sellerItemsPrice,
        totalDiscount: sellerTotalDiscount,
        taxPrice: sellerTaxPrice,
        totalPrice: sellerTotalPrice,
        isPaid: true,
        paidAt: new Date(),
      });

      const savedSellerOrder = await sellerOrder.save();
      sellerOrderIds.push(savedSellerOrder._id);

      // Create seller transaction
      await SellerTransaction.create({
        seller: sellerId,
        sellerOrder: savedSellerOrder._id,
        paymentId: razorpayPaymentId,
        paymentMethod: "Razorpay",
        status: "success",
        amount: sellerTotalPrice,
        currency: "INR",
        paymentTime: new Date(),
        rawResponse: req.body,
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
      amount: totalPrice,
      currency: "INR",
      email,
      paymentTime: new Date(),
      rawResponse: req.body,
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
    res.status(500).json({ message: error.message || "Failed to verify payment and create order" });
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

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
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
      rawResponse: req.body,
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
        rawResponse: req.body,
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
    res.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get transaction" });
  }
};

// Get all transactions (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate([
      { path: "order", select: "totalPrice isPaid orderStatus paidAt" },
      { path: "user", select: "name email" },
    ]);
    res.json({ success: true, transactions });
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
