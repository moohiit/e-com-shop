import express from "express";
import { createAddress, getAddresses, updateAddress, deleteAddress, setDefaultAddress } from "../controllers/addressController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.route("/")
  .post(protect, createAddress)   // Create Address
  .get(protect, getAddresses);    // Get All Addresses

router.route("/:id")
  .put(protect, updateAddress)    // Update Address
  .delete(protect, deleteAddress); // Delete Address

router.patch('/:id/default', protect, setDefaultAddress);

export default router;
