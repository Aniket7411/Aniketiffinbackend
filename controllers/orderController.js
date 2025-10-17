const Order = require('../models/Order');
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../utils/razorpay');

// Generate unique order number
const generateOrderNumber = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${dateStr}-${random}`;
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { vendorId, items, deliveryAddress, deliveryTime, paymentMethod, specialInstructions } = req.body;

        // Validate vendor
        const vendor = await Vendor.findById(vendorId);
        if (!vendor || !vendor.isApproved || !vendor.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Vendor not available',
            });
        }

        // Calculate order totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);

            if (!menuItem || !menuItem.available) {
                return res.status(400).json({
                    success: false,
                    message: `Menu item ${item.menuItemId} is not available`,
                });
            }

            if (menuItem.vendorId.toString() !== vendorId) {
                return res.status(400).json({
                    success: false,
                    message: 'All items must be from the same vendor',
                });
            }

            const itemSubtotal = menuItem.price * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
                subtotal: itemSubtotal,
            });
        }

        const deliveryFee = vendor.deliveryFee || 0;
        const totalAmount = subtotal + deliveryFee;

        // Create order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            userId: req.user._id,
            vendorId,
            items: orderItems,
            deliveryAddress,
            subtotal,
            deliveryFee,
            totalAmount,
            paymentMethod,
            deliveryTime,
            specialInstructions,
            status: 'pending',
            paymentStatus: 'pending',
        });

        // Create Razorpay order if payment method is online
        let razorpayOrderId = null;
        if (paymentMethod === 'online') {
            try {
                const razorpayOrder = await createRazorpayOrder(
                    totalAmount,
                    'INR',
                    order.orderNumber
                );
                razorpayOrderId = razorpayOrder.id;
                order.razorpayOrderId = razorpayOrderId;
                await order.save();
            } catch (error) {
                // Delete order if Razorpay order creation fails
                await Order.findByIdAndDelete(order._id);
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Payment gateway error. Please try COD payment method.',
                });
            }
        } else if (paymentMethod === 'cod') {
            // For COD, mark as confirmed directly
            order.status = 'confirmed';
            order.paymentStatus = 'pending';
            await order.save();

            // Update vendor stats for COD orders
            await Vendor.findByIdAndUpdate(order.vendorId, {
                $inc: { totalOrders: 1 },
            });
        }

        // Clear cart after order creation
        await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { items: [], vendorId: null, deliveryFee: 0 }
        );

        res.status(201).json({
            success: true,
            data: {
                order: {
                    id: order._id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    totalAmount: order.totalAmount,
                    paymentStatus: order.paymentStatus,
                    razorpayOrderId,
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

// @desc    Verify payment
// @route   POST /api/orders/:orderId/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Verify user owns the order
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            order.paymentStatus = 'failed';
            await order.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
            });
        }

        // Update order
        order.paymentStatus = 'completed';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = 'confirmed';
        await order.save();

        // Update vendor stats
        await Vendor.findByIdAndUpdate(order.vendorId, {
            $inc: { totalOrders: 1 },
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                order,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { userId: req.user._id };

        if (status) {
            filter.status = status;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(filter)
            .populate('vendorId', 'businessName address')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip);

        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalOrders / limitNum),
                    totalOrders,
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

// @desc    Get order details
// @route   GET /api/orders/:orderId
// @access  Private
const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('vendorId', 'businessName address phone')
            .populate('items.menuItem');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check authorization
        if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                order,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check authorization
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        // Check if order can be cancelled
        if (['delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled',
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: {
                order,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get vendor orders (for vendors)
// @route   GET /api/orders/vendor/my-orders
// @access  Private (Vendor only)
const getVendorOrders = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found',
            });
        }

        const { status, page = 1, limit = 10 } = req.query;

        const filter = { vendorId: vendor._id };

        if (status) {
            filter.status = status;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(filter)
            .populate('userId', 'name phone')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip);

        const totalOrders = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalOrders / limitNum),
                    totalOrders,
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

// @desc    Update order status (for vendors)
// @route   PUT /api/orders/:orderId/status
// @access  Private (Vendor only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const vendor = await Vendor.findOne({ userId: req.user._id });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found',
            });
        }

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check if order belongs to vendor
        if (order.vendorId.toString() !== vendor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const validStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                order,
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
    createOrder,
    verifyPayment,
    getUserOrders,
    getOrderDetails,
    cancelOrder,
    getVendorOrders,
    updateOrderStatus,
};

