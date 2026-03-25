import express from "express";
import {
  initiateRazorpayPayment,
  verifyAndCreateOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getTransactionById,
  getAllTransactions,
  getAllUserTransactions,
  getUserTransactions,
  updateTransactionStatus,
  deleteTransaction,
  getSellerTransactions,
} from "../controllers/transactionController.js";
import { protect, isSellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// New payment-first flow (initiate payment → verify + create order)
router.route("/initiate").post(initiateRazorpayPayment);
router.route("/verify-and-create").post(verifyAndCreateOrder);

// Legacy flow (create order first → then pay)
router.route("/create").post(createRazorpayOrder);
router.route("/verify").post(verifyRazorpayPayment);

router.route("/:id").get(getTransactionById);
router.route("/").get(getAllUserTransactions);

// Seller or Admin routes
router.route("/admin").get(isSellerOrAdmin, getAllTransactions);
router.route("/:id/status").put(isSellerOrAdmin, updateTransactionStatus);
router.route("/:id").delete(isSellerOrAdmin, deleteTransaction);
router.route("/user/:userId").get(isSellerOrAdmin, getUserTransactions);
router.route("/seller-transactions").get(isSellerOrAdmin, getSellerTransactions);

export default router;
