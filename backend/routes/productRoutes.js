import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getProductCount,
  getProductsByCategory,
} from '../controllers/productController.js';

import { isSeller, isSellerOrAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new product
router.post('/', protect, isSeller, createProduct);

// Get all products (with search, filter, pagination, sorting)
router.get('/', getAllProducts);

// Get product count
router.get('/count', getProductCount);

// Get a single product by ID
router.get('/:id', getProductById);

// Update product
router.put('/:id', protect, isSeller, updateProduct);

// Soft delete product
router.delete('/:id', protect, isSellerOrAdmin, deleteProduct);

// Restore soft-deleted product
router.patch('/restore/:id', protect, isSellerOrAdmin, restoreProduct);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);

export default router;
