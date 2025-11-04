const express = require('express');
const router = express.Router();
const {
    sendConnectionRequest,
    respondToRequest,
    getMyRequests,
    getConnectionRequestById,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');
const { connectionRequestValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

router.post('/request', connectionRequestValidation, validate, sendConnectionRequest);
router.put('/respond/:requestId', respondToRequest);
router.get('/my-requests', getMyRequests);
router.get('/request/:requestId', getConnectionRequestById);

module.exports = router;

