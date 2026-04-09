import Order from "../models/Order.js";
import SellerOrder from "../models/SellerOrder.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import { orderConfirmationEmail, orderCancelledEmail } from "../utils/emailTemplates.js";
import { processRefund } from "./refundController.js";

// Server-side shipping rule (single source of truth)
const computeShipping = (itemsTotalAfterTax) => (itemsTotalAfterTax > 500 ? 0 : 50);

// 🚀 Create Order with Seller Orders
export const createOrder = async (req, res) => {
  const stockAdjustments = [];
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items" });
    }

    // Server-side recompute of all monetary fields. Client-supplied prices are ignored.
    let calculatedItemsPrice = 0;
    let calculatedTotalDiscount = 0;
    let calculatedTaxPrice = 0;
    let calculatedItemsTotal = 0;
    const normalizedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found` });
      }

      // Atomic conditional decrement to prevent oversell race
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

    const shippingPrice = computeShipping(calculatedItemsTotal);
    const calculatedTotalPrice = +(calculatedItemsTotal + shippingPrice).toFixed(2);

    // Create Main Order
    const order = new Order({
      user: req.user._id,
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
      shippingPrice,
      taxPrice: +calculatedTaxPrice.toFixed(2),
      totalPrice: calculatedTotalPrice,
    });

    const createdOrder = await order.save();

    // Create Seller Orders
    const sellerGroups = {};
    normalizedItems.forEach((item) => {
      const key = item.seller.toString();
      if (!sellerGroups[key]) {
        sellerGroups[key] = [];
      }
      sellerGroups[key].push(item);
    });

    const sellerOrders = [];

    for (const sellerId in sellerGroups) {
      const sellerItems = sellerGroups[sellerId];
      
      const sellerItemsPrice = sellerItems.reduce(
        (sum, item) => sum + item.basePrice * item.quantity,
        0
      );
      
      const sellerTotalDiscount = sellerItems.reduce(
        (sum, item) => sum + item.discountAmount * item.quantity,
        0
      );
      
      const sellerTaxPrice = sellerItems.reduce(
        (sum, item) => sum + item.taxAmount * item.quantity,
        0
      );
      
      const sellerTotalPrice = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const sellerOrder = new SellerOrder({
        order: createdOrder._id,
        seller: sellerId,
        user: req.user._id,
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
      });

      const savedSellerOrder = await sellerOrder.save();
      sellerOrders.push(savedSellerOrder._id);
    }

    // Link seller orders to main order
    createdOrder.sellerOrders = sellerOrders;
    await createdOrder.save();

    // Send order confirmation email
    try {
      const user = await User.findById(req.user._id).select("name email");
      if (user?.email) {
        const { subject, html } = orderConfirmationEmail(createdOrder, user.name);
        await sendEmail(user.email, subject, html);
      }
    } catch (emailErr) {
      console.error("Order confirmation email failed:", emailErr.message);
    }

    res.status(201).json({
      order: createdOrder,
      message: "Order created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    // Best-effort rollback of any stock we already decremented
    for (const adj of stockAdjustments) {
      try {
        await Product.findByIdAndUpdate(adj.id, { $inc: { stock: adj.qty } });
      } catch (rbErr) {
        console.error("Stock rollback failed for", adj.id, rbErr.message);
      }
    }
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// 🚀 Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalOrders = await Order.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({ user: req.user._id })
      .populate([
        { path: "user", select: "name email" },
        {
          path: "shippingAddress",
          select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
        },
        {
          path: "orderItems.product",
          select: "name description brand basePrice discountPercentage taxPercentage images categories isActive",
          populate: {
            path: "categories",
            select: "name slug",
          },
        },
        {
          path: "sellerOrders",
          populate: {
            path: "seller",
            select: "name email",
          },
        },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      totalPages,
      currentPage: page,
      success: true,
      message: "My orders fetched successfully",
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// 🚀 Get Order by ID (Admin/User)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      { path: "user", select: "name email" },
      {
        path: "shippingAddress",
        select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
      },
      {
        path: "orderItems.product",
        select: "name description brand basePrice discountPercentage taxPercentage images categories isActive",
        populate: {
          path: "categories",
          select: "name slug",
        },
      },
      {
        path: "sellerOrders",
        populate: {
          path: "seller",
          select: "name email",
        },
      },
    ]);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ order, success: true, message: "Order fetched successfully" });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// 🚀 Admin - Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find()
      .populate([
        { path: "user", select: "name email" },
        {
          path: "shippingAddress",
          select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
        },
        {
          path: "orderItems.product",
          select: "name description brand basePrice discountPercentage taxPercentage images categories isActive",
          populate: {
            path: "categories",
            select: "name slug",
          },
        },
        { 
          path: "sellerOrders",
          populate: {
            path: "seller",
            select: "name email",
          },
        },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      totalPages,
      currentPage: page,
      success: true,
      message: "All orders fetched successfully",
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// 🚀 Admin - Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Restore product stock before deleting
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Delete all linked SellerOrders
    await SellerOrder.deleteMany({ _id: { $in: order.sellerOrders } });

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order and associated seller orders deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete order",
    });
  }
};

// 🚀 Buyer - Cancel Specific Order Item
export const cancelOrderItem = async (req, res) => {
  try {
    const { reason, productId } = req.body;
    
    if (!reason || !productId) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason and product ID are required",
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found or not authorized" 
      });
    }

    // Find the order item to cancel
    const orderItem = order.orderItems.find(
      (item) => item.product.toString() === productId
    );
    
    if (!orderItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found in order" 
      });
    }

    // Check if the item is already delivered or cancelled
    if (orderItem.isDelivered || orderItem.isCancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Order item cannot be cancelled" 
      });
    }

    // Update order item status
    orderItem.cancellationReason = reason;
    orderItem.isCancelled = true;
    orderItem.cancelledAt = new Date();
    orderItem.orderStatus = "Cancelled";

    // Restore product stock
    const product = await Product.findById(productId);
    if (product) {
      product.stock += orderItem.quantity;
      await product.save();
    }

    // Update corresponding SellerOrder item
    const sellerOrder = await SellerOrder.findOne({
      order: order._id,
      seller: orderItem.seller,
    });
    
    if (sellerOrder) {
      const sellerOrderItem = sellerOrder.items.find(
        (item) => item.product.toString() === productId
      );
      
      if (sellerOrderItem) {
        sellerOrderItem.cancellationReason = reason;
        sellerOrderItem.isCancelled = true;
        sellerOrderItem.cancelledAt = new Date();
        sellerOrderItem.orderStatus = "Cancelled";
        await sellerOrder.save();
      }
    }

    await order.save();

    // Auto-refund for paid online orders.
    // Refund = item value (price * qty). If this cancellation is the LAST active
    // item in the order, also refund the shipping charge (the order is fully cancelled).
    let refundInfo = null;
    if (order.isPaid && order.paymentMethod !== "Cash on Delivery") {
      let refundAmount = orderItem.price * orderItem.quantity;
      const stillActive = order.orderItems.some((it) => !it.isCancelled);
      if (!stillActive) {
        refundAmount += order.shippingPrice || 0;
      }
      refundAmount = +refundAmount.toFixed(2);
      const result = await processRefund(order._id, refundAmount, req.user);
      refundInfo = result.success
        ? { refunded: true, refundId: result.refundId, amount: refundAmount }
        : { refunded: false, message: result.message };
    }

    // Send cancellation email
    try {
      const user = await User.findById(req.user._id).select("name email");
      if (user?.email) {
        const { subject, html } = orderCancelledEmail(
          order, user.name, orderItem.name, reason
        );
        await sendEmail(user.email, subject, html);
      }
    } catch (emailErr) {
      console.error("Cancellation email failed:", emailErr.message);
    }

    res.json({
      success: true,
      message: "Order item cancelled successfully",
      order,
      refund: refundInfo,
    });
  } catch (error) {
    console.error("Cancel order item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order item"
    });
  }
};