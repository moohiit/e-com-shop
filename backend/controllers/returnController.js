import mongoose from "mongoose";
import Return from "../models/Return.js";
import Order from "../models/Order.js";
import SellerOrder from "../models/SellerOrder.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { processRefund } from "./refundController.js";
import sendEmail from "../utils/sendEmail.js";
import { orderCancelledEmail } from "../utils/emailTemplates.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ---------- User: Create Return Request ---------- */
export const createReturnRequest = async (req, res) => {
  try {
    const { orderId, productId, reason } = req.body;

    if (!orderId || !productId || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID, product ID, and reason are required." });
    }

    if (!isValidObjectId(orderId) || !isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order or product ID." });
    }

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const orderItem = order.orderItems.find(
      (item) => item.product.toString() === productId
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in order." });
    }

    if (!orderItem.isDelivered) {
      return res
        .status(400)
        .json({ success: false, message: "Item must be delivered before requesting a return." });
    }

    if (orderItem.isCancelled) {
      return res
        .status(400)
        .json({ success: false, message: "Item is already cancelled." });
    }

    // Check 7-day return window
    const deliveredAt = new Date(orderItem.deliveredAt);
    const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res
        .status(400)
        .json({ success: false, message: "Return window has expired (7 days after delivery)." });
    }

    // Check for existing return request
    const existing = await Return.findOne({ order: orderId, product: productId });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "A return request already exists for this item." });
    }

    const refundAmount = orderItem.price * orderItem.quantity;

    const returnRequest = await Return.create({
      order: orderId,
      user: req.user._id,
      seller: orderItem.seller,
      product: productId,
      itemName: orderItem.name,
      quantity: orderItem.quantity,
      refundAmount,
      reason,
    });

    res.status(201).json({ success: true, returnRequest });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "A return request already exists for this item." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- User: Get My Return Requests ---------- */
export const getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id })
      .populate("product", "name images")
      .populate("order", "_id createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Seller: Get Return Requests ---------- */
export const getSellerReturns = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { seller: req.user._id };
    if (status) query.status = status;

    const returns = await Return.find(query)
      .populate("product", "name images")
      .populate("user", "name email")
      .populate("order", "_id createdAt paymentMethod isPaid")
      .sort({ createdAt: -1 });

    res.json({ success: true, returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Seller: Approve Return ---------- */
export const approveReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerNote } = req.body;

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found." });
    }

    if (returnRequest.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (returnRequest.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Return request is not pending." });
    }

    // Process refund
    const refundResult = await processRefund(
      returnRequest.order,
      returnRequest.refundAmount
    );

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: `Refund failed: ${refundResult.message}`,
      });
    }

    returnRequest.status = "Refunded";
    returnRequest.refundId = refundResult.refundId;
    returnRequest.sellerNote = sellerNote || "";
    returnRequest.resolvedAt = new Date();
    await returnRequest.save();

    // Update order item status to Cancelled (returned)
    const order = await Order.findById(returnRequest.order);
    if (order) {
      const orderItem = order.orderItems.find(
        (item) => item.product.toString() === returnRequest.product.toString()
      );
      if (orderItem) {
        orderItem.isCancelled = true;
        orderItem.cancelledAt = new Date();
        orderItem.cancellationReason = `Return approved: ${returnRequest.reason}`;
        orderItem.orderStatus = "Cancelled";
        await order.save();
      }

      // Update seller order
      const sellerOrder = await SellerOrder.findOne({
        order: order._id,
        seller: returnRequest.seller,
      });
      if (sellerOrder) {
        const sellerItem = sellerOrder.items.find(
          (item) => item.product.toString() === returnRequest.product.toString()
        );
        if (sellerItem) {
          sellerItem.isCancelled = true;
          sellerItem.cancelledAt = new Date();
          sellerItem.cancellationReason = `Return approved: ${returnRequest.reason}`;
          sellerItem.orderStatus = "Cancelled";
          await sellerOrder.save();
        }
      }

      // Restore product stock
      const product = await Product.findById(returnRequest.product);
      if (product) {
        product.stock += returnRequest.quantity;
        await product.save();
      }

      // Send email to buyer
      try {
        const buyer = await User.findById(returnRequest.user).select("name email");
        if (buyer?.email) {
          const { subject, html } = orderCancelledEmail(
            order,
            buyer.name,
            returnRequest.itemName,
            `Return approved — refund of ₹${returnRequest.refundAmount.toFixed(2)} will be processed`
          );
          await sendEmail(buyer.email, subject, html);
        }
      } catch (emailErr) {
        console.error("Return approval email failed:", emailErr.message);
      }
    }

    res.json({ success: true, returnRequest, message: "Return approved and refund processed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Seller: Reject Return ---------- */
export const rejectReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerNote } = req.body;

    if (!sellerNote) {
      return res.status(400).json({ success: false, message: "Rejection reason is required." });
    }

    const returnRequest = await Return.findById(id);
    if (!returnRequest) {
      return res.status(404).json({ success: false, message: "Return request not found." });
    }

    if (returnRequest.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (returnRequest.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Return request is not pending." });
    }

    returnRequest.status = "Rejected";
    returnRequest.sellerNote = sellerNote;
    returnRequest.resolvedAt = new Date();
    await returnRequest.save();

    res.json({ success: true, returnRequest, message: "Return request rejected." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Admin: Get All Returns ---------- */
export const getAllReturns = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const returns = await Return.find(query)
      .populate("product", "name images")
      .populate("user", "name email")
      .populate("seller", "name email")
      .populate("order", "_id createdAt paymentMethod isPaid")
      .sort({ createdAt: -1 });

    res.json({ success: true, returns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
