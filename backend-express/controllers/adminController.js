const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock category image_url')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    // 1. SECURITY: Prevent admin from demoting themselves
    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'You cannot demote yourself. Another admin must do this.'
      });
    }

    // 2. Update role and CLEAR sessions (Force logout to apply new permissions)
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        role,
        refreshTokens: [] // Nuke sessions so they must re-login with new role
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    // 1. SECURITY: Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Security Breach Prevention: You cannot delete your own admin account.'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User account and all active sessions destroyed.'
    });
  } catch (err) {
    next(err);
  }
};