const express = require('express');
const router = express.Router();
const {
  getAllUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
