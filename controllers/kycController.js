const Provider = require('../models/Provider');
const Tenant = require('../models/Tenant');

// NOTE: File upload functionality requires multer middleware
// This is a simplified version - in production, integrate with cloud storage (AWS S3, Cloudinary)

// @desc    Upload KYC documents
// @route   POST /api/kyc/upload
// @access  Private (Provider or Tenant)
const uploadKYC = async (req, res) => {
    try {
        const {
            aadharNumber,
            aadharFront, // These would be file URLs after upload
            aadharBack,
            photo,
            addressProof,
        } = req.body;

        let profile;
        let Model;

        if (req.user.role === 'provider') {
            Model = Provider;
            profile = await Provider.findOne({ userId: req.user._id });
        } else if (req.user.role === 'tenant') {
            Model = Tenant;
            profile = await Tenant.findOne({ userId: req.user._id });
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        // Update KYC documents
        profile.kycDocuments = {
            aadharNumber,
            aadharFront,
            aadharBack,
            photo,
            addressProof,
        };
        profile.kycStatus = 'submitted';

        await profile.save();

        res.status(200).json({
            success: true,
            message: 'KYC documents submitted successfully. Waiting for admin verification.',
            data: {
                kycStatus: profile.kycStatus,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
const getKYCStatus = async (req, res) => {
    try {
        let profile;

        if (req.user.role === 'provider') {
            profile = await Provider.findOne({ userId: req.user._id }).select(
                'kycStatus kycRemarks'
            );
        } else if (req.user.role === 'tenant') {
            profile = await Tenant.findOne({ userId: req.user._id }).select(
                'kycStatus kycRemarks'
            );
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                kycStatus: profile.kycStatus,
                kycRemarks: profile.kycRemarks,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Verify KYC (Admin only)
// @route   PUT /api/kyc/verify/:profileId
// @access  Private (Admin)
const verifyKYC = async (req, res) => {
    try {
        const { profileType, status, remarks } = req.body; // profileType: 'provider' or 'tenant', status: 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either verified or rejected',
            });
        }

        let Model = profileType === 'provider' ? Provider : Tenant;
        let profile = await Model.findById(req.params.profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        profile.kycStatus = status;
        profile.kycRemarks = remarks || '';
        await profile.save();

        res.status(200).json({
            success: true,
            message: `KYC ${status} successfully`,
            data: {
                profileId: profile._id,
                kycStatus: profile.kycStatus,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get pending KYC verifications (Admin)
// @route   GET /api/kyc/pending
// @access  Private (Admin)
const getPendingKYC = async (req, res) => {
    try {
        const pendingProviders = await Provider.find({ kycStatus: 'submitted' })
            .populate('userId', 'name email phone')
            .select('displayName kycDocuments location createdAt');

        const pendingTenants = await Tenant.find({ kycStatus: 'submitted' })
            .populate('userId', 'name email phone')
            .select('displayName kycDocuments location createdAt');

        res.status(200).json({
            success: true,
            data: {
                pendingProviders,
                pendingTenants,
                totalPending: pendingProviders.length + pendingTenants.length,
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
    uploadKYC,
    getKYCStatus,
    verifyKYC,
    getPendingKYC,
};

