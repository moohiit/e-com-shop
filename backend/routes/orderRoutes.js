import express from "express";

const router = express.Router();

// Import the order controller functions
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  deleteOrder,
  cancelOrder,
} from "../controllers/orderController.js";

// Middleware to protect routes
import { protect, isAdmin } from "../middleware/authMiddleware.js";

// Protect all routes
router.use(protect);

// Order routes
router.route("/").post(createOrder).get(isAdmin, getAllOrders);
router.route("/myorders").get(getMyOrders);
router.route("/:id").get(getOrderById);
router.route("/:id").delete(deleteOrder);
router.route("/:id/cancel").put(cancelOrder);

export default router;