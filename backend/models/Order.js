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
        price: { type: Number, required: true },
        actualPrice: { type: Number, required: true },
        taxes: { type: Number, required: true },
        taxPercentage: { type: Number, default: 0 },
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

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    sellerOrders: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SellerOrder" },
    ], // New Field
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
