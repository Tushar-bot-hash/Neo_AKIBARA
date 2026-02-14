const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  signup,
  login,
  logout,
  getMe,
  refresh // <--- Add this controller function
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

// NEW: The Refresh route. 
// It doesn't need 'protect' because it uses the refreshToken cookie, not the Bearer token.
router.get('/refresh', refresh);

router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;