import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get reviews for a product (public)
router.get("/product/:productId", getProductReviews);

// Get current user's review for a product (protected)
router.get("/user/:productId", protect, getUserReview);

// Create a review (protected)
router.post("/:productId", protect, createReview);

// Update a review (protected - owner only)
router.put("/:reviewId", protect, updateReview);

// Delete a review (protected - owner or admin)
router.delete("/:reviewId", protect, deleteReview);

export default router;
