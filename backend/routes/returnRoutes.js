import express from "express";
import {
  createReturnRequest,
  getMyReturns,
  getSellerReturns,
  approveReturn,
  rejectReturn,
  getAllReturns,
} from "../controllers/returnController.js";
import { protect, isSeller, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", protect, createReturnRequest);
router.get("/my-returns", protect, getMyReturns);

// Seller routes
router.get("/seller", protect, isSeller, getSellerReturns);
router.put("/:id/approve", protect, isSeller, approveReturn);
router.put("/:id/reject", protect, isSeller, rejectReturn);

// Admin routes
router.get("/admin", protect, isAdmin, getAllReturns);

export default router;
