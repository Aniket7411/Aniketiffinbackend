const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getDashboardStats,
  toggleUserStatus,
  grantPremium,
  revokePremium,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and admin only
router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.put('/users/:userId/status', toggleUserStatus);
router.post('/users/:userId/grant-premium', grantPremium);
router.post('/users/:userId/revoke-premium', revokePremium);

// OLD ROUTES - Commented for future B2B features
// router.get('/orders', getAllOrders);
// router.get('/vendors', getAllVendors);
// router.put('/vendors/:vendorId/status', updateVendorStatus);

module.exports = router;


