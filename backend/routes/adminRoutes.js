import express from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUser,
  restoreUser,
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, isAdmin); // ✅ apply middleware to all routes below

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/restore', restoreUser); // PATCH for reactivation


export default router;
