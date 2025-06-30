import Order from '../models/Order.js';
import SellerOrder from '../models/SellerOrder.js';
import Product from '../models/Product.js';

// 🚀 Create Order with Seller Orders
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Validate products and adjust stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for: ${item.name}` });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Create Main Order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Create Seller Orders
    const sellerGroups = {};
    orderItems.forEach(item => {
      if (!sellerGroups[item.seller]) {
        sellerGroups[item.seller] = [];
      }
      sellerGroups[item.seller].push(item);
    });

    const sellerOrders = [];

    for (const sellerId in sellerGroups) {
      const sellerItems = sellerGroups[sellerId];
      const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const sellerOrder = new SellerOrder({
        order: createdOrder._id,
        seller: sellerId,
        items: sellerItems,
        itemsPrice: sellerTotal,
        shippingPrice: 0, // Optional: Add shipping split logic per seller
        taxPrice: 0,
        totalPrice: sellerTotal, // Adjust if adding shipping/tax
      });

      const savedSellerOrder = await sellerOrder.save();
      sellerOrders.push(savedSellerOrder._id);
    }

    // Link seller orders to main order
    createdOrder.sellerOrders = sellerOrders;
    await createdOrder.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// 🚀 Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate([
        { path: 'user', select: 'name email' },
        { path: 'shippingAddress', select: 'fullName address city postalCode country' },
        { path: 'orderItems.product', select: 'name price' },
        { path: 'sellerOrders' }
      ])
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// 🚀 Get Order by ID (Admin/User)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'user', select: 'name email' },
        { path: 'shippingAddress', select: 'fullName address city postalCode country' },
        { path: 'orderItems.product', select: 'name price' },
        { path: 'sellerOrders' }
      ]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

// 🚀 Admin - Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate([
        { path: 'user', select: 'name email' },
        { path: 'shippingAddress', select: 'fullName address city postalCode country' },
        { path: 'orderItems.product', select: 'name price' },
        { path: 'sellerOrders' }
      ])
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// 🚀 Update Order to Paid
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();

    await order.save();

    // Optionally, mark all SellerOrders as paid
    await SellerOrder.updateMany(
      { _id: { $in: order.sellerOrders } },
      { $set: { isPaid: true, paidAt: new Date() } }
    );

    res.json({ message: 'Order marked as paid', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// 🚀 Admin - Update Order to Delivered
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.orderStatus = 'Delivered';

    await order.save();

    // Optionally, mark all SellerOrders as delivered
    await SellerOrder.updateMany(
      { _id: { $in: order.sellerOrders } },
      { $set: { isDelivered: true, deliveredAt: new Date(), orderStatus: 'Delivered' } }
    );

    res.json({ message: 'Order marked as delivered', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// 🚀 Admin - Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete all linked SellerOrders
    await SellerOrder.deleteMany({ _id: { $in: order.sellerOrders } });

    await order.remove();

    res.json({ message: 'Order and associated seller orders deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};
