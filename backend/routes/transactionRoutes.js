import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getTransactionById,
  getAllTransactions,
  getAllUserTransactions,
  getUserTransactions,
  updateTransactionStatus,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { protect, isSellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Transaction routes
router.route("/create").post(createRazorpayOrder);
router.route("/verify").post(verifyRazorpayPayment);
router.route("/:id").get(getTransactionById);
router.route("/").get(getAllUserTransactions); // Get all transactions user route

// Seller or Admin routes
router.route("/admin").get(isSellerOrAdmin, getAllTransactions); // Get all transactions admin route
router.route("/:id/status").put(isSellerOrAdmin, updateTransactionStatus); // Update transaction status (Admin)
router.route("/:id").delete(isSellerOrAdmin, deleteTransaction); // Delete transaction (Admin)
router.route("/user/:userId").get(isSellerOrAdmin, getUserTransactions); // Get all transactions for a specific user (Admin)

export default router;
