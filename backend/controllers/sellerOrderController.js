import SellerOrder from "../models/SellerOrder.js";
import Order from "../models/Order.js";

// @desc    Seller - Get all their orders
// @route   GET /api/seller-orders
// @access  Private (seller)
export const getSellerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of orders per page
    const skip = (page - 1) * limit;

    const totalOrders = await SellerOrder.countDocuments({
      seller: req.user._id,
    });
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await SellerOrder.find({ seller: req.user._id })
      .populate("seller", "name email")
      .populate({
        path: "order",
        populate: [
          { path: "user", select: "name email" },
          {
            path: "shippingAddress",
            select:
              "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
          },
        ],
        select: "shippingAddress paymentMethod totalPrice user isPaid",
      })
      .populate(
        "items.product",
        "name description brand price discountPrice images category isActive"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully",
      orders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in getSellerOrders:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller orders",
    });
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
          { path: "user", select: "name email" },
          {
            path: "shippingAddress",
            select:
              "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
          },
        ],
        select: "shippingAddress paymentMethod totalPrice user",
      })
      .populate(
        "items.product",
        "name description brand price discountPrice images category isActive"
      );

    if (!order || order.seller._id.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }
    res.json({
      order,
      success: true,
      message: "Seller order fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to fetch seller order",
      });
  }
};

// @desc    Seller - Update order item status
// @route   PUT /api/seller-orders/:id/item-status
// @access  Private (seller)
export const updateSellerOrderItemStatus = async (req, res) => {
  try {
    const { productId, status } = req.body;
    if (!productId || !status) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Product ID and status are required",
        });
    }

    const sellerOrder = await SellerOrder.findById(req.params.id);
    if (
      !sellerOrder ||
      sellerOrder.seller.toString() !== req.user._id.toString()
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }

    const orderItem = sellerOrder.items.find(
      (item) => item.product.toString() === productId
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in order" });
    }

    if (orderItem.isCancelled) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot update status of cancelled item",
        });
    }

    orderItem.orderStatus = status;
    if (status === "Delivered") {
      orderItem.isDelivered = true;
      orderItem.deliveredAt = new Date();
    }

    // Update corresponding main Order item
    const mainOrder = await Order.findById(sellerOrder.order);
    if (mainOrder) {
      const mainOrderItem = mainOrder.orderItems.find(
        (item) => item.product.toString() === productId
      );
      if (mainOrderItem) {
        mainOrderItem.orderStatus = status;
        if (status === "Delivered") {
          mainOrderItem.isDelivered = true;
          mainOrderItem.deliveredAt = new Date();
        }
        await mainOrder.save();
      }
    }

    await sellerOrder.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Order item status updated",
        order: sellerOrder,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order item status" });
  }
};

// @desc    Seller - Cancel order item
// @route   PUT /api/seller-orders/:id/cancel-item
// @access  Private (seller)
export const cancelSellerOrderItem = async (req, res) => {
  try {
    const { productId, reason } = req.body;
    if (!productId || !reason) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Product ID and cancellation reason are required",
        });
    }

    const sellerOrder = await SellerOrder.findById(req.params.id);
    if (
      !sellerOrder ||
      sellerOrder.seller._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }

    const orderItem = sellerOrder.items.find(
      (item) => item.product.toString() === productId
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in order" });
    }

    if (orderItem.isDelivered || orderItem.isCancelled) {
      return res
        .status(400)
        .json({ success: false, message: "Order item cannot be cancelled" });
    }

    // Update seller order item
    orderItem.cancellationReason = reason;
    orderItem.isCancelled = true;
    orderItem.cancelledAt = new Date();
    orderItem.orderStatus = "Cancelled";

    // Update corresponding main Order item
    const mainOrder = await Order.findById(sellerOrder.order);
    if (mainOrder) {
      const mainOrderItem = mainOrder.orderItems.find(
        (item) => item.product.toString() === productId
      );
      if (mainOrderItem) {
        mainOrderItem.cancellationReason = reason;
        mainOrderItem.isCancelled = true;
        mainOrderItem.cancelledAt = new Date();
        mainOrderItem.orderStatus = "Cancelled";
        await mainOrder.save();
      }
    }
    
    await sellerOrder.save();

    res.json({
      success: true,
      message: "Order item cancelled successfully",
      order: sellerOrder,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel order item" });
  }
};
