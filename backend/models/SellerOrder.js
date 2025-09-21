import mongoose from "mongoose";

const sellerOrderSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Final price including taxes
        basePrice: { type: Number, required: true }, // Base price without discount
        discountPercentage: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxPercentage: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        orderStatus: {
          type: String,
          enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
          default: "Processing",
        },
        isCancelled: { type: Boolean, default: false },
        cancelledAt: { type: Date },
        cancellationReason: { type: String },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
      },
    ],
    itemsPrice: { type: Number, required: true }, // Total base price
    totalDiscount: { type: Number, required: true, default: 0 }, // Total discount amount
    taxPrice: { type: Number, required: true }, // Total tax amount
    totalPrice: { type: Number, required: true }, // Final total

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  },
  { timestamps: true }
);

const SellerOrder = mongoose.model("SellerOrder", sellerOrderSchema);
export default SellerOrder;
