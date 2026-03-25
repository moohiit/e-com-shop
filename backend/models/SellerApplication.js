import mongoose from "mongoose";

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      enum: ["individual", "company", "partnership"],
      required: true,
    },
    businessAddress: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    gstNumber: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminNote: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// One active application per user
sellerApplicationSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { status: "Pending" } }
);

const SellerApplication = mongoose.model("SellerApplication", sellerApplicationSchema);
export default SellerApplication;
