const express = require('express');
const router = express.Router();
const {
  getAllVendors,
  getVendorDetails,
  getVendorMenu,
  getVendorReviews,
} = require('../controllers/vendorController');

// Public routes
router.get('/', getAllVendors);
router.get('/:vendorId', getVendorDetails);
router.get('/:vendorId/menu', getVendorMenu);
router.get('/:vendorId/reviews', getVendorReviews);

module.exports = router;

