import express from "express";
import { protect, isSeller } from "../middleware/authMiddleware.js";
import {
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderItemStatus,
  cancelSellerOrderItem,
} from "../controllers/sellerOrderController.js";

const router = express.Router();

router.use(protect, isSeller);

router.route("/").get(getSellerOrders);
router.route("/:id").get(getSellerOrderById);
router.route("/:id/item-status").put(updateSellerOrderItemStatus);
router.route("/:id/cancel-item").put(cancelSellerOrderItem);

export default router;
