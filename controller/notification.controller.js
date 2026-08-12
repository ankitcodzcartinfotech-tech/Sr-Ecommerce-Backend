const Notification = require('../model/notification.model');
const User = require('../model/user.model');
const { getUserNotifications, markNotificationRead, markAllNotificationsRead } = require('../services/notification.service');

// Get user notifications
const getUserNotificationsRoute = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const result = await getUserNotifications(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            unreadOnly: unreadOnly === 'true'
        });
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark notification as read
const markNotificationReadRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const notification = await markNotificationRead(id, userId);
        
        res.json({ success: true, notification });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Mark all notifications as read
const markAllNotificationsReadRoute = async (req, res) => {
    try {
        const userId = req.user._id;
        await markAllNotificationsRead(userId);
        
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete notification
const deleteNotificationRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        await Notification.findOneAndDelete({ _id: id, user: userId });
        
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete multiple notifications
const deleteBulkNotificationsRoute = async (req, res) => {
    try {
        const { ids } = req.body;
        const userId = req.user._id;
        
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'Invalid notification IDs' });
        }
        
        await Notification.deleteMany({ _id: { $in: ids }, user: userId });
        
        res.json({ success: true, message: 'Notifications deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Register FCM token
const registerFCMToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user._id;
        
        if (!token) {
            return res.status(400).json({ success: false, message: 'FCM token is required' });
        }
        
        // Add token to user's fcmTokens array if not already present
        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { fcmTokens: token } },
            { new: true }
        );
        
        res.json({ success: true, message: 'FCM token registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove FCM token
const removeFCMToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user._id;
        
        if (!token) {
            return res.status(400).json({ success: false, message: 'FCM token is required' });
        }
        
        // Remove token from user's fcmTokens array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { fcmTokens: token } },
            { new: true }
        );
        
        res.json({ success: true, message: 'FCM token removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get admin notifications
const getAdminNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const query = { isAdmin: true };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const unreadCount = await Notification.countDocuments({ isAdmin: true, isRead: false });
        
        res.json({
            success: true,
            notifications,
            unreadCount,
            total: await Notification.countDocuments({ isAdmin: true })
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark admin notification as read
const markAdminNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            { _id: id, isAdmin: true },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        
        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark all admin notifications as read
const markAllAdminNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { isAdmin: true, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        
        res.json({ success: true, message: 'All admin notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUserNotifications: getUserNotificationsRoute,
    markNotificationRead: markNotificationReadRoute,
    markAllNotificationsRead: markAllNotificationsReadRoute,
    deleteNotification: deleteNotificationRoute,
    deleteBulkNotifications: deleteBulkNotificationsRoute,
    registerFCMToken,
    removeFCMToken,
    getAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead
};
