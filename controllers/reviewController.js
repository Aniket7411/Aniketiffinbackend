const Review = require('../models/Review');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        const { orderId, vendorId, rating, comment } = req.body;

        // Check if order exists and belongs to user
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this order',
            });
        }

        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Can only review delivered orders',
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            userId: req.user._id,
            orderId,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Review already submitted for this order',
            });
        }

        // Create review
        const review = await Review.create({
            userId: req.user._id,
            vendorId,
            orderId,
            rating,
            comment,
        });

        // Update vendor rating
        const reviews = await Review.find({ vendorId });
        const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

        await Vendor.findByIdAndUpdate(vendorId, {
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
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
        const reviews = await Review.find({ userId: req.user._id })
            .populate('vendorId', 'businessName')
            .populate('orderId', 'orderNumber')
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
        const { rating, comment } = req.body;

        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Recalculate vendor rating
        const reviews = await Review.find({ vendorId: review.vendorId });
        const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

        await Vendor.findByIdAndUpdate(review.vendorId, {
            rating: Math.round(avgRating * 10) / 10,
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

        if (review.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const vendorId = review.vendorId;
        await Review.findByIdAndDelete(req.params.reviewId);

        // Recalculate vendor rating
        const reviews = await Review.find({ vendorId });
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
            : 0;

        await Vendor.findByIdAndUpdate(vendorId, {
            rating: Math.round(avgRating * 10) / 10,
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

module.exports = {
    addReview,
    getMyReviews,
    updateReview,
    deleteReview,
};

