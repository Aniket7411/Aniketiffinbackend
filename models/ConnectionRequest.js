const mongoose = require('mongoose');

const ConnectionRequestSchema = new mongoose.Schema(
    {
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

        // Request Details
        requestedBy: {
            type: String,
            enum: ['tenant', 'provider'],
            required: true,
        },

    message: {
      type: String,
      maxlength: 500,
    },
    
    // Sample Food Request
    sampleFoodRequest: {
      type: Boolean,
      default: false,
    },
    sampleFoodApproved: {
      type: Boolean,
      default: false,
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    
    // Contact Sharing
    contactShared: {
      type: Boolean,
      default: false,
    },

        // KYC Check
        tenantKycVerified: {
            type: Boolean,
            default: false,
        },
        providerKycVerified: {
            type: Boolean,
            default: false,
        },

    // Response
    providerMessage: {
      type: String,
      maxlength: 500,
    },
    respondedAt: Date,

        // Expiry
        expiresAt: {
            type: Date,
            default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ConnectionRequestSchema.index({ tenantId: 1, providerId: 1 });
ConnectionRequestSchema.index({ status: 1, expiresAt: 1 });
ConnectionRequestSchema.index({ tenantUserId: 1 });
ConnectionRequestSchema.index({ providerUserId: 1 });

module.exports = mongoose.model('ConnectionRequest', ConnectionRequestSchema);

