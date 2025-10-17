// ==========================================
// THIS MODEL IS COMMENTED OUT FOR NOW
// Using Provider model instead for P2P model
// Kept for future B2B vendor features
// ==========================================

/* 
const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        businessName: {
            type: String,
            required: [true, 'Please provide a business name'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        fssaiLicense: {
            type: String,
            required: [true, 'Please provide FSSAI license number'],
            unique: true,
            match: [/^[0-9]{14}$/, 'Please provide a valid 14-digit FSSAI license'],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalOrders: {
            type: Number,
            default: 0,
        },
        cuisineType: [
            {
                type: String,
            },
        ],
        deliveryTime: {
            type: String,
            default: '30-45 mins',
        },
        minOrder: {
            type: Number,
            default: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        address: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
        },
        bankDetails: {
            accountNumber: {
                type: String,
                required: true,
            },
            ifscCode: {
                type: String,
                required: true,
            },
            accountHolderName: {
                type: String,
                required: true,
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        approvalRemarks: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes for better query performance
VendorSchema.index({ 'address.city': 1 });
VendorSchema.index({ rating: -1 });
VendorSchema.index({ isApproved: 1, isActive: 1 });

module.exports = mongoose.model('Vendor', VendorSchema);
*/

// Export empty for now to prevent errors
module.exports = {};

