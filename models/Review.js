const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    // Reviewer Info
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerType: {
      type: String,
      enum: ['tenant', 'provider'],
      required: true,
    },
    reviewerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reviewerModel',
    },
    reviewerModel: {
      type: String,
      enum: ['Tenant', 'Provider'],
    },

    // Reviewee Info
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revieweeType: {
      type: String,
      enum: ['tenant', 'provider'],
      required: true,
    },
    revieweeProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'revieweeModel',
    },
    revieweeModel: {
      type: String,
      enum: ['Tenant', 'Provider'],
    },

    // Subscription reference
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },

    // Review content
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: 500,
    },

    // Review aspects (for providers)
    aspects: {
      foodQuality: { type: Number, min: 1, max: 5 },
      hygiene: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      behavior: { type: Number, min: 1, max: 5 },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for same subscription
ReviewSchema.index({ reviewerId: 1, subscriptionId: 1 }, { unique: true });
ReviewSchema.index({ revieweeProfileId: 1, createdAt: -1 });
ReviewSchema.index({ reviewerType: 1, revieweeType: 1 });

module.exports = mongoose.model('Review', ReviewSchema);

