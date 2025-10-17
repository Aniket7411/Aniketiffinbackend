const express = require('express');
const router = express.Router();
const {
  addReview,
  getMyReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

router.post('/', reviewValidation, validate, addReview);
router.get('/my-reviews', getMyReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

module.exports = router;

