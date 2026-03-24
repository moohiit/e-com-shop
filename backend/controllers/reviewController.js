import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ---------- Create Review ---------- */
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You have already reviewed this product." });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment?.trim() || "",
    });

    const populated = await review.populate("user", "name avatar");

    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "You have already reviewed this product." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Get Reviews for a Product ---------- */
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "latest" } = req.query;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }

    const sortOption =
      sort === "highest" ? { rating: -1 } :
      sort === "lowest" ? { rating: 1 } :
      { createdAt: -1 };

    const total = await Review.countDocuments({ product: productId });
    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Update Review ---------- */
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID." });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update this review." });
    }

    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    const populated = await review.populate("user", "name avatar");

    res.json({ success: true, review: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Delete Review ---------- */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID." });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    // Allow owner or admin to delete
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this review." });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ success: true, message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ---------- Get User's Review for a Product ---------- */
export const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID." });
    }

    const review = await Review.findOne({
      product: productId,
      user: req.user._id,
    }).populate("user", "name avatar");

    res.json({ success: true, review: review || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
