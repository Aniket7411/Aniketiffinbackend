const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
    {
        subscriptionNumber: {
            type: String,
            required: true,
            unique: true,
        },

        // Parties
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Provider',
            required: true,
        },
        tenantUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        providerUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Subscription Details
        plan: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: true,
        },
        mealsIncluded: {
            breakfast: { type: Boolean, default: false },
            lunch: { type: Boolean, default: false },
            dinner: { type: Boolean, default: false },
        },

        // Dates
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },

        // Pricing
        pricePerMeal: {
            breakfast: Number,
            lunch: Number,
            dinner: Number,
        },
        totalMealsPerDay: {
            type: Number,
            min: 1,
            max: 3,
        },
        dailyPrice: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },

        // Status
        status: {
            type: String,
            enum: ['pending', 'active', 'paused', 'completed', 'cancelled'],
            default: 'pending',
        },

        // Payment
        paymentMode: {
            type: String,
            enum: ['weekly', 'monthly', 'advance'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'paid'],
            default: 'pending',
        },
        lastPaymentDate: Date,
        nextPaymentDate: Date,

        // Additional
        specialInstructions: String,
        deliveryTime: String,

        // Pause tracking
        pauseHistory: [
            {
                pausedFrom: Date,
                pausedTo: Date,
                reason: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
SubscriptionSchema.index({ tenantId: 1, status: 1 });
SubscriptionSchema.index({ providerId: 1, status: 1 });
SubscriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);

