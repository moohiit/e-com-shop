import express from 'express';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import {
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  cancelSellerOrder,
} from '../controllers/sellerOrderController.js';

const router = express.Router();

router.use(protect, isSeller);

router.route('/').get(getSellerOrders);
router.route('/:id').get(getSellerOrderById);
router.route('/:id/status').put(updateSellerOrderStatus);
router.route('/:id/cancel').put(cancelSellerOrder);

export default router;
