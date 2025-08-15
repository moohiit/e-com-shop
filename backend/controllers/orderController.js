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
    let calculatedItemsPrice = 0;
    let calculatedTaxPrice = 0;
    let calculatedTotalItemPrice = 0; // Sum of item.price * quantity (includes taxes)
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
      // Validate that the provided price matches the product's price (including taxes)
      if (item.price !== product.price) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch for: ${item.name}. Expected ₹${product.price}, got ₹${item.price}`,
        });
      }
      // Validate that provided actualPrice and taxes match product
      if (item.actualPrice !== product.actualPrice || item.taxes !== product.taxes) {
        return res.status(400).json({
          success: false,
          message: `Price details mismatch for: ${item.name}. Expected actualPrice=₹${product.actualPrice}, taxes=₹${product.taxes}`,
        });
      }
      calculatedItemsPrice += product.actualPrice * item.quantity;
      calculatedTaxPrice += product.taxes * item.quantity;
      calculatedTotalItemPrice += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    // Validate provided prices
    const expectedItemsPrice = Number(calculatedItemsPrice.toFixed(2));
    const expectedTaxPrice = Number(calculatedTaxPrice.toFixed(2));
    const expectedTotalPrice = Number(
      (calculatedTotalItemPrice + shippingPrice).toFixed(2)
    );

    if (
      expectedItemsPrice !== Number(itemsPrice.toFixed(2)) ||
      expectedTaxPrice !== Number(taxPrice.toFixed(2)) ||
      expectedTotalPrice !== Number(totalPrice.toFixed(2))
    ) {
      return res.status(400).json({
        success: false,
        message: `Price validation failed. Expected: itemsPrice=₹${expectedItemsPrice}, taxPrice=₹${expectedTaxPrice}, totalPrice=₹${expectedTotalPrice}`,
      });
    }

    // Create Main Order
    const order = new Order({
      user: req.user._id,
      orderItems: orderItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        actualPrice: item.actualPrice,
        taxes: item.taxes,
        taxPercentage: item.taxPercentage,
        seller: item.seller,
        orderStatus: "Processing",
        isCancelled: false,
        isDelivered: false,
      })),
      shippingAddress,
      shippingPrice,
      paymentMethod,
      itemsPrice,
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
      const sellerItemsPrice = sellerItems.reduce(
        (sum, item) => sum + item.actualPrice * item.quantity,
        0
      );
      const sellerTaxPrice = sellerItems.reduce(
        (sum, item) => sum + item.taxes * item.quantity,
        0
      );
      const sellerTotalPrice = Number(
        sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      );

      const sellerOrder = new SellerOrder({
        order: createdOrder._id,
        seller: sellerId,
        user: req.user._id,
        items: sellerItems.map((item) => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          actualPrice: item.actualPrice,
          taxes: item.taxes,
          taxPercentage: item.taxPercentage,
          orderStatus: "Processing",
          isCancelled: false,
          isDelivered: false,
        })),
        itemsPrice: sellerItemsPrice,
        taxPrice: sellerTaxPrice,
        totalPrice: sellerTotalPrice,
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
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of orders per page
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments({
      user: req.user._id,
    });
    const totalPages = Math.ceil(totalOrders / limit);

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
            select: "name email",
          },
        },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      totalPages,
      currentPage: page,
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
          select: "name email",
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
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of orders per page
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      totalPages,
      currentPage: page,
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

// 🚀 Buyer - Cancel Specific Order Item
export const cancelOrderItem = async (req, res) => {
  try {
    const { reason, productId } = req.body;
    if (!reason || !productId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cancellation reason and product ID are required",
        });
    }

    const order = await Order.findById(req.params.id);
    if (!order || order.user._id.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found or not authorized" });
    }

    // Find the order item to cancel
    const orderItem = order.orderItems.find(
      (item) => item.product.toString() === productId
    );
    if (!orderItem) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in order" });
    }

    // Check if the item is already delivered or cancelled
    if (orderItem.isDelivered || orderItem.isCancelled) {
      return res
        .status(400)
        .json({ success: false, message: "Order item cannot be cancelled" });
    }

    // Update order item status
    orderItem.cancellationReason = reason;
    orderItem.isCancelled = true;
    orderItem.cancelledAt = new Date();
    orderItem.orderStatus = "Cancelled";

    // Update corresponding SellerOrder item
    const sellerOrder = await SellerOrder.findOne({
      order: order._id,
      seller: orderItem.seller,
    });
    if (sellerOrder) {
      const sellerOrderItem = sellerOrder.items.find(
        (item) => item.product.toString() === productId
      );
      if (sellerOrderItem) {
        sellerOrderItem.cancellationReason = reason;
        sellerOrderItem.isCancelled = true;
        sellerOrderItem.cancelledAt = new Date();
        sellerOrderItem.orderStatus = "Cancelled";

        await sellerOrder.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      message: "Order item cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel order item" });
  }
};
