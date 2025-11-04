const ConnectionRequest = require('../models/ConnectionRequest');
const Provider = require('../models/Provider');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Send connection request from tenant to provider
// @route   POST /api/connection/request
// @access  Private (Tenant)
const sendConnectionRequest = async (req, res) => {
    try {
        const { providerId, message, sampleFoodRequest } = req.body;

        // Check if user is tenant
        if (req.user.role !== 'tenant') {
            return res.status(403).json({
                success: false,
                message: 'Only tenants can send connection requests',
            });
        }

        // Get tenant profile
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant profile not found',
            });
        }

        // Check tenant KYC
        if (tenant.kycStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Please complete KYC verification before sending connection requests',
            });
        }

        // Get provider
        const provider = await Provider.findById(providerId).populate('userId');
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: 'Provider not found',
            });
        }

        // Check if provider has capacity
        if (provider.currentTenants >= provider.maxTenants) {
            return res.status(400).json({
                success: false,
                message: 'Provider has reached maximum tenant capacity',
            });
        }

        // Check for existing request
        const existingRequest = await ConnectionRequest.findOne({
            tenantId: tenant._id,
            providerId: provider._id,
            status: 'pending',
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'Connection request already sent to this provider',
            });
        }

        // Create connection request
        const connectionRequest = await ConnectionRequest.create({
            tenantId: tenant._id,
            providerId: provider._id,
            tenantUserId: req.user._id,
            providerUserId: provider.userId._id,
            requestedBy: 'tenant',
            message,
            monthlyBudget: tenant.monthlyBudget,
            sampleFoodRequest: sampleFoodRequest || false,
            tenantKycVerified: tenant.kycStatus === 'verified',
            providerKycVerified: provider.kycStatus === 'verified',
        });

        // Get tenant user for phone number
        const tenantUser = await User.findById(req.user._id);

        // Send notification to provider (include tenant phone for business purposes)
        await createNotification(
            provider.userId._id,
            'connection_request',
            'New Connection Request',
            `${tenant.displayName || req.user.name} sent you a connection request${sampleFoodRequest ? ' with sample food request' : ''}`,
            {
                requestId: connectionRequest._id,
                tenantId: tenant._id,
                tenantName: tenant.displayName || req.user.name,
                tenantPhone: tenantUser?.phone || '',
                sampleFoodRequest,
            }
        );

        // Send notification to admin (include tenant phone for mediation/coordination)
        const adminUsers = await User.find({ role: 'admin' });
        for (const admin of adminUsers) {
            await createNotification(
                admin._id,
                'admin_connection_request',
                'New Connection Request',
                `${tenant.displayName || req.user.name} sent a connection request to ${provider.displayName}`,
                {
                    requestId: connectionRequest._id,
                    tenantId: tenant._id,
                    providerId: provider._id,
                    tenantName: tenant.displayName || req.user.name,
                    tenantPhone: tenantUser?.phone || '',
                }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Connection request sent successfully',
            data: { connectionRequest },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Respond to connection request (Provider)
// @route   PUT /api/connection/respond/:requestId
// @access  Private (Provider)
const respondToRequest = async (req, res) => {
    try {
        const { status, message, sampleFoodApproved } = req.body; // status: 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either accepted or rejected',
            });
        }

        const request = await ConnectionRequest.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found',
            });
        }

        // Check if request belongs to this provider
        if (request.providerUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been responded to',
            });
        }

        request.status = status;
        request.providerMessage = message || '';
        request.respondedAt = new Date();

        // If accepted, share contacts and handle sample food
        if (status === 'accepted') {
            request.contactShared = true;
            if (request.sampleFoodRequest && sampleFoodApproved !== undefined) {
                request.sampleFoodApproved = sampleFoodApproved;
            }
        }

        await request.save();

        // Send notification to tenant
        const notificationType = status === 'accepted' ? 'request_accepted' : 'request_rejected';
        const notificationTitle = status === 'accepted' ? 'Request Accepted!' : 'Request Declined';
        const notificationMessage = status === 'accepted'
            ? `Your connection request has been accepted by the provider`
            : `Your connection request was declined`;

        await createNotification(
            request.tenantUserId,
            notificationType,
            notificationTitle,
            notificationMessage,
            {
                requestId: request._id,
                providerId: request.providerId,
                status,
                sampleFoodApproved: request.sampleFoodApproved,
            }
        );

        res.status(200).json({
            success: true,
            message: `Connection request ${status}`,
            data: { request },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get my connection requests
// @route   GET /api/connection/my-requests
// @access  Private
const getMyRequests = async (req, res) => {
    try {
        let requests;

        if (req.user.role === 'tenant') {
            const tenant = await Tenant.findOne({ userId: req.user._id });
            requests = await ConnectionRequest.find({ tenantId: tenant._id })
                .populate('providerUserId', 'name email phone')
                .populate('providerId')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'provider') {
            const provider = await Provider.findOne({ userId: req.user._id });
            requests = await ConnectionRequest.find({ providerId: provider._id })
                .populate('tenantUserId', 'name email phone')
                .populate('tenantId')
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            data: { requests },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get connection request by ID
// @route   GET /api/connection/request/:requestId
// @access  Private
const getConnectionRequestById = async (req, res) => {
    try {
        const request = await ConnectionRequest.findById(req.params.requestId)
            .populate('tenantId')
            .populate('tenantUserId', 'name email phone')
            .populate('providerId')
            .populate('providerUserId', 'name email phone');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Connection request not found',
            });
        }

        // Check authorization - user must be either tenant or provider involved
        const isAuthorized =
            request.tenantUserId.toString() === req.user._id.toString() ||
            request.providerUserId.toString() === req.user._id.toString() ||
            req.user.role === 'admin';

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this request',
            });
        }

        res.status(200).json({
            success: true,
            data: { request },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    sendConnectionRequest,
    respondToRequest,
    getMyRequests,
    getConnectionRequestById,
};

