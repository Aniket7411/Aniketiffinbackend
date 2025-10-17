const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
    street: {
        type: String,
        // required: true,
    },
    city: {
        type: String,
        // required: true,
    },
    state: {
        type: String,
        // required: true,
    },
    pincode: {
        type: String,
        // required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
});

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        phone: {
            type: String,
            required: [true, 'Please provide a phone number'],
            match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['tenant', 'provider', 'admin', 'user', 'vendor'], // tenant = student/PG, provider = home cook
            default: 'user',
        },
        // Premium System
        isPremium: {
            type: Boolean,
            default: false,
        },
        premiumType: {
            type: String,
            enum: ['payment', 'admin_granted', null],
            default: null,
        },
        premiumStartDate: {
            type: Date,
            default: null,
        },
        premiumExpiresAt: {
            type: Date,
            default: null,
        },
        // KYC Status
        kycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending',
        },
        address: [AddressSchema],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

