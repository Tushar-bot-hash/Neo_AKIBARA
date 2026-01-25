const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  getPaymentStatus,
  stripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/checkout', protect, createCheckoutSession);
router.get('/status/:sessionId', protect, getPaymentStatus);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
