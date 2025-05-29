import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, isSellerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, isSellerOrAdmin, createCategory);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, isSellerOrAdmin, updateCategory)
  .delete(protect, isSellerOrAdmin, deleteCategory);

export default router;
