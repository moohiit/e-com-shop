import express from "express";
import {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getCart).post(addToCart).delete(clearCart);
router.route("/sync").put(syncCart);
router.route("/:productId").put(updateCartItem).delete(removeFromCart);

export default router;
