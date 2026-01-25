const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:productId', getProductReviews);
router.post('/', protect, createReview);

module.exports = router;
