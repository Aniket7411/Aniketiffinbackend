const express = require('express');
const router = express.Router();
const {
  updateProfile,
  addAddress,
  search,
  getNotifications,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/search', search);

// Protected routes
router.put('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);
router.get('/notifications', protect, getNotifications);

module.exports = router;

