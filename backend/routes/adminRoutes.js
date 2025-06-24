import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUser,
  getDashboardData,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, isAdmin); // ✅ apply middleware to all routes below

router.get('/users', getAllUsers);
router.get('/user/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle', toggleUser); // PATCH for reactivation
router.get('/dashboard', getDashboardData)

export default router;
