const Subscription = require('../models/Subscription');
const Provider = require('../models/Provider');
const Tenant = require('../models/Tenant');
const ConnectionRequest = require('../models/ConnectionRequest');

// Generate unique subscription number
const generateSubscriptionNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SUB-${dateStr}-${random}`;
};

// @desc    Create subscription (after connection accepted)
// @route   POST /api/subscription/create
// @access  Private (Tenant)
const createSubscription = async (req, res) => {
    try {
        const {
            providerId,
            plan, // daily, weekly, monthly
            mealsIncluded,
            startDate,
            pricePerMeal,
            paymentMode,
            specialInstructions,
            deliveryTime,
        } = req.body;

        // Get tenant
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant profile not found',
            });
        }

        // Get provider
        const provider = await Provider.findById(providerId).populate('userId');
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }

        // Check if connection was accepted
        const connection = await ConnectionRequest.findOne({
            tenantId: tenant._id,
            providerId: provider._id,
            status: 'accepted',
        });

        if (!connection) {
            return res.status(403).json({
                success: false,
                message: 'Connection request must be accepted before creating subscription',
            });
        }

        // Check provider capacity
        if (provider.currentTenants >= provider.maxTenants) {
            return res.status(400).json({
                success: false,
                message: 'Provider has reached maximum capacity',
            });
        }

        // Calculate pricing
        const totalMealsPerDay = Object.values(mealsIncluded).filter(Boolean).length;
        const dailyPrice = Object.keys(mealsIncluded).reduce((sum, mealType) => {
            return sum + (mealsIncluded[mealType] ? pricePerMeal[mealType] : 0);
        }, 0);

        // Calculate end date based on plan
        const start = new Date(startDate);
        let end = new Date(startDate);

        if (plan === 'daily') {
            end.setDate(end.getDate() + 1);
        } else if (plan === 'weekly') {
            end.setDate(end.getDate() + 7);
        } else if (plan === 'monthly') {
            end.setMonth(end.getMonth() + 1);
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = dailyPrice * days;

        // Create subscription
        const subscription = await Subscription.create({
            subscriptionNumber: generateSubscriptionNumber(),
            tenantId: tenant._id,
            providerId: provider._id,
            tenantUserId: req.user._id,
            providerUserId: provider.userId._id,
            plan,
            mealsIncluded,
            startDate: start,
            endDate: end,
            pricePerMeal,
            totalMealsPerDay,
            dailyPrice,
            totalPrice,
            paymentMode,
            specialInstructions,
            deliveryTime,
            status: 'pending',
        });

        // Update provider's current tenants count
        provider.currentTenants += 1;
        provider.totalSubscriptions += 1;
        await provider.save();

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: { subscription },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get my subscriptions
// @route   GET /api/subscription/my-subscriptions
// @access  Private
const getMySubscriptions = async (req, res) => {
    try {
        const { status } = req.query;
        let subscriptions;

        const filter = {};
        if (status) filter.status = status;

        if (req.user.role === 'tenant') {
            filter.tenantUserId = req.user._id;
            subscriptions = await Subscription.find(filter)
                .populate('providerId')
                .populate('providerUserId', 'name email phone')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'provider') {
            filter.providerUserId = req.user._id;
            subscriptions = await Subscription.find(filter)
                .populate('tenantId')
                .populate('tenantUserId', 'name email phone')
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            data: { subscriptions },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update subscription status
// @route   PUT /api/subscription/:subscriptionId/status
// @access  Private
const updateSubscriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const subscription = await Subscription.findById(req.params.subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        // Check authorization
        const isAuthorized =
            subscription.tenantUserId.toString() === req.user._id.toString() ||
            subscription.providerUserId.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const validStatuses = ['active', 'paused', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        subscription.status = status;
        await subscription.save();

        // If cancelled, update provider's current tenants
        if (status === 'cancelled') {
            await Provider.findByIdAndUpdate(subscription.providerId, {
                $inc: { currentTenants: -1 },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subscription status updated',
            data: { subscription },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Pause subscription
// @route   PUT /api/subscription/:subscriptionId/pause
// @access  Private (Tenant or Provider)
const pauseSubscription = async (req, res) => {
    try {
        const { pausedFrom, pausedTo, reason } = req.body;

        const subscription = await Subscription.findById(req.params.subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        // Check authorization
        const isAuthorized =
            subscription.tenantUserId.toString() === req.user._id.toString() ||
            subscription.providerUserId.toString() === req.user._id.toString();

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        subscription.status = 'paused';
        subscription.pauseHistory.push({
            pausedFrom: new Date(pausedFrom),
            pausedTo: new Date(pausedTo),
            reason,
        });

        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription paused successfully',
            data: { subscription },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createSubscription,
    getMySubscriptions,
    updateSubscriptionStatus,
    pauseSubscription,
};

