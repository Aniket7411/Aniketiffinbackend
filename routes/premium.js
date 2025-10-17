const express = require('express');
const router = express.Router();
const {
  getPremiumStatus,
  getPremiumPlans,
} = require('../controllers/premiumController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/plans', getPremiumPlans);

// Protected routes
router.get('/status', protect, getPremiumStatus);

module.exports = router;

