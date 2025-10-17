const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  getUnreadCount,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

module.exports = router;

