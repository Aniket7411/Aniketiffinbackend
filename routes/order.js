const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  getVendorOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, vendor } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validation');

// Protected user routes
router.use(protect);

router.post('/', orderValidation, validate, createOrder);
router.post('/:orderId/verify-payment', verifyPayment);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderDetails);
router.put('/:orderId/cancel', cancelOrder);

// Vendor routes
router.get('/vendor/my-orders', vendor, getVendorOrders);
router.put('/:orderId/status', vendor, updateOrderStatus);

module.exports = router;

