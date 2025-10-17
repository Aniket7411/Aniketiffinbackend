const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true,
    },
    items: [String], // e.g., ["Roti", "Dal", "Rice", "Sabji"]
    description: String,
    price: {
        type: Number,
        required: true,
    },
    isVeg: {
        type: Boolean,
        default: true,
    },
});

const ProviderSchema = new mongoose.Schema(
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
        bio: {
            type: String,
            maxlength: 500,
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

        // Food Preferences & Offerings
        cuisineTypes: [
            {
                type: String,
                enum: ['North Indian', 'South Indian', 'Gujarati', 'Bengali', 'Punjabi', 'Maharashtrian', 'Chinese', 'Continental', 'Other'],
            },
        ],
        specialties: [String], // e.g., ["Homemade Parathas", "Authentic Biryani"]
        foodType: {
            type: String,
            enum: ['veg', 'non-veg', 'both'],
            default: 'veg',
        },
        cookingStyle: {
            type: String,
            enum: ['home-style', 'restaurant-style', 'traditional', 'modern-fusion'],
            default: 'home-style',
        },

        // Menu & Pricing
        mealsOffered: {
            breakfast: {
                available: { type: Boolean, default: false },
                time: String, // e.g., "7:00 AM - 9:00 AM"
            },
            lunch: {
                available: { type: Boolean, default: false },
                time: String,
            },
            dinner: {
                available: { type: Boolean, default: false },
                time: String,
            },
        },
        menuItems: [MenuItemSchema],
        priceRange: {
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 0,
            },
        },

    // Capacity
    maxTenants: {
      type: Number,
      default: 5,
      min: 1,
    },
    currentTenants: {
      type: Number,
      default: 0,
    },
    
    // Sample Food System
    sampleFoodAvailable: {
      type: Boolean,
      default: false,
    },
    sampleFoodDetails: {
      description: {
        type: String,
        default: '',
      },
      availableDays: {
        type: [String],
        default: [],
      },
      bookingRequired: {
        type: Boolean,
        default: true,
      },
    },

        // KYC & Verification
        kycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending',
        },
        kycDocuments: {
            aadharNumber: String,
            aadharFront: String, // URL to uploaded image
            aadharBack: String,
            photo: String,
            addressProof: String,
        },
        kycRemarks: String,

        // Stats & Rating
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        totalSubscriptions: {
            type: Number,
            default: 0,
        },

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better search performance
ProviderSchema.index({ 'location.area': 1, 'location.city': 1 });
ProviderSchema.index({ 'location.coordinates': '2dsphere' }); // For geospatial queries
ProviderSchema.index({ cuisineTypes: 1 });
ProviderSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });
ProviderSchema.index({ rating: -1 });
ProviderSchema.index({ kycStatus: 1 });

module.exports = mongoose.model('Provider', ProviderSchema);

