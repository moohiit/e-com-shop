import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  updateUserProfile,
  getUserProfile,
  deactivateOwnAccount,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deactivateOwnAccount);

export default router;
