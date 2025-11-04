const express = require('express');
const router = express.Router();
const {
    registerProvider,
    getMyProfile,
    updateProfile,
    searchProviders,
    getProviderById,
    getConnectionRequests,
} = require('../controllers/providerController');
const { getProviderReviews } = require('../controllers/reviewController');
const { protect, provider } = require('../middleware/auth');
const { providerRegisterValidation, validate } = require('../middleware/validation');

// Middleware to optionally add user if authenticated
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const User = require('../models/User');
            User.findById(decoded.userId).then(user => {
                if (user) req.user = user;
                next();
            }).catch(() => next());
        } catch (error) {
            next();
        }
    } else {
        next();
    }
};

// Public routes (optional auth for contact visibility)
router.post('/register', providerRegisterValidation, validate, registerProvider);
router.get('/search', optionalAuth, searchProviders);

// Provider reviews - MUST BE BEFORE /:providerId
router.get('/:providerId/reviews', getProviderReviews);

// Protected routes (provider only) - MUST BE BEFORE /:providerId
router.get('/profile/me', protect, provider, getMyProfile);
router.put('/profile/me', protect, provider, updateProfile);
router.get('/connection-requests', protect, provider, getConnectionRequests);

// Provider details by ID - MUST BE LAST (catch-all route)
router.get('/:providerId', optionalAuth, getProviderById);

module.exports = router;

