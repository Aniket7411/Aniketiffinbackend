const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },

        // Basic Information
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        accommodationType: {
            type: String,
            enum: ['hostel', 'pg', 'flat', 'room'],
            default: 'pg',
        },

        // Location (optional during registration, required for profile completion)
        location: {
            address: {
                type: String,
                default: '',
            },
            area: {
                type: String,
                default: '',
            },
            city: {
                type: String,
                default: '',
            },
            state: {
                type: String,
                default: '',
            },
            pincode: {
                type: String,
                default: '',
            },
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },

        // Food Preferences
        foodPreferences: {
            type: {
                type: String,
                enum: ['veg', 'non-veg', 'eggetarian', 'both'],
                default: 'veg',
            },
            cuisinePreferences: {
                type: [String],
                default: [],
            },
            tastePreference: {
                type: String,
                enum: ['mild', 'medium', 'spicy', 'very-spicy'],
                default: 'medium',
            },
            allergies: {
                type: [String],
                default: [],
            },
            avoidItems: {
                type: [String],
                default: [],
            },
        },

        // Meal Requirements
        mealsRequired: {
            breakfast: {
                required: { type: Boolean, default: false },
                preferredTime: String,
            },
            lunch: {
                required: { type: Boolean, default: false },
                preferredTime: String,
            },
            dinner: {
                required: { type: Boolean, default: false },
                preferredTime: String,
            },
        },

        // Budget
        budgetRange: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 0,
            },
            perMeal: {
                type: Boolean,
                default: true, // true = per meal, false = per day
            },
        },
        monthlyBudget: {
            type: Number,
            default: 0,
        },

        // Additional Info
        specialRequirements: String,

        // KYC & Verification
        kycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending',
        },
        kycDocuments: {
            aadharNumber: String,
            aadharFront: String,
            aadharBack: String,
            photo: String,
            addressProof: String,
        },
        kycRemarks: String,

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isLookingForProvider: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
TenantSchema.index({ 'location.area': 1, 'location.city': 1 });
TenantSchema.index({ 'location.coordinates': '2dsphere' });
TenantSchema.index({ kycStatus: 1 });

module.exports = mongoose.model('Tenant', TenantSchema);

