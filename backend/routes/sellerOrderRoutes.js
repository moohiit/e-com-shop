import express from 'express';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import {
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
} from '../controllers/sellerOrderController.js';

const router = express.Router();

router.use(protect, isSeller);

router.route('/').get(getSellerOrders);
router.route('/:id').get(getSellerOrderById);
router.route('/:id/status').put(updateSellerOrderStatus);

export default router;
