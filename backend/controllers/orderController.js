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
      totalDiscount,
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
    let calculatedTotalDiscount = 0;
    let calculatedTaxPrice = 0;
    let calculatedTotalPrice = 0;
    
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
          message: `Insufficient stock for: ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
      
      // Calculate expected values based on product data
      const expectedBasePrice = product.basePrice;
      const expectedDiscountAmount = product.discountAmount;
      const expectedTaxAmount = product.taxAmount;
      const expectedFinalPrice = product.finalPrice;
      
      // Validate provided prices match product calculations
      if (item.basePrice !== expectedBasePrice) {
        return res.status(400).json({
          success: false,
          message: `Base price mismatch for: ${item.name}. Expected ₹${expectedBasePrice}, got ₹${item.basePrice}`,
        });
      }
      
      if (item.price !== expectedFinalPrice) {
        return res.status(400).json({
          success: false,
          message: `Final price mismatch for: ${item.name}. Expected ₹${expectedFinalPrice}, got ₹${item.price}`,
        });
      }
      
      // Update calculated totals
      calculatedItemsPrice += expectedBasePrice * item.quantity;
      calculatedTotalDiscount += expectedDiscountAmount * item.quantity;
      calculatedTaxPrice += expectedTaxAmount * item.quantity;
      calculatedTotalPrice += expectedFinalPrice * item.quantity;
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Add shipping price to calculated total
    calculatedTotalPrice += shippingPrice;

    // Validate provided prices match calculations
    const tolerance = 0.01; // Allow for small rounding differences
    
    if (Math.abs(calculatedItemsPrice - itemsPrice) > tolerance) {
      return res.status(400).json({
        success: false,
        message: `Items price validation failed. Expected: ₹${calculatedItemsPrice.toFixed(2)}, Got: ₹${itemsPrice.toFixed(2)}`,
      });
    }
    
    if (Math.abs(calculatedTotalDiscount - totalDiscount) > tolerance) {
      return res.status(400).json({
        success: false,
        message: `Discount validation failed. Expected: ₹${calculatedTotalDiscount.toFixed(2)}, Got: ₹${totalDiscount.toFixed(2)}`,
      });
    }
    
    if (Math.abs(calculatedTaxPrice - taxPrice) > tolerance) {
      return res.status(400).json({
        success: false,
        message: `Tax validation failed. Expected: ₹${calculatedTaxPrice.toFixed(2)}, Got: ₹${taxPrice.toFixed(2)}`,
      });
    }
    
    if (Math.abs(calculatedTotalPrice - totalPrice) > tolerance) {
      return res.status(400).json({
        success: false,
        message: `Total price validation failed. Expected: ₹${calculatedTotalPrice.toFixed(2)}, Got: ₹${totalPrice.toFixed(2)}`,
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
        basePrice: item.basePrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        taxPercentage: item.taxPercentage,
        taxAmount: item.taxAmount,
        seller: item.seller,
        orderStatus: "Processing",
        isCancelled: false,
        isDelivered: false,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      totalDiscount,
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
      
      const sellerItemsPrice = sellerItems.reduce(
        (sum, item) => sum + item.basePrice * item.quantity,
        0
      );
      
      const sellerTotalDiscount = sellerItems.reduce(
        (sum, item) => sum + item.discountAmount * item.quantity,
        0
      );
      
      const sellerTaxPrice = sellerItems.reduce(
        (sum, item) => sum + item.taxAmount * item.quantity,
        0
      );
      
      const sellerTotalPrice = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
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
          basePrice: item.basePrice,
          discountPercentage: item.discountPercentage,
          discountAmount: item.discountAmount,
          taxPercentage: item.taxPercentage,
          taxAmount: item.taxAmount,
          orderStatus: "Processing",
          isCancelled: false,
          isDelivered: false,
        })),
        itemsPrice: sellerItemsPrice,
        totalDiscount: sellerTotalDiscount,
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
    console.error("Order creation error:", error);
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
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalOrders = await Order.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({ user: req.user._id })
      .populate([
        { path: "user", select: "name email" },
        {
          path: "shippingAddress",
          select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
        },
        {
          path: "orderItems.product",
          select: "name description brand basePrice discountPercentage taxPercentage images categories isActive",
          populate: {
            path: "categories",
            select: "name slug",
          },
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
    console.error("Get my orders error:", error);
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
        select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
      },
      {
        path: "orderItems.product",
        select: "name description brand basePrice discountPercentage taxPercentage images categories isActive",
        populate: {
          path: "categories",
          select: "name slug",
        },
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
    console.error("Get order by ID error:", error);
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
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find()
      .populate([
        { path: "user", select: "name email" },
        {
          path: "shippingAddress",
          select: "fullName mobileNumber pincode city state locality flatOrBuilding landmark addressType",
        },
        {
          path: "orderItems.product",
          select: "name description brand basePrice discountPercentage taxPercentage images categories isActive",
          populate: {
            path: "categories",
            select: "name slug",
          },
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
      message: "All orders fetched successfully",
    });
  } catch (error) {
    console.error("Get all orders error:", error);
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

    // Restore product stock before deleting
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Delete all linked SellerOrders
    await SellerOrder.deleteMany({ _id: { $in: order.sellerOrders } });

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order and associated seller orders deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
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
      return res.status(400).json({
        success: false,
        message: "Cancellation reason and product ID are required",
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found or not authorized" 
      });
    }

    // Find the order item to cancel
    const orderItem = order.orderItems.find(
      (item) => item.product.toString() === productId
    );
    
    if (!orderItem) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found in order" 
      });
    }

    // Check if the item is already delivered or cancelled
    if (orderItem.isDelivered || orderItem.isCancelled) {
      return res.status(400).json({ 
        success: false, 
        message: "Order item cannot be cancelled" 
      });
    }

    // Update order item status
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
    console.error("Cancel order item error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel order item" 
    });
  }
};