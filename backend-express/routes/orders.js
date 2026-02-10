const express = require('express');
const router = express.Router();
const {
  createOrder, // 1. Add this import (make sure it exists in your controller)
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// 2. Add the POST route for creating orders
// This handles: POST https://neo-akibara-backend.onrender.com/api/orders
router.post('/', protect, createOrder); 

router.get('/', protect, getUserOrders);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;