const express = require('express');
const router = express.Router();
const {
    uploadKYC,
    getKYCStatus,
    verifyKYC,
    getPendingKYC,
} = require('../controllers/kycController');
const { protect, admin } = require('../middleware/auth');
const { kycValidation, validate } = require('../middleware/validation');

// Protected routes
router.post('/upload', protect, kycValidation, validate, uploadKYC);
router.get('/status', protect, getKYCStatus);

// Admin routes
router.put('/verify/:profileId', protect, admin, verifyKYC);
router.get('/pending', protect, admin, getPendingKYC);

module.exports = router;

