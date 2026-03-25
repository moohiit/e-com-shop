import Wishlist from "../models/Wishlist.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: "products",
      select:
        "name slug basePrice discountPercentage taxPercentage stock images categories ratingsAverage numReviews isActive",
      populate: { path: "categories", select: "name slug" },
    });

    // Filter out inactive or deleted products
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p && p.isActive
      );
    }

    res.json({
      success: true,
      products: wishlist?.products || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Product already in wishlist" });
      }
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== productId
    );
    await wishlist.save();

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    res.json({ success: true, message: "Wishlist cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
