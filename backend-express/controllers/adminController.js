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
    // 1. Get counts for the dashboard cards
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // 2. Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 3. Get recent orders - Now including item details for the shipping team
    // We populate the user and can also populate the product inside the items array if needed
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8); // Increased to 8 for better data visualization

    // 4. Get low stock products
    // Note: Since 'sizes' is an array, we might want to alert if ANY clothing artifact is low
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
        recentOrders, // This now carries 'items' which contains the 'size' field
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves if needed, otherwise:
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};