const express = require('express');
const router = express.Router();
const {
    registerTenant,
    getMyProfile,
    updateProfile,
} = require('../controllers/tenantController');
const { protect, tenant } = require('../middleware/auth');
const { tenantRegisterValidation, validate } = require('../middleware/validation');

// Public routes
router.post('/register', tenantRegisterValidation, validate, registerTenant);

// Protected routes (tenant only)
router.get('/profile/me', protect, tenant, getMyProfile);
router.put('/profile/me', protect, tenant, updateProfile);

module.exports = router;

