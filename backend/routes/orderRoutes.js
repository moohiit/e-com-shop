import express from "express";

const router = express.Router();

// Import the order controller functions
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  deleteOrder,
  cancelOrderItem,
} from "../controllers/orderController.js";

// Middleware to protect routes
import { protect, isAdmin } from "../middleware/authMiddleware.js";

// Protect all routes
router.use(protect);

// Order routes
router.route("/").post(createOrder).get(isAdmin, getAllOrders);
router.route("/myorders").get(getMyOrders);
router.route("/:id").get(getOrderById).delete(isAdmin, deleteOrder);
router.route("/:id/cancel-item").put(cancelOrderItem);

export default router;
