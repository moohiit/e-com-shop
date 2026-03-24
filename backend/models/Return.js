import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    refundAmount: { type: Number, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Refunded"],
      default: "Pending",
    },
    sellerNote: { type: String, trim: true, maxlength: 500 },
    refundId: { type: String }, // Razorpay refund ID
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

returnSchema.index({ order: 1, product: 1 }, { unique: true });
returnSchema.index({ seller: 1, status: 1 });
returnSchema.index({ user: 1 });

const Return = mongoose.model("Return", returnSchema);

export default Return;
