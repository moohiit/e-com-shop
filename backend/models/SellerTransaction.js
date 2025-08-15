import mongoose from "mongoose";

const sellerTransactionSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerOrder",
      required: true,
    },
    paymentId: { type: String, required: true }, // From payment gateway
    paymentMethod: { type: String, required: true }, // Stripe, Razorpay, PayPal, etc.
    status: { type: String, required: true }, // success, pending, failed
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentTime: { type: Date, default: Date.now },
    rawResponse: { type: Object }, // Save full gateway response (optional but useful)
  },
  { timestamps: true }
);

const SellerTransaction = mongoose.model(
  "SellerTransaction",
  sellerTransactionSchema
);

export default SellerTransaction;
