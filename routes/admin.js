const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getDashboardStats,
  toggleUserStatus,
  grantPremium,
  revokePremium,
  getProviders,
  getTenants,
  getConnectionRequests,
  deleteUser,
  updatePremiumStatus,
  getUserDetails,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and admin only
router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.put('/users/:userId/status', toggleUserStatus);
router.post('/users/:userId/grant-premium', grantPremium);
router.post('/users/:userId/revoke-premium', revokePremium);
router.delete('/users/:userId', deleteUser);

// Provider routes
router.get('/providers', getProviders);
router.get('/providers/:userId', getUserDetails);
router.put('/providers/:userId/premium', updatePremiumStatus);

// Tenant routes
router.get('/tenants', getTenants);
router.get('/tenants/:userId', getUserDetails);
router.put('/tenants/:userId/premium', updatePremiumStatus);

// Connection requests
router.get('/connection-requests', getConnectionRequests);

// OLD ROUTES - Commented for future B2B features
// router.get('/orders', getAllOrders);
// router.get('/vendors', getAllVendors);
// router.put('/vendors/:vendorId/status', updateVendorStatus);

module.exports = router;


