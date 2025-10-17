const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
const getAllVendors = async (req, res) => {
  try {
    const { city, cuisine, rating, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter = { isApproved: true, isActive: true };

    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (cuisine) {
      filter.cuisineType = { $in: [cuisine] };
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get vendors
    const vendors = await Vendor.find(filter)
      .populate('userId', 'name email phone')
      .select('-bankDetails')
      .sort({ rating: -1 })
      .limit(limitNum)
      .skip(skip);

    // Get total count
    const totalVendors = await Vendor.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        vendors: vendors.map(vendor => ({
          id: vendor._id,
          businessName: vendor.businessName,
          rating: vendor.rating,
          totalOrders: vendor.totalOrders,
          cuisineType: vendor.cuisineType,
          deliveryTime: vendor.deliveryTime,
          location: vendor.address.city,
          isActive: vendor.isActive,
        })),
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

// @desc    Get vendor details
// @route   GET /api/vendors/:vendorId
// @access  Public
const getVendorDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId)
      .populate('userId', 'name email phone')
      .select('-bankDetails');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    // Get menu items
    const menu = await MenuItem.find({ vendorId: vendor._id, available: true });

    // Get reviews
    const reviews = await Review.find({ vendorId: vendor._id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          description: vendor.description,
          rating: vendor.rating,
          totalOrders: vendor.totalOrders,
          cuisineType: vendor.cuisineType,
          deliveryTime: vendor.deliveryTime,
          minOrder: vendor.minOrder,
          deliveryFee: vendor.deliveryFee,
          location: vendor.address.city,
          menu,
          reviews,
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

// @desc    Get vendor menu
// @route   GET /api/vendors/:vendorId/menu
// @access  Public
const getVendorMenu = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    const menu = await MenuItem.find({ vendorId: req.params.vendorId });

    res.status(200).json({
      success: true,
      data: {
        menu,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get vendor reviews
// @route   GET /api/vendors/:vendorId/reviews
// @access  Public
const getVendorReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ vendorId: req.params.vendorId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalReviews = await Review.countDocuments({ vendorId: req.params.vendorId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalReviews / limitNum),
          totalReviews,
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

module.exports = {
  getAllVendors,
  getVendorDetails,
  getVendorMenu,
  getVendorReviews,
};

