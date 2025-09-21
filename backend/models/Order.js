import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderItems: [
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
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
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

    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    paymentMethod: { type: String, required: true }, // COD, Razorpay, etc.
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },

    itemsPrice: { type: Number, required: true }, // Total base price
    totalDiscount: { type: Number, required: true, default: 0 }, // Total discount amount
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true }, // Total tax amount
    totalPrice: { type: Number, required: true }, // Final total

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    sellerOrders: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SellerOrder" },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
