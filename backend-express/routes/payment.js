const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// 1. WEBHOOK - Must stay RAW (No JSON parsing)
// Handled BEFORE the express.json() parser
router.post(
  '/webhook/stripe', 
  express.raw({ type: 'application/json' }), 
  paymentController.stripeWebhook
);

// 2. PARSER FOR OTHER ROUTES
router.use(express.json());

// 3. PROTECTED ROUTES
router.post('/checkout', protect, paymentController.createCheckoutSession);
router.get('/status/:sessionId', protect, paymentController.getPaymentStatus);

module.exports = router;