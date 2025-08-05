// SellerOrder Controller
import SellerOrder from "../models/SellerOrder.js";

// @desc    Seller - Get all their orders
// @route   GET /api/seller-orders
// @access  Private (seller)
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await SellerOrder.find({ seller: req.user._id })
      .populate("seller", "name email")
      .populate({
        path: "order",
        populate: [
          { path: "user", select: "name email" }, // This will populate user inside order
          {
            path: "shippingAddress",
            select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
          }, // Optional: if you want address details
        ],
        select: "shippingAddress paymentMethod totalPrice user", // Fields from Order you need
      })
      .populate("items.product", "name description brand price discountPrice images category isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error in getSellerOrders:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Failed to fetch seller orders" });
  }
};

// @desc    Seller - Get single order
// @route   GET /api/seller-orders/:id
// @access  Private (seller)
export const getSellerOrderById = async (req, res) => {
  try {
    const order = await SellerOrder.findById(req.params.id)
      .populate("seller", "name email")
      .populate({
        path: "order",
        populate: [
          { path: "user", select: "name email" }, // This will populate user inside order
          {
            path: "shippingAddress",
            select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
          }, // Optional: if you want address details
        ],
        select: "shippingAddress paymentMethod totalPrice user", // Fields from Order you need
      })
      .populate("items.product", "name description brand price discountPrice images category isActive");

    if (!order || order.seller._id.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }
    res.json({ order, success: true, message: "Seller order fetched successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch seller order" });
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
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }

    order.orderStatus = status;
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

// @desc    Seller - Cancel order
// @route   PUT /api/seller-orders/:id/cancel
export const cancelSellerOrder = async (req, res) => {
  try {
    if (!req.body.reason) {
      return res.status(400).json({ success: false, message: "Cancellation reason is required" });
    }
    const order = await SellerOrder.findById(req.params.id);

    if (!order || order.seller._id.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }

    // Check if the order is already delivered or cancelled
    if (order.isDelivered || order.isCancelled) {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled" });
    }

    // Update order status
    order.cancellationReason = req.body.reason;
    order.isCancelled = true;
    order.cancelledAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
};



