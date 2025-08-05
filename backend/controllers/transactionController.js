import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import SellerOrder from '../models/SellerOrder.js';

// Create Razorpay Order (Initiate Payment)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log('Creating Razorpay order for:', orderId);
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.isPaid) return res.status(400).json({ message: 'Order is already paid' });

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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId, email } = req.body;
    const userId = req.user._id;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

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
      user: userId,
      order: order._id,
      paymentId: razorpayPaymentId,
      paymentMethod: 'Razorpay',
      status: 'success',
      amount: order.totalPrice,
      currency: 'INR',
      email,
      paymentTime: new Date(),
      rawResponse: req.body,
    });

    // Update Order
    order.isPaid = true;
    order.paidAt = new Date();
    order.transaction = transaction._id;
    await order.save();

    // update SellerOrders if needed
    await SellerOrder.updateMany(
      { _id: { $in: order.sellerOrders } },
      { $set: { isPaid: true, paidAt: new Date() } }
    );

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

// Get getTransactionById
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id).populate([
      { path: 'order', select: 'totalPrice isPaid orderStatus paidAt' },
      { path: 'user', select: 'name email' },
    ]);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get transaction' });
  }
};

// Get all transactions (Admin)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate([
      { path: 'order', select: 'totalPrice isPaid orderStatus paidAt' },
      { path: 'user', select: 'name email' },
    ]);
    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get transactions' });
  }
};

// Delete Transaction (Admin)
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.remove();
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// Get all user transactions
export const getAllUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).populate([
      { path: 'order', select: 'totalPrice isPaid orderStatus paidAt' },
      { path: 'user', select: 'name email' },
    ]);
    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get user transactions' });
  }
};

// Get all transactions for a specific user (Admin)
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ user: userId }).populate([
      { path: 'order', select: 'totalPrice isPaid orderStatus paidAt' },
      { path: 'user', select: 'name email' },
    ]);
    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get user transactions' });
  }
};

// Update transaction status (Admin)
export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status;
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update transaction status' });
  }
}
