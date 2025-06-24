import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';
import Order from '../models/orderModel.js';
import Transaction from '../models/transactionModel.js';

// Create Razorpay Order (Initiate Payment)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.isPaid) return res.status(400).json({ message: 'Order is already paid' });

    // Create Razorpay Order
    const options = {
      amount: Math.round(order.totalPrice * 100), // Amount in paise
      currency: 'INR',
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
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

// Verify Razorpay Payment (After Frontend Confirmation)
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
      email,
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Signature Verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Save Transaction
    const transaction = await Transaction.create({
      order: order._id,
      paymentId: razorpayPaymentId,
      paymentMethod: 'Razorpay',
      status: 'success',
      amount: order.totalPrice,
      currency: 'INR',
      email: email,
      paymentTime: new Date(),
      rawResponse: req.body, // optional, saves all payment data
    });

    // Update Order
    order.isPaid = true;
    order.paidAt = new Date();
    order.transaction = transaction._id;
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to verify Razorpay payment' });
  }
};
