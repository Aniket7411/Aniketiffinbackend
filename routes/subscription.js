const express = require('express');
const router = express.Router();
const {
    createSubscription,
    getMySubscriptions,
    updateSubscriptionStatus,
    pauseSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const { subscriptionValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

router.post('/create', subscriptionValidation, validate, createSubscription);
router.get('/my-subscriptions', getMySubscriptions);
router.put('/:subscriptionId/status', updateSubscriptionStatus);
router.put('/:subscriptionId/pause', pauseSubscription);

module.exports = router;

