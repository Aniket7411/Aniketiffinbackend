const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Review = require('../models/Review');
const generateToken = require('../utils/generateToken');
const { calculateTenantCompletion } = require('../utils/profileCompletion');

// @desc    Register as tenant (student/PG)
// @route   POST /api/tenant/register
// @access  Public
const registerTenant = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            displayName,
            accommodationType,
            location,
            foodPreferences,
            mealsRequired,
            budgetRange,
        } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: 'tenant',
        });

        // Create tenant profile with minimal required data
        const tenant = await Tenant.create({
            userId: user._id,
            displayName: displayName || name,
            accommodationType: accommodationType || 'pg',
            location: location || {
                address: '',
                area: '',
                city: '',
                state: '',
                pincode: '',
            },
            foodPreferences: foodPreferences || {
                type: 'veg',
                cuisinePreferences: [],
                tastePreference: 'medium',
                allergies: [],
                avoidItems: [],
            },
            mealsRequired: mealsRequired || {
                breakfast: { required: false },
                lunch: { required: true },
                dinner: { required: true },
            },
            budgetRange: budgetRange || {
                min: 0,
                max: 0,
                perMeal: true,
            },
            kycStatus: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Tenant registered successfully. Please complete your profile and KYC verification.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
                tenant: {
                    id: tenant._id,
                    displayName: tenant.displayName,
                    kycStatus: tenant.kycStatus,
                },
                token: generateToken(user._id, user.email, user.role),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get tenant profile
// @route   GET /api/tenant/profile/me
// @access  Private (Tenant)
const getMyProfile = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ userId: req.user._id }).populate(
            'userId',
            'name email phone'
        );

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant profile not found',
            });
        }

        // Calculate profile completion
        const completion = calculateTenantCompletion(tenant);

        res.status(200).json({
            success: true,
            data: {
                tenant,
                profileCompletion: completion,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update tenant profile
// @route   PUT /api/tenant/profile
// @access  Private (Tenant)
const updateProfile = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ userId: req.user._id });

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant profile not found',
            });
        }

        // Update allowed fields in tenant profile
        const allowedUpdates = [
            'displayName',
            'accommodationType',
            'location',
            'foodPreferences',
            'mealsRequired',
            'budgetRange',
            'specialRequirements',
            'isLookingForProvider',
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                tenant[field] = req.body[field];
            }
        });

        // Update phone in User model if provided
        if (req.body.phone) {
            const user = await User.findById(req.user._id);
            if (user) {
                user.phone = req.body.phone;
                await user.save();
            }
        }

        await tenant.save();

        // Calculate profile completion after update
        const completion = calculateTenantCompletion(tenant);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                tenant,
                profileCompletion: completion,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get tenant details by ID
// @route   GET /api/tenant/:tenantId
// @access  Public (with visibility rules)
const getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.tenantId)
            .populate('userId', 'name email phone isPremium')
            .select('-kycDocuments');

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found',
            });
        }

        const tenantObj = tenant.toObject();

        // Admin can see all information including phone
        if (req.user && req.user.role === 'admin') {
            // Admin can see everything
            return res.status(200).json({
                success: true,
                data: { tenant: tenantObj },
            });
        }

        // Providers should NOT see tenant phone numbers (only basic info)
        if (req.user && req.user.role === 'provider') {
            if (tenantObj.userId) {
                delete tenantObj.userId.phone;
            }
        }

        // Tenants can see their own phone, but not others
        if (req.user && req.user.role === 'tenant') {
            if (tenantObj.userId && tenantObj.userId._id.toString() !== req.user._id.toString()) {
                delete tenantObj.userId.phone;
            }
        }

        // Public users cannot see phone
        if (!req.user && tenantObj.userId) {
            delete tenantObj.userId.phone;
        }

        res.status(200).json({
            success: true,
            data: { tenant: tenantObj },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerTenant,
    getMyProfile,
    updateProfile,
    getTenantById,
};

