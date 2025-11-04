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
    const totalProviders = await Provider.countDocuments();
    const activeProviders = await Provider.countDocuments({ isActive: true });
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({ isActive: true });
    
    // Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
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
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? parseFloat((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
      : 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todaySubscriptions = await Subscription.countDocuments({ createdAt: { $gte: today } });
    const todayRevenue = 0; // Will be calculated from payment records

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProviders,
          activeProviders,
          totalTenants,
          activeTenants,
          activeSubscriptions,
          totalRevenue: thisMonthRevenue,
          monthlyGrowth,
          pendingKYC,
          todayRegistrations: todayUsers,
          today: {
            newRegistrations: todayUsers,
            newSubscriptions: todaySubscriptions,
            revenue: todayRevenue,
          },
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

// @desc    Get all providers (Admin)
// @route   GET /api/admin/providers
// @access  Private (Admin only)
const getProviders = async (req, res) => {
  try {
    const { search, status, kycStatus } = req.query;

    const filter = {};
    if (status) {
      filter.isActive = status === 'active';
    }
    if (kycStatus) {
      filter.kycStatus = kycStatus;
    }

    const providers = await Provider.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    // Apply search filter if provided
    let filteredProviders = providers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProviders = providers.filter(provider => 
        provider.displayName.toLowerCase().includes(searchLower) ||
        provider.userId?.name?.toLowerCase().includes(searchLower) ||
        provider.userId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Format response
    const formattedProviders = filteredProviders.map(provider => ({
      _id: provider._id,
      name: provider.userId?.name || '',
      displayName: provider.displayName,
      email: provider.userId?.email || '',
      location: provider.location?.area && provider.location?.city 
        ? `${provider.location.area}, ${provider.location.city}` 
        : '',
      rating: provider.rating,
      currentTenants: provider.currentTenants,
      maxTenants: provider.maxTenants,
      kycStatus: provider.kycStatus,
      isActive: provider.isActive,
      isPremium: provider.userId?.isPremium || false,
    }));

    res.status(200).json({
      success: true,
      data: {
        providers: formattedProviders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all tenants (Admin)
// @route   GET /api/admin/tenants
// @access  Private (Admin only)
const getTenants = async (req, res) => {
  try {
    const { search, status, kycStatus } = req.query;

    const filter = {};
    if (status) {
      filter.isActive = status === 'active';
    }
    if (kycStatus) {
      filter.kycStatus = kycStatus;
    }

    const tenants = await Tenant.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    // Apply search filter if provided
    let filteredTenants = tenants;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTenants = tenants.filter(tenant => 
        tenant.displayName.toLowerCase().includes(searchLower) ||
        tenant.userId?.name?.toLowerCase().includes(searchLower) ||
        tenant.userId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Get subscription counts for each tenant
    const formattedTenants = await Promise.all(filteredTenants.map(async (tenant) => {
      const activeSubscriptions = await Subscription.countDocuments({
        tenantUserId: tenant.userId,
        status: 'active',
      });

      const totalSpent = 0; // TODO: Calculate from payment records

      return {
        _id: tenant._id,
        name: tenant.userId?.name || '',
        displayName: tenant.displayName,
        email: tenant.userId?.email || '',
        location: tenant.location?.area && tenant.location?.city 
          ? `${tenant.location.area}, ${tenant.location.city}` 
          : '',
        accommodationType: tenant.accommodationType,
        activeSubscriptions,
        totalSpent,
        kycStatus: tenant.kycStatus,
        isActive: tenant.isActive,
        isPremium: tenant.userId?.isPremium || false,
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        tenants: formattedTenants,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all connection requests (Admin)
// @route   GET /api/admin/connection-requests
// @access  Private (Admin only)
const getConnectionRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const requests = await require('../models/ConnectionRequest').find(filter)
      .populate('tenantId')
      .populate('tenantUserId', 'name email')
      .populate('providerId')
      .populate('providerUserId', 'name email')
      .sort({ createdAt: -1 });

    // Format response
    const formattedRequests = requests.map(request => ({
      _id: request._id,
      tenant: {
        _id: request.tenantId._id,
        displayName: request.tenantId.displayName,
        email: request.tenantUserId.email,
        monthlyBudget: request.monthlyBudget,
      },
      provider: {
        _id: request.providerId._id,
        displayName: request.providerId.displayName,
        email: request.providerUserId.email,
      },
      message: request.message,
      monthlyBudget: request.monthlyBudget,
      status: request.status,
      createdAt: request.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        requests: formattedRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
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
        message: 'Cannot delete admin user',
      });
    }

    // Delete associated profile
    if (user.role === 'provider') {
      await Provider.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'tenant') {
      await Tenant.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update premium status (Admin)
// @route   PUT /api/admin/providers/:userId/premium
// @route   PUT /api/admin/tenants/:userId/premium
// @access  Private (Admin only)
const updatePremiumStatus = async (req, res) => {
  try {
    const { isPremium } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isPremium = isPremium;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Premium status ${isPremium ? 'granted' : 'revoked'}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isPremium: user.isPremium,
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

// @desc    Get user details by ID (Admin)
// @route   GET /api/admin/providers/:userId
// @route   GET /api/admin/tenants/:userId
// @access  Private (Admin only)
const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userType = req.path.includes('/providers/') ? 'provider' : 'tenant';

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profile;
    if (userType === 'provider') {
      profile = await Provider.findOne({ userId }).populate('userId');
    } else {
      profile = await Tenant.findOne({ userId }).populate('userId');
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
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
  getProviders,
  getTenants,
  getConnectionRequests,
  deleteUser,
  updatePremiumStatus,
  getUserDetails,
  // Old exports (commented - kept for future)
  // getAllOrders,
  // getAllVendors,
  // updateVendorStatus,
};

