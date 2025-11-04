const User = require('../models/User');
const Provider = require('../models/Provider');
const Tenant = require('../models/Tenant');
const generateToken = require('../utils/generateToken');

// Import completion calculators
const { calculateProviderCompletion } = require('../utils/profileCompletion');
const { calculateTenantCompletion } = require('../utils/profileCompletion');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      address: [address],
      role: 'user',
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isPremium: false,
            premiumExpiresAt: null,
          },
          token: generateToken(user._id, user.email, user.role),
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isPremium: user.isPremium || false,
          premiumExpiresAt: user.premiumExpiresAt,
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

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    // Check if ADMIN_SECRET_CODE is configured
    if (!process.env.ADMIN_SECRET_CODE) {
      return res.status(500).json({
        success: false,
        message: 'Admin secret code not configured. Please add ADMIN_SECRET_CODE to .env file',
      });
    }

    // Verify admin code
    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code. Please check your admin code.',
      });
    }

    // Check for user
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Admin user not found. Please check email or run seed:admin script.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
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

// @desc    Register vendor
// @route   POST /api/auth/vendor/register
// @access  Public
const registerVendor = async (req, res) => {
  try {
    const { name, email, phone, password, businessName, fssaiLicense, address, bankDetails } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Check if FSSAI license exists
    const fssaiExists = await Vendor.findOne({ fssaiLicense });
    if (fssaiExists) {
      return res.status(400).json({
        success: false,
        message: 'FSSAI license already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'vendor',
    });

    // Create vendor profile
    const vendor = await Vendor.create({
      userId: user._id,
      businessName,
      fssaiLicense,
      address,
      bankDetails,
      isApproved: false, // Requires admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully. Pending admin approval.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          isApproved: vendor.isApproved,
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let additionalData = {};
    let profileCompletion = null;

    // If user is a provider, get provider details
    if (user.role === 'provider') {
      const provider = await Provider.findOne({ userId: user._id });
      additionalData.provider = provider;
      if (provider) {
        profileCompletion = calculateProviderCompletion(provider);
      }
    }

    // If user is a tenant, get tenant details
    if (user.role === 'tenant') {
      const tenant = await Tenant.findOne({ userId: user._id });
      additionalData.tenant = tenant;
      if (tenant) {
        profileCompletion = calculateTenantCompletion(tenant);
      }
    }

    // Get unread notification count
    const Notification = require('../models/Notification');
    const notificationCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt,
          kycStatus: user.kycStatus,
          notificationCount,
          address: user.address,
          ...additionalData,
        },
        profileCompletion,
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
  registerUser,
  loginUser,
  loginAdmin,
  registerVendor,
  getCurrentUser,
};

