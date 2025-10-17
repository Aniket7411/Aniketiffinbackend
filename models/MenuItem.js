const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide a menu item name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            enum: ['Thali', 'Rice', 'Roti', 'Sabji', 'Dal', 'Snacks', 'Dessert', 'Beverage', 'Combo', 'Other'],
        },
        isVeg: {
            type: Boolean,
            default: true,
        },
        images: [
            {
                type: String,
            },
        ],
        available: {
            type: Boolean,
            default: true,
        },
        preparationTime: {
            type: String,
            default: '20 mins',
        },
    },
    {
        timestamps: true,
    }
);

// Create indexes
MenuItemSchema.index({ vendorId: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ available: 1 });

module.exports = mongoose.model('MenuItem', MenuItemSchema);

