const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
  }
};

// Provider middleware (home cook)
const provider = (req, res, next) => {
  if (req.user && req.user.role === 'provider') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as a provider',
    });
  }
};

// Tenant middleware (student/PG)
const tenant = (req, res, next) => {
  if (req.user && req.user.role === 'tenant') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as a tenant',
    });
  }
};

// OLD: Vendor middleware (kept for backward compatibility)
const vendor = provider;

module.exports = { protect, admin, provider, tenant, vendor };

