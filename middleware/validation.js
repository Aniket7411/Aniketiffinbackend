const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// ===== P2P MODEL VALIDATIONS =====

// Provider registration validation (simplified - basic info only)
const providerRegisterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Optional fields - can be added during profile edit
  body('displayName').optional().trim(),
  body('location.address').optional().trim(),
  body('location.area').optional().trim(),
  body('location.city').optional().trim(),
  body('location.state').optional().trim(),
  body('location.pincode').optional().trim(),
  body('cuisineTypes').optional().isArray(),
  body('foodType').optional().isIn(['veg', 'non-veg', 'both']),
  body('priceRange.min').optional().isNumeric(),
  body('priceRange.max').optional().isNumeric(),
  body('maxTenants').optional().isNumeric(),
];

// Tenant registration validation (simplified - basic info only)
const tenantRegisterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Optional fields - can be added during profile edit
  body('displayName').optional().trim(),
  body('accommodationType').optional().isIn(['hostel', 'pg', 'flat', 'room']),
  body('location.address').optional().trim(),
  body('location.area').optional().trim(),
  body('location.city').optional().trim(),
  body('location.state').optional().trim(),
  body('location.pincode').optional().trim(),
  body('foodPreferences.type').optional().isIn(['veg', 'non-veg', 'eggetarian', 'both']),
  body('foodPreferences.cuisinePreferences').optional().isArray(),
  body('foodPreferences.tastePreference').optional(),
  body('budgetRange.min').optional().isNumeric(),
  body('budgetRange.max').optional().isNumeric(),
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Subscription validation
const subscriptionValidation = [
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('plan').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid plan type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('paymentMode').isIn(['weekly', 'monthly', 'advance']).withMessage('Invalid payment mode'),
];

// Connection request validation
const connectionRequestValidation = [
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('message').optional().isString(),
  body('sampleFoodRequest').optional().isBoolean(),
];

// KYC validation
const kycValidation = [
  body('aadharNumber').matches(/^[0-9]{4}-?[0-9]{4}-?[0-9]{4}$/).withMessage('Invalid Aadhar number format'),
  body('aadharFront').notEmpty().withMessage('Aadhar front image is required'),
  body('aadharBack').notEmpty().withMessage('Aadhar back image is required'),
  body('photo').notEmpty().withMessage('Photo is required'),
];

// Review validation (P2P)
const reviewValidationP2P = [
  body('subscriptionId').notEmpty().withMessage('Subscription ID is required'),
  body('revieweeUserId').notEmpty().withMessage('Reviewee user ID is required'),
  body('revieweeType').isIn(['tenant', 'provider']).withMessage('Invalid reviewee type'),
  body('revieweeProfileId').notEmpty().withMessage('Reviewee profile ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

// ===== OLD VALIDATIONS (Kept for future B2B features) =====

// Register validation rules (OLD)
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // body('address.street').notEmpty().withMessage('Street address is required'),
  // body('address.city').notEmpty().withMessage('City is required'),
  // body('address.state').notEmpty().withMessage('State is required'),
  // body('address.pincode').notEmpty().withMessage('Pincode is required'),
];

// Vendor registration validation (OLD)
const vendorRegisterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('fssaiLicense').matches(/^[0-9]{14}$/).withMessage('FSSAI license must be 14 digits'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('bankDetails.accountNumber').notEmpty().withMessage('Account number is required'),
  body('bankDetails.ifscCode').notEmpty().withMessage('IFSC code is required'),
  body('bankDetails.accountHolderName').notEmpty().withMessage('Account holder name is required'),
];

// Menu item validation (OLD)
const menuItemValidation = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Order validation (OLD)
const orderValidation = [
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('deliveryAddress.street').notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').notEmpty().withMessage('State is required'),
  body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').isIn(['online', 'cod']).withMessage('Invalid payment method'),
];

// Review validation (OLD)
const reviewValidation = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];

module.exports = {
  validate,
  // P2P Model
  providerRegisterValidation,
  tenantRegisterValidation,
  loginValidation,
  subscriptionValidation,
  connectionRequestValidation,
  kycValidation,
  reviewValidationP2P,
  // Old validations (for backward compatibility)
  registerValidation,
  vendorRegisterValidation,
  menuItemValidation,
  orderValidation,
  reviewValidation,
};
