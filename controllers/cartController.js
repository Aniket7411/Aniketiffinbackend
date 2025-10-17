const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.menuItem')
            .populate('vendorId', 'businessName deliveryFee');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }

        res.status(200).json({
            success: true,
            data: {
                cart: {
                    items: cart.items.map(item => ({
                        menuItem: {
                            id: item.menuItem._id,
                            name: item.menuItem.name,
                            price: item.price,
                        },
                        quantity: item.quantity,
                        subtotal: item.price * item.quantity,
                    })),
                    totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
                    subtotal: cart.subtotal,
                    deliveryFee: cart.deliveryFee,
                    total: cart.total,
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

// @desc    Add to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;

        // Find menu item
        const menuItem = await MenuItem.findById(menuItemId).populate('vendorId');

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
        }

        if (!menuItem.available) {
            return res.status(400).json({
                success: false,
                message: 'Menu item is not available',
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                userId: req.user._id,
                vendorId: menuItem.vendorId._id,
                items: [],
                deliveryFee: menuItem.vendorId.deliveryFee || 0,
            });
        }

        // Check if item is from different vendor
        if (cart.vendorId && cart.vendorId.toString() !== menuItem.vendorId._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot add items from different vendors. Please clear cart first.',
            });
        }

        // Set vendor if not set
        if (!cart.vendorId) {
            cart.vendorId = menuItem.vendorId._id;
            cart.deliveryFee = menuItem.vendorId.deliveryFee || 0;
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.menuItem.toString() === menuItemId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                menuItem: menuItemId,
                quantity,
                price: menuItem.price,
            });
        }

        await cart.save();

        // Populate cart before sending response
        cart = await Cart.findById(cart._id)
            .populate('items.menuItem')
            .populate('vendorId', 'businessName deliveryFee');

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: {
                cart,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1',
            });
        }

        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.menuItem.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate('items.menuItem')
            .populate('vendorId', 'businessName deliveryFee');

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: {
                cart: updatedCart,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = cart.items.filter(
            item => item.menuItem.toString() !== req.params.itemId
        );

        // If cart is empty, clear vendor
        if (cart.items.length === 0) {
            cart.vendorId = null;
            cart.deliveryFee = 0;
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: {
                cart,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = [];
        cart.vendorId = null;
        cart.deliveryFee = 0;
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                cart,
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
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};

