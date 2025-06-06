import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategory,
  getAllCategories,
} from '../controllers/categoryController.js';
import { protect, isSellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, isSellerOrAdmin, createCategory);
router.get('/all', getAllCategories);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, isSellerOrAdmin, updateCategory)
  .delete(protect, isSellerOrAdmin, deleteCategory);

router.patch('/:id/toggle', protect, isSellerOrAdmin, toggleCategory);

export default router;
