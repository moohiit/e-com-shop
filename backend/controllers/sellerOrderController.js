// SellerOrder Controller
import SellerOrder from '../models/SellerOrder.js';

// @desc    Seller - Get all their orders
// @route   GET /api/seller-orders
// @access  Private (seller)
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await SellerOrder.find({ seller: req.user._id })
      .populate('seller', 'name email')
      .populate({
        path: 'order',
        populate: [
          { path: 'user', select: 'name email' }, // This will populate user inside order
          { path: 'shippingAddress', select: 'fullName address city postalCode country' } // Optional: if you want address details
        ],
        select: 'shippingAddress paymentMethod totalPrice user', // Fields from Order you need
      })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error in getSellerOrders:", error);
    res.status(500).json({ message: 'Failed to fetch seller orders' });
  }
};


// @desc    Seller - Get single order
// @route   GET /api/seller-orders/:id
// @access  Private (seller)
export const getSellerOrderById = async (req, res) => {
  try {
    const order = await SellerOrder.findById(req.params.id).populate('seller', 'name email')
      .populate({
        path: 'order',
        populate: [
          { path: 'user', select: 'name email' }, // This will populate user inside order
          { path: 'shippingAddress', select: 'fullName address city postalCode country' } // Optional: if you want address details
        ],
        select: 'shippingAddress paymentMethod totalPrice user', // Fields from Order you need
      })
      .populate('items.product', 'name price');

    if (!order || order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch seller order' });
  }
};

// @desc    Seller - Update order status
// @route   PUT /api/seller-orders/:id/status
// @access  Private (seller)
export const updateSellerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await SellerOrder.findById(req.params.id);

    if (!order || order.seller.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};
