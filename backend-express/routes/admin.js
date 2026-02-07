// routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Admin dashboard routes
router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;