const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  validate,
} = require('../middleware/validation');

// User routes
router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);

// Admin routes
router.post('/admin/login', loginAdmin);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;


