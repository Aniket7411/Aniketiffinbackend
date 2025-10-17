const User = require('../models/User');
const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) {
            // Add new address or update existing
            if (address._id) {
                const addressIndex = user.address.findIndex(
                    addr => addr._id.toString() === address._id
                );
                if (addressIndex > -1) {
                    user.address[addressIndex] = address;
                }
            } else {
                user.address.push(address);
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
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

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
const addAddress = async (req, res) => {
    try {
        const { street, city, state, pincode, isDefault } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // If this is set as default, unset all other defaults
        if (isDefault) {
            user.address.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.address.push({
            street,
            city,
            state,
            pincode,
            isDefault: isDefault || false,
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Address added successfully',
            data: {
                address: user.address,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Search (vendors and menu items)
// @route   GET /api/search
// @access  Public
const search = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }

        const searchRegex = new RegExp(q, 'i');
        let results = {};

        if (type === 'all' || type === 'vendor') {
            const vendors = await Vendor.find({
                isApproved: true,
                isActive: true,
                $or: [
                    { businessName: searchRegex },
                    { description: searchRegex },
                    { cuisineType: { $in: [searchRegex] } },
                ],
            })
                .select('businessName description rating cuisineType address')
                .limit(10);

            results.vendors = vendors;
        }

        if (type === 'all' || type === 'menu') {
            const menuItems = await MenuItem.find({
                available: true,
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                ],
            })
                .populate('vendorId', 'businessName')
                .limit(10);

            results.menuItems = menuItems;
        }

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get notifications (placeholder)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        // This is a placeholder for future implementation
        // In production, you'd fetch from a Notification model
        const notifications = [
            {
                id: '1',
                type: 'order',
                message: 'Your order has been delivered',
                createdAt: new Date(),
                read: false,
            },
        ];

        res.status(200).json({
            success: true,
            data: {
                notifications,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    updateProfile,
    addAddress,
    search,
    getNotifications,
};

