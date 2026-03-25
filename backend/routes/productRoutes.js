import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCount,
  getProductsByCategory,
  toggleProductStatus,
  getAllProductsAdmin,
  getAllProductsBySeller,
  bulkUpdateStock,
  getLowStockProducts,
} from '../controllers/productController.js';

import { isAdmin, isSeller, isSellerOrAdmin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new product
router.post('/', protect, isSeller, createProduct);

// Get all products (with search, filter, pagination, sorting)
router.get('/', getAllProducts);

// get all products for admin (with search, filter, pagination, sorting)
router.get('/admin', protect, isAdmin, getAllProductsAdmin);

// Get all products for seller (with search, filter, pagination, sorting)
router.get('/seller', protect, isSeller, getAllProductsBySeller);

// Low stock products (seller/admin)
router.get('/low-stock', protect, isSellerOrAdmin, getLowStockProducts);

// Bulk stock update (seller)
router.put('/bulk-stock', protect, isSeller, bulkUpdateStock);

// Get product count
router.get('/count', getProductCount);

// Get a single product by ID
router.get('/:id', getProductById);

// Update product
router.put('/:id', protect, isSellerOrAdmin, updateProduct);

// Soft delete product
router.delete('/:id', protect, isSellerOrAdmin, deleteProduct);

// Restore soft-deleted product
router.patch("/toggle/:id", protect, isSellerOrAdmin, toggleProductStatus);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);

export default router;
