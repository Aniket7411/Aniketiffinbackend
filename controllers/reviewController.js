const Review = require('../models/Review');
const Subscription = require('../models/Subscription');
const Provider = require('../models/Provider');
const Tenant = require('../models/Tenant');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        const { providerId, subscriptionId, rating, comment, aspects } = req.body;

        // Validate that user is a tenant
        if (req.user.role !== 'tenant') {
            return res.status(403).json({
                success: false,
                message: 'Only tenants can review providers',
            });
        }

        // Get tenant profile
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant profile not found',
            });
        }

        // Check if subscription exists and belongs to user
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        if (subscription.tenantUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this subscription',
            });
        }

        // Check if subscription is active or completed
        if (!['active', 'completed'].includes(subscription.status)) {
            return res.status(400).json({
                success: false,
                message: 'Can only review active or completed subscriptions',
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            reviewerId: req.user._id,
            subscriptionId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Review already submitted for this subscription',
            });
        }

        // Get provider profile
        const provider = await Provider.findById(providerId).populate('userId');
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }

        // Create review
        const review = await Review.create({
            reviewerId: req.user._id,
            reviewerType: 'tenant',
            reviewerProfileId: tenant._id,
            reviewerModel: 'Tenant',
            revieweeId: provider.userId._id,
            revieweeType: 'provider',
            revieweeProfileId: provider._id,
            revieweeModel: 'Provider',
            subscriptionId,
            rating,
            comment,
            aspects: aspects || {},
        });

        // Update provider rating
        const reviews = await Review.find({ revieweeProfileId: provider._id });
        const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

        await Provider.findByIdAndUpdate(provider._id, {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            totalReviews: reviews.length,
        });

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: {
                review,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewerId: req.user._id })
            .populate('revieweeProfileId')
            .populate('subscriptionId', 'subscriptionNumber plan startDate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                reviews,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
    try {
        const { rating, comment, aspects } = req.body;

        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        if (review.reviewerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        if (aspects) review.aspects = aspects;
        await review.save();

        // Recalculate provider rating
        const reviews = await Review.find({ revieweeProfileId: review.revieweeProfileId });
        const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

        await Provider.findByIdAndUpdate(review.revieweeProfileId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: {
                review,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        if (review.reviewerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const providerId = review.revieweeProfileId;
        await Review.findByIdAndDelete(req.params.reviewId);

        // Recalculate provider rating
        const reviews = await Review.find({ revieweeProfileId: providerId });
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
            : 0;

        await Provider.findByIdAndUpdate(providerId, {
            rating: Math.round(avgRating * 10) / 10,
            totalReviews: reviews.length,
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get provider reviews
// @route   GET /provider/:providerId/reviews
// @access  Public (called from provider routes)
const getProviderReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const providerId = req.params.providerId;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const reviews = await Review.find({ 
            revieweeProfileId: providerId,
            revieweeType: 'provider'
        })
            .populate('reviewerProfileId', 'displayName')
            .select('reviewerProfileId rating comment aspects createdAt')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip);

        const totalReviews = await Review.countDocuments({ 
            revieweeProfileId: providerId,
            revieweeType: 'provider'
        });

        // Calculate average rating
        const allReviews = await Review.find({ 
            revieweeProfileId: providerId,
            revieweeType: 'provider'
        });
        const averageRating = allReviews.length > 0
            ? Math.round((allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length) * 10) / 10
            : 0;

        res.status(200).json({
            success: true,
            data: {
                reviews,
                totalReviews,
                averageRating,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    addReview,
    getMyReviews,
    updateReview,
    deleteReview,
    getProviderReviews,
};
