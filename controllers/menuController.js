const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');

// @desc    Add menu item
// @route   POST /api/vendors/menu
// @access  Private (Vendor only)
const addMenuItem = async (req, res) => {
    try {
        // Find vendor by user ID
        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found',
            });
        }

        if (!vendor.isApproved) {
            return res.status(403).json({
                success: false,
                message: 'Vendor account not approved yet',
            });
        }

        const { name, description, price, category, isVeg, preparationTime } = req.body;

        const menuItem = await MenuItem.create({
            vendorId: vendor._id,
            name,
            description,
            price,
            category,
            isVeg,
            preparationTime,
        });

        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            data: {
                menuItem,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update menu item
// @route   PUT /api/vendors/menu/:itemId
// @access  Private (Vendor only)
const updateMenuItem = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found',
            });
        }

        const menuItem = await MenuItem.findById(req.params.itemId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
        }

        // Check if menu item belongs to vendor
        if (menuItem.vendorId.toString() !== vendor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this menu item',
            });
        }

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.itemId,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: {
                menuItem: updatedMenuItem,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/vendors/menu/:itemId
// @access  Private (Vendor only)
const deleteMenuItem = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found',
            });
        }

        const menuItem = await MenuItem.findById(req.params.itemId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
        }

        // Check if menu item belongs to vendor
        if (menuItem.vendorId.toString() !== vendor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this menu item',
            });
        }

        await MenuItem.findByIdAndDelete(req.params.itemId);

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get vendor's own menu items
// @route   GET /api/vendors/menu/my-items
// @access  Private (Vendor only)
const getMyMenuItems = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found',
            });
        }

        const menuItems = await MenuItem.find({ vendorId: vendor._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                menuItems,
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
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMyMenuItems,
};

