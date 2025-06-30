import mongoose from 'mongoose';

const sellerOrderSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    orderStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },

    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // Seller-specific payment
  },
  { timestamps: true }
);

const SellerOrder = mongoose.model('SellerOrder', sellerOrderSchema);
export default SellerOrder;
