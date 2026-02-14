const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

/**
 * SECURITY NOTE: 
 * Since all routes in this file are for Admins, we can apply 
 * the middleware to the entire router at once.
 */
router.use(protect);
router.use(authorize('admin'));

// --- Dashboard & Analytics ---
router.get('/stats', getDashboardStats);

// --- User Management ---
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole); // This will also nuke their sessions (per our controller)
router.delete('/users/:id', deleteUser);

module.exports = router;