import SellerOrder from "../models/SellerOrder.js";
import Order from "../models/Order.js";

// 🚀 Seller - Get all their orders
export const getSellerOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
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
      .populate({
        path: "items.product",
        select:
          "name description brand basePrice discountPercentage taxPercentage images categories isActive",
        populate: {
          path: "categories",
          select: "name slug",
        },
      })
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
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller orders",
    });
  }
};

// 🚀 Seller - Get single order
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
      .populate({
        path: "items.product",
        select:
          "name description brand basePrice discountPercentage taxPercentage images categories isActive",
        populate: {
          path: "categories",
          select: "name slug",
        },
      });

    if (!order || order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    res.json({
      order,
      success: true,
      message: "Seller order fetched successfully",
    });
  } catch (error) {
    console.error("Get seller order by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller order",
    });
  }
};

// 🚀 Seller - Update order item status
export const updateSellerOrderItemStatus = async (req, res) => {
  try {
    const { productId, status } = req.body;

    if (!productId || !status) {
      return res.status(400).json({
        success: false,
        message: "Product ID and status are required",
      });
    }

    const sellerOrder = await SellerOrder.findById(req.params.id);

    if (
      !sellerOrder ||
      sellerOrder.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    const orderItem = sellerOrder.items.find(
      (item) => item.product.toString() === productId
    );

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in order",
      });
    }

    if (orderItem.isCancelled) {
      return res.status(400).json({
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

    res.status(200).json({
      success: true,
      message: "Order item status updated",
      order: sellerOrder,
    });
  } catch (error) {
    console.error("Update seller order item status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order item status",
    });
  }
};

// 🚀 Seller - Cancel order item
export const cancelSellerOrderItem = async (req, res) => {
  try {
    const { productId, reason } = req.body;

    if (!productId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Product ID and cancellation reason are required",
      });
    }

    const sellerOrder = await SellerOrder.findById(req.params.id);

    if (
      !sellerOrder ||
      sellerOrder.seller._id.toString() !== req.user._id.toString()
    ) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not authorized",
      });
    }

    const orderItem = sellerOrder.items.find(
      (item) => item.product.toString() === productId
    );

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in order",
      });
    }

    if (orderItem.isDelivered || orderItem.isCancelled) {
      return res.status(400).json({
        success: false,
        message: "Order item cannot be cancelled",
      });
    }

    // Update seller order item
    orderItem.cancellationReason = reason;
    orderItem.isCancelled = true;
    orderItem.cancelledAt = new Date();
    orderItem.orderStatus = "Cancelled";

    // Restore product stock
    const product = await Product.findById(productId);
    if (product) {
      product.stock += orderItem.quantity;
      await product.save();
    }

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
    console.error("Cancel seller order item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order item",
    });
  }
};