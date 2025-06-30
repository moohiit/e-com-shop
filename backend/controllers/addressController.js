import Address from "../models/Address.js";

// Create Address
export const createAddress = async (req, res) => {
  try {
    const { fullName, mobileNumber, pincode, city, state, locality, flatOrBuilding, landmark, addressType, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      mobileNumber,
      pincode,
      city,
      state,
      locality,
      flatOrBuilding,
      landmark,
      addressType,
      isDefault,
    });

    res.status(201).json({ success: true, message: "Address added successfully", address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add address", error: error.message });
  }
};

// Get all addresses for user
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch addresses", error: error.message });
  }
};

// Update Address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;

    const address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({ success: true, message: "Address updated successfully", address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update address", error: error.message });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete address", error: error.message });
  }
};

// set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({ success: true, message: "Default address set successfully", address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to set default address", error: error.message });
  }
};
