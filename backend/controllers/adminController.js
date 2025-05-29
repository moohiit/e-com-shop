import User from "../models/User.js";

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || " Internal Server Error",
    });
  }
};

// @desc    Update user by ID (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserById = async (req, res) => {
  const { name, email, isAdmin } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  user.name = name || user.name;
  user.email = email || user.email;
  user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
};

// @desc    Delete user by ID (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated (soft deleted)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reactivate user by ID (admin only)
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private/Admin
export const restoreUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user || user.isActive) {
    return res.status(400).json({ success: false, message: 'User not found or already active' });
  }

  user.isActive = true;
  await user.save();

  res.json({ success: true, message: 'User reactivated' });
};