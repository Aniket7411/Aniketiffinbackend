const User = require('../models/User');

// @desc    Get premium status
// @route   GET /api/premium/status
// @access  Private
const getPremiumStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const now = new Date();
    let daysRemaining = 0;

    if (user.isPremium && user.premiumExpiresAt) {
      const diff = user.premiumExpiresAt - now;
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      // Auto-expire if past date
      if (daysRemaining <= 0) {
        user.isPremium = false;
        user.premiumType = null;
        user.premiumExpiresAt = null;
        await user.save();
        daysRemaining = 0;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        isPremium: user.isPremium,
        premiumType: user.premiumType,
        startDate: user.premiumStartDate,
        expiresAt: user.premiumExpiresAt,
        daysRemaining,
        benefits: [
          'See provider contact details',
          'Unlimited connection requests',
          'Priority customer support',
          'Advanced search filters',
        ],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get premium plans
// @route   GET /api/premium/plans
// @access  Public
const getPremiumPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'monthly',
        name: 'Monthly Premium',
        price: 299,
        duration: '30 days',
        features: [
          'See all provider contact details',
          'Unlimited connection requests',
          'Priority support',
          'Advanced search filters',
        ],
      },
      {
        id: 'quarterly',
        name: 'Quarterly Premium',
        price: 799,
        duration: '90 days',
        discount: '10%',
        savings: 98,
        features: [
          'All monthly benefits',
          'Save ₹98',
          '3 months access',
        ],
      },
      {
        id: 'yearly',
        name: 'Yearly Premium',
        price: 2999,
        duration: '365 days',
        discount: '17%',
        savings: 589,
        features: [
          'All monthly benefits',
          'Save ₹589',
          'Best value',
          '1 year access',
        ],
      },
    ];

    res.status(200).json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPremiumStatus,
  getPremiumPlans,
};

