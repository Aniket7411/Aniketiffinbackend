const Provider = require('../models/Provider');
const User = require('../models/User');
const Review = require('../models/Review');
const ConnectionRequest = require('../models/ConnectionRequest');
const generateToken = require('../utils/generateToken');
const { calculateProviderCompletion } = require('../utils/profileCompletion');

// @desc    Register as provider (home cook)
// @route   POST /api/provider/register
// @access  Public
const registerProvider = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            displayName,
            location,
            cuisineTypes,
            foodType,
            priceRange,
            maxTenants,
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
            role: 'provider',
        });

        // Create provider profile with minimal required data
        const provider = await Provider.create({
            userId: user._id,
            displayName: displayName || name,
            location: location || {
                address: '',
                area: '',
                city: '',
                state: '',
                pincode: '',
            },
            cuisineTypes: cuisineTypes || [],
            foodType: foodType || 'veg',
            priceRange: priceRange || { min: 0, max: 0 },
            maxTenants: maxTenants || 5,
            kycStatus: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Provider registered successfully. Please complete your profile and KYC verification.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                provider: {
                    id: provider._id,
                    displayName: provider.displayName,
                    kycStatus: provider.kycStatus,
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

// @desc    Get provider profile
// @route   GET /api/provider/profile/me
// @access  Private (Provider)
const getMyProfile = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id }).populate(
            'userId',
            'name email phone'
        );

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found',
            });
        }

        // Calculate profile completion
        const completion = calculateProviderCompletion(provider);

        res.status(200).json({
            success: true,
            data: {
                provider,
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

// @desc    Update provider profile
// @route   PUT /api/provider/profile
// @access  Private (Provider)
const updateProfile = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found',
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'displayName',
            'bio',
            'location',
            'cuisineTypes',
            'specialties',
            'foodType',
            'cookingStyle',
            'mealsOffered',
            'menuItems',
            'priceRange',
            'maxTenants',
            'isAvailable',
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                provider[field] = req.body[field];
            }
        });

        await provider.save();

        // Calculate profile completion after update
        const completion = calculateProviderCompletion(provider);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                provider,
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

// @desc    Search/Browse providers (location-based)
// @route   GET /api/provider/search
// @access  Public (but typically used by tenants)
const searchProviders = async (req, res) => {
    try {
        const {
            search,
            area,
            city,
            cuisineType,
            foodType,
            minPrice,
            maxPrice,
            mealType, // breakfast, lunch, dinner
            page = 1,
            limit = 10,
        } = req.query;

        // Build filter
        const filter = {
            // kycStatus: 'verified', // Temporarily commented - show all active providers
            isActive: true,
            isAvailable: true,
        };

        if (search) {
            filter.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } },
            ];
        }
        if (area) filter['location.area'] = { $regex: area, $options: 'i' };
        if (city) filter['location.city'] = { $regex: city, $options: 'i' };
        if (cuisineType) filter.cuisineTypes = { $in: [cuisineType] };
        if (foodType) filter.foodType = { $in: [foodType, 'both'] };

        if (minPrice) {
            filter['priceRange.min'] = { $gte: Number(minPrice) };
        }
        if (maxPrice) {
            filter['priceRange.max'] = { $lte: Number(maxPrice) };
        }

        if (mealType) {
            filter[`mealsOffered.${mealType}.available`] = true;
        }

        // Check if provider still has capacity
        filter.$expr = { $lt: ['$currentTenants', '$maxTenants'] };

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const providers = await Provider.find(filter)
            .populate('userId', 'name phone email isPremium')
            .select('-kycDocuments') // Don't expose KYC docs
            .sort({ rating: -1, totalSubscriptions: -1 })
            .limit(limitNum)
            .skip(skip);

        // Check if requester is premium (for contact visibility)
        let requesterIsPremium = false;
        if (req.user) {
            const requester = await User.findById(req.user._id);
            requesterIsPremium = requester?.isPremium || false;
        }

        // Filter contact info based on premium status
        const filteredProviders = providers.map(provider => {
            const providerObj = provider.toObject();

            // Hide contact details for non-premium users
            if (!requesterIsPremium) {
                delete providerObj.location.address;
                delete providerObj.location.pincode;
                providerObj.contactVisible = false;

                if (providerObj.userId) {
                    delete providerObj.userId.phone;
                    delete providerObj.userId.email;
                }
            } else {
                providerObj.contactVisible = true;
            }

            // Add premium status
            providerObj.isPremium = providerObj.userId?.isPremium || false;

            return providerObj;
        });

        const totalResults = await Provider.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                providers: filteredProviders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalResults / limitNum),
                    totalResults,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get provider details by ID
// @route   GET /api/provider/:providerId
// @access  Public
const getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.providerId)
            .populate('userId', 'name phone email isPremium')
            .select('-kycDocuments');

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }

        const providerObj = provider.toObject();

        // Check if requester is premium or has accepted connection
        let contactVisible = false;
        let connectionStatus = null;
        let canRequestConnection = true;

        if (req.user) {
            const requester = await User.findById(req.user._id);
            const requesterIsPremium = requester?.isPremium || false;

            // Check if there's an accepted connection
            if (req.user.role === 'tenant') {
                const Tenant = require('../models/Tenant');
                const ConnectionRequest = require('../models/ConnectionRequest');

                const tenant = await Tenant.findOne({ userId: req.user._id });
                if (tenant) {
                    const connection = await ConnectionRequest.findOne({
                        tenantId: tenant._id,
                        providerId: provider._id,
                    }).sort({ createdAt: -1 });

                    if (connection) {
                        connectionStatus = connection.status;
                        canRequestConnection = false;

                        // Contact visible if connection accepted OR user is premium
                        if (connection.status === 'accepted' || requesterIsPremium) {
                            contactVisible = true;
                        }
                    }
                }
            }

            // Hide contact info if not visible
            if (!contactVisible) {
                delete providerObj.location.address;
                delete providerObj.location.pincode;
                if (providerObj.userId) {
                    delete providerObj.userId.phone;
                    delete providerObj.userId.email;
                }
            }
        } else {
            // Not logged in - hide contact info
            delete providerObj.location.address;
            delete providerObj.location.pincode;
            if (providerObj.userId) {
                delete providerObj.userId.phone;
                delete providerObj.userId.email;
            }
        }

        // Get reviews
        const reviews = await Review.find({
            revieweeProfileId: provider._id,
            revieweeType: 'provider',
        })
            .populate('reviewerId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        providerObj.contactVisible = contactVisible;
        providerObj.connectionStatus = connectionStatus;
        providerObj.canRequestConnection = canRequestConnection;
        providerObj.reviews = reviews;

        res.status(200).json({
            success: true,
            data: {
                provider: providerObj,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get connection requests for provider
// @route   GET /api/provider/connection-requests
// @access  Private (Provider)
const getConnectionRequests = async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider profile not found',
            });
        }

        const requests = await ConnectionRequest.find({
            providerId: provider._id,
            status: 'pending',
        })
            .populate('tenantUserId', 'name email phone')
            .populate('tenantId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { requests },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    registerProvider,
    getMyProfile,
    updateProfile,
    searchProviders,
    getProviderById,
    getConnectionRequests,
};

