import Cart from "../models/Cart.js";

const populateCart = (query) =>
  query.populate({
    path: "items.product",
    select:
      "name slug basePrice discountPercentage taxPercentage stock images categories ratingsAverage numReviews isActive seller",
    populate: [
      { path: "categories", select: "name slug" },
      { path: "seller", select: "name email" },
    ],
  });

// Get user's cart
export const getCart = async (req, res) => {
  try {
    let cart = await populateCart(Cart.findOne({ user: req.user._id }));

    if (!cart) {
      return res.json({ success: true, items: [] });
    }

    // Filter out inactive/deleted products
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);
    await cart.save();

    res.json({ success: true, items: cart.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sync full cart (replace server cart with client cart)
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body; // [{ product: id, quantity }]

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items array required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    cart.items = items.map((item) => ({
      product: item.product || item._id,
      quantity: item.quantity || 1,
    }));

    await cart.save();

    const populated = await populateCart(Cart.findById(cart._id));

    res.json({ success: true, items: populated.items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Valid quantity required" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
