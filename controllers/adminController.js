const User = require('../models/User');
const Provider = require('../models/Provider');
const Tenant = require('../models/Tenant');
const Subscription = require('../models/Subscription');
const { createNotification } = require('./notificationController');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, isPremium, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) {
      filter.role = role;
    }
    if (isPremium !== undefined) {
      filter.isPremium = isPremium === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalUsers / limitNum),
          totalUsers,
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

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('vendorId', 'businessName')
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

// @desc    Get all vendors (including pending)
// @route   GET /api/admin/vendors
// @access  Private (Admin only)
const getAllVendors = async (req, res) => {
  try {
    const { isApproved, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const vendors = await Vendor.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalVendors = await Vendor.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        vendors,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalVendors / limitNum),
          totalVendors,
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

// @desc    Approve/Reject vendor
// @route   PUT /api/admin/vendors/:vendorId/status
// @access  Private (Admin only)
const updateVendorStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected',
      });
    }

    const vendor = await Vendor.findById(req.params.vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    vendor.isApproved = status === 'approved';
    vendor.approvalRemarks = remarks || '';
    vendor.isActive = status === 'approved';
    await vendor.save();

    res.status(200).json({
      success: true,
      message: `Vendor ${status} successfully`,
      data: {
        vendor,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalProviders = await Provider.countDocuments();
    const totalTenants = await Tenant.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    
    // Active subscriptions
    const activeConnections = await require('../models/ConnectionRequest').countDocuments({ status: 'accepted' });
    
    // Pending KYC
    const pendingKYC = await Provider.countDocuments({ kycStatus: 'submitted' }) +
                        await Tenant.countDocuments({ kycStatus: 'submitted' });

    // Revenue calculation (placeholder for future payment integration)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const thisMonthRevenue = 0; // Will be calculated from payment records
    const lastMonthRevenue = 0; // Will be calculated from payment records
    
    const growth = lastMonthRevenue > 0 
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) 
      : '0';

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalTenants,
        totalAdmins,
        premiumUsers,
        activeConnections,
        pendingKYC,
        revenue: {
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth: `${growth}%`,
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

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:userId/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin user',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
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

// @desc    Grant premium access
// @route   POST /api/admin/users/:userId/grant-premium
// @access  Private (Admin only)
const grantPremium = async (req, res) => {
  try {
    const { duration, reason } = req.body; // duration in days

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + (duration || 365));

    user.isPremium = true;
    user.premiumType = 'admin_granted';
    user.premiumStartDate = now;
    user.premiumExpiresAt = expiresAt;
    await user.save();

    // Send notification
    await createNotification(
      user._id,
      'premium_granted',
      'Premium Access Granted!',
      `You have been granted premium access for ${duration || 365} days. ${reason || ''}`,
      {
        duration,
        expiresAt,
        reason,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Premium access granted successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          isPremium: user.isPremium,
          premiumType: user.premiumType,
          premiumExpiresAt: user.premiumExpiresAt,
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

// @desc    Revoke premium access
// @route   POST /api/admin/users/:userId/revoke-premium
// @access  Private (Admin only)
const revokePremium = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isPremium = false;
    user.premiumType = null;
    user.premiumStartDate = null;
    user.premiumExpiresAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Premium access revoked successfully',
      data: {
        reason,
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
  getAllUsers,
  getDashboardStats,
  toggleUserStatus,
  grantPremium,
  revokePremium,
  // Old exports (commented - kept for future)
  // getAllOrders,
  // getAllVendors,
  // updateVendorStatus,
};

