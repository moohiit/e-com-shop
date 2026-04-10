import { razorpayInstance } from "../config/razorpay.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";

/**
 * Process a Razorpay refund for a given order item.
 * `actor` is the authenticated user requesting the refund — must be the
 * buyer who owns the order, an admin, or a seller of items in the order.
 * Returns { success, refundId } or { success: false, message }.
 */
export const processRefund = async (orderId, refundAmount, actor = null) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return { success: false, message: "Order not found" };
    if (!order.isPaid) return { success: false, message: "Order is not paid" };

    // Authorization: actor must be buyer / admin / a seller in this order
    if (actor) {
      const isBuyer = order.user.toString() === actor._id.toString();
      const isAdmin = actor.role === "admin";
      const isOrderSeller = order.orderItems?.some(
        (it) => it.seller?.toString() === actor._id.toString()
      );
      if (!isBuyer && !isAdmin && !isOrderSeller) {
        return { success: false, message: "Not authorized to refund this order" };
      }
    }

    if (!refundAmount || refundAmount <= 0) {
      return { success: false, message: "Invalid refund amount" };
    }
    if (refundAmount > order.totalPrice + 0.01) {
      return { success: false, message: "Refund amount exceeds order total" };
    }
    if (order.paymentMethod === "Cash on Delivery") {
      // COD: no gateway refund. Track as pending bank transfer.
      return {
        success: true,
        refundId: `COD_REFUND_${Date.now()}`,
        method: "bank_transfer",
        message: "Refund will be credited to your bank account within 5-7 business days. Our team will contact you for bank details if not already on file.",
      };
    }

    const transaction = await Transaction.findOne({
      order: orderId,
      status: "success",
    });
    if (!transaction) {
      return { success: false, message: "No successful transaction found" };
    }

    const refund = await razorpayInstance.payments.refund(
      transaction.paymentId,
      {
        amount: Math.round(refundAmount * 100), // paise
        speed: "normal",
      }
    );

    return {
      success: true,
      refundId: refund.id,
      method: "original_payment",
      message: "Refund will be credited to your original payment method within 5-7 business days.",
    };
  } catch (error) {
    console.error("Razorpay refund error:", error);
    return {
      success: false,
      message: error.error?.description || error.message || "Refund failed",
    };
  }
};
