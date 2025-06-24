import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentId: { type: String, required: true }, // From payment gateway
    paymentMethod: { type: String, required: true }, // Stripe, Razorpay, PayPal, etc.
    status: { type: String, required: true }, // success, pending, failed
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    email: { type: String }, // Payer’s email
    paymentTime: { type: Date, default: Date.now },
    rawResponse: { type: Object }, // Save full gateway response (optional but useful)
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
