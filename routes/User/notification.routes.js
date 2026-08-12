const express = require('express');
const router = express.Router();
const {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteBulkNotifications,
    registerFCMToken,
    removeFCMToken
} = require('../../controller/notification.controller');
// Note: userVerifyToken is already applied at the mount point in index.routes.js
// Do NOT re-apply it here to avoid double auth middleware

// Get user notifications
router.get('/', getUserNotifications);

// ⚠️ IMPORTANT: specific routes must come BEFORE param routes
// Mark ALL notifications as read (must be before /:id/read)
router.patch('/read-all', markAllNotificationsRead);

// Mark single notification as read
router.patch('/:id/read', markNotificationRead);

// Delete multiple notifications
router.delete('/bulk', deleteBulkNotifications);

// Delete notification
router.delete('/:id', deleteNotification);

// Register FCM token
router.post('/fcm/register', registerFCMToken);

// Remove FCM token
router.post('/fcm/remove', removeFCMToken);

module.exports = router;
