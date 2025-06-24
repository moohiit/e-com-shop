import Product from "../models/Product.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
// import Order from "../models/Order.js";

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const query = {};

    if (req.query.role) query.role = req.query.role;

    if (req.query.isActive !== undefined)
      query.isActive = req.query.isActive === "true";

    // Search filter
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: "i" } },
        { email: { $regex: req.query.keyword, $options: "i" } },
      ];
    }

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      users,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    });
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
    const user = await User.findById({ _id: req.params.id }).select(
      "-password"
    );
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
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive; // allow toggling active status

    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Delete user by ID (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Reactivate user by ID (admin only)
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private/Admin
export const toggleUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `${
      user.isActive
        ? "User Activated Successfully"
        : "User deactivated Succcessfully"
    }`,
  });
};

// @desc    Get dashboard data (admin only)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    // ===========================
    // 1. Aggregate User Counts
    // ===========================
    const userCounts = await User.aggregate([
      {
        $facet: {
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }],
          month: [{ $match: { createdAt: { $gte: startOfMonth } } }, { $count: "count" }],
          year: [{ $match: { createdAt: { $gte: startOfYear } } }, { $count: "count" }],
          all: [{ $count: "count" }],
        },
      },
    ]);

    // ===========================
    // 2. Aggregate Product Counts
    // ===========================
    const productCounts = await Product.aggregate([
      {
        $facet: {
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }],
          month: [{ $match: { createdAt: { $gte: startOfMonth } } }, { $count: "count" }],
          year: [{ $match: { createdAt: { $gte: startOfYear } } }, { $count: "count" }],
          all: [{ $count: "count" }],
        },
      },
    ]);

    // ===========================
    // 3. Aggregate Category Counts
    // ===========================
    const categoryCounts = await Category.aggregate([
      {
        $facet: {
          today: [{ $match: { createdAt: { $gte: today } } }, { $count: "count" }],
          month: [{ $match: { createdAt: { $gte: startOfMonth } } }, { $count: "count" }],
          year: [{ $match: { createdAt: { $gte: startOfYear } } }, { $count: "count" }],
          all: [{ $count: "count" }],
        },
      },
    ]);

    // ===========================
    // 4. Aggregate Orders and Revenue
    // ===========================
    // const orderStats = await Order.aggregate([
    //   {
    //     $facet: {
    //       today: [
    //         { $match: { createdAt: { $gte: today } } },
    //         { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
    //       ],
    //       month: [
    //         { $match: { createdAt: { $gte: startOfMonth } } },
    //         { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
    //       ],
    //       year: [
    //         { $match: { createdAt: { $gte: startOfYear } } },
    //         { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
    //       ],
    //       all: [
    //         { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
    //       ],
    //     },
    //   },
    // ]);

    const users = userCounts[0];
    const products = productCounts[0];
    const categories = categoryCounts[0];
    // const orders = orderStats[0];

    const formatCount = (data, key) => (data[key][0]?.count || 0);
    const formatRevenue = (data, key) => (data[key][0]?.revenue || 0);

    res.json({
      success: true,
      data: {
        today: {
          users: formatCount(users, 'today'),
          products: formatCount(products, 'today'),
          categories: formatCount(categories, 'today'),
          // orders: formatCount(orders, 'today'),
          // revenue: formatRevenue(orders, 'today'),
        },
        month: {
          users: formatCount(users, 'month'),
          products: formatCount(products, 'month'),
          categories: formatCount(categories, 'month'),
          // orders: formatCount(orders, 'month'),
          // revenue: formatRevenue(orders, 'month'),
        },
        year: {
          users: formatCount(users, 'year'),
          products: formatCount(products, 'year'),
          categories: formatCount(categories, 'year'),
          // orders: formatCount(orders, 'year'),
          // revenue: formatRevenue(orders, 'year'),
        },
        all: {
          users: formatCount(users, 'all'),
          products: formatCount(products, 'all'),
          categories: formatCount(categories, 'all'),
          // orders: formatCount(orders, 'all'),
          // revenue: formatRevenue(orders, 'all'),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
