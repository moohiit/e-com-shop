import Order from "../models/Order.js";
import SellerOrder from "../models/SellerOrder.js";
import Product from "../models/Product.js";

// 🚀 Create Order with Seller Orders
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No order items" });
    }

    // Validate products and adjust stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${item.name}`,
        });
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
    orderItems.forEach((item) => {
      if (!sellerGroups[item.seller]) {
        sellerGroups[item.seller] = [];
      }
      sellerGroups[item.seller].push(item);
    });

    const sellerOrders = [];

    for (const sellerId in sellerGroups) {
      const sellerItems = sellerGroups[sellerId];
      const sellerTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const sellerOrder = new SellerOrder({
        order: createdOrder._id,
        seller: sellerId,
        user: req.user._id,
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

    res.status(201).json({
      order: createdOrder,
      message: "Order created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// 🚀 Get My Orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate([
        { path: "user", select: "name email" },
        {
          path: "shippingAddress",
          select:
            "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
        },
        {
          path: "orderItems.product",
          select:
            "name description brand price discountPrice images category isActive",
        },
        {
          path: "sellerOrders",
          populate: {
            path: "seller",
            select: "name email", // add any other fields you want
          },
        },
      ])
      .sort({ createdAt: -1 });

    res.json({
      orders,
      success: true,
      message: "My orders fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

// 🚀 Get Order by ID (Admin/User)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      { path: "user", select: "name email" },
      {
        path: "shippingAddress",
        select:
          "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
      },
      {
        path: "orderItems.product",
        select:
          "name description brand price discountPrice images category isActive",
      },
      {
        path: "sellerOrders",
        populate: {
          path: "seller",
          select: "name email", // add any other fields you want
        },
      },
    ]);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.json({ order, success: true, message: "Order fetched successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order",
    });
  }
};

// 🚀 Admin - Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate([
        { path: "user", select: "name email" },
        {
          path: "shippingAddress",
          select:
            "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
        },
        {
          path: "orderItems.product",
          select:
            "name description brand price discountPrice images category isActive",
        },
        { path: "sellerOrders" },
      ])
      .sort({ createdAt: -1 });
    res.json({
      orders,
      success: true,
      message: "All orders fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};


// 🚀 Admin - Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Delete all linked SellerOrders
    await SellerOrder.deleteMany({ _id: { $in: order.sellerOrders } });

    await order.remove();

    res.json({
      success: true,
      message: "Order and associated seller orders deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete order",
    });
  }
};


// @desc    Buyer - Cancel order by ID
// @route   PUT /api/orders/:id/cancel
// @access  Private (buyer)
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }
    const order = await SellerOrder.findById(req.params.id);

    if (!order || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: "Order not found or not authorized" });
    }

    // Check if the order is already delivered or cancelled
    if (order.isDelivered || order.isCancelled) {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
    }

    // Update order status
    order.cancellationReason = reason;
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.orderStatus = "Cancelled"; // Update order status to Cancelled
    order.isPaid = false; // Mark as not paid if cancelled
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
};