const express = require('express');
const router = express.Router();
const {
    getAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead
} = require('../../controller/notification.controller');
const { adminVerifyToken } = require('../../helper/admin.verifyToken');

// Get admin notifications
router.get('/', adminVerifyToken, getAdminNotifications);

// Mark single admin notification as read
router.patch('/:id/read', adminVerifyToken, markAdminNotificationRead);

// Mark all admin notifications as read
router.patch('/read-all', adminVerifyToken, markAllAdminNotificationsRead);

module.exports = router;
