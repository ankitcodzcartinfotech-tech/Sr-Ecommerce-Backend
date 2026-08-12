const Notification = require('../model/notification.model');
const { emitToUser, emitToAdmins, emitToOrderRoom } = require('../socket.io');

// Notification config with icons and priorities
const notificationConfig = {
    ORDER_PLACED: { title: 'Order Placed!', icon: 'shopping-bag', priority: 'HIGH', link: (data) => `/orders/${data.orderId}` },
    ORDER_CONFIRMED: { title: 'Order Confirmed', icon: 'check-circle', priority: 'MEDIUM', link: (data) => `/orders/${data.orderId}` },
    ORDER_PACKED: { title: 'Order Packed', icon: 'package', priority: 'MEDIUM', link: (data) => `/orders/${data.orderId}` },
    ORDER_SHIPPED: { title: 'Order Shipped', icon: 'truck', priority: 'HIGH', link: (data) => `/orders/${data.orderId}` },
    ORDER_OUT_FOR_DELIVERY: { title: 'Out for Delivery', icon: 'map-pin', priority: 'URGENT', link: (data) => `/orders/${data.orderId}` },
    ORDER_DELIVERED: { title: 'Order Delivered!', icon: 'gift', priority: 'HIGH', link: (data) => `/orders/${data.orderId}` },
    ORDER_CANCELLED: { title: 'Order Cancelled', icon: 'x-circle', priority: 'HIGH', link: (data) => `/orders/${data.orderId}` },
    ORDER_RETURNED: { title: 'Order Returned', icon: 'rotate-ccw', priority: 'MEDIUM', link: (data) => `/orders/${data.orderId}` },
    REFUND_PROCESSED: { title: 'Refund Processed', icon: 'dollar-sign', priority: 'HIGH', link: (data) => `/orders/${data.orderId}` },
    WELCOME: { title: 'Welcome to Keshrag!', icon: 'sparkles', priority: 'MEDIUM', link: () => '/' },
    PROFILE_COMPLETED: { title: 'Profile Completed!', icon: 'user-check', priority: 'LOW', link: () => '/account' },
    PASSWORD_CHANGED: { title: 'Password Changed', icon: 'shield', priority: 'MEDIUM', link: () => '/account' },
    EMAIL_VERIFIED: { title: 'Email Verified', icon: 'check', priority: 'LOW', link: () => '/account' },
    PHONE_VERIFIED: { title: 'Phone Verified', icon: 'phone-call', priority: 'LOW', link: () => '/account' },
    ADMIN_NEW_ORDER: { title: 'New Order Received', icon: 'bell', priority: 'URGENT', link: (data) => `/admin/orders/${data.orderId}` },
    ADMIN_LOW_STOCK: { title: 'Low Stock Alert', icon: 'alert-triangle', priority: 'HIGH', link: (data) => `/admin/products/${data.productId}` },
    ADMIN_NEW_USER: { title: 'New User Registered', icon: 'user-plus', priority: 'LOW', link: () => '/admin/users' },
    ADMIN_CONTACT_FORM: { title: 'New Contact Form', icon: 'mail', priority: 'MEDIUM', link: () => '/admin/contacts' },
    ADMIN_RETURN_REQUEST: { title: 'Return Request Received', icon: 'rotate-ccw', priority: 'HIGH', link: (data) => `/admin/orders/${data.orderId}` },
    ADMIN_REFUND_REQUEST: { title: 'Refund Request Received', icon: 'dollar-sign', priority: 'HIGH', link: (data) => `/admin/orders/${data.orderId}` },
};

/**
 * Create and send a notification
 * @param {Object} options - Notification options
 * @param {string} options.type - Notification type
 * @param {string} options.message - Notification message
 * @param {string|ObjectId} [options.userId] - User ID to send to
 * @param {Object} [options.metadata={}] - Additional metadata
 * @param {boolean} [options.isAdmin=false] - Is this an admin notification?
 */
const sendNotification = async (options) => {
    try {
        const { type, message, userId, metadata = {}, isAdmin = false } = options;
        
        const config = notificationConfig[type] || { title: 'Notification', icon: 'bell', priority: 'MEDIUM' };
        
        // Create notification object with generated ID to allow immediate emitting
        const mongoose = require('mongoose');
        const notificationData = {
            _id: new mongoose.Types.ObjectId(),
            title: config.title,
            message,
            type,
            priority: config.priority,
            icon: config.icon,
            metadata,
            isAdmin,
            user: isAdmin ? undefined : userId
        };
        
        // Add link if configured
        if (config.link) {
            notificationData.link = config.link(metadata);
        }
        
        // Emit via Socket.IO immediately without waiting for DB
        if (isAdmin) {
            emitToAdmins('notification:new', notificationData);
            console.log(`[Notification Service] Sent admin notification: ${type}`);
        } else if (userId) {
            emitToUser(userId, 'notification:new', notificationData);
            console.log(`[Notification Service] Sent notification to user ${userId}: ${type}`);
            
            // Emit to order room if orderId exists
            if (metadata.orderId) {
                emitToOrderRoom(metadata.orderId.toString(), 'order:status_update', notificationData);
            }
        }
        
        // Save to database asynchronously
        const notification = await Notification.create(notificationData);
        
        // TODO: Send FCM notification (will implement in Phase 3)
        // if (userId && !isAdmin) {
        //     await sendFCMNotification(userId, notification);
        // }
        
        return notification;
    } catch (error) {
        console.error('[Notification Service] Error sending notification:', error);
        throw error;
    }
};

/**
 * Send notification to multiple users
 */
const sendBulkNotifications = async (userIds, type, message, metadata = {}) => {
    try {
        const config = notificationConfig[type] || { title: 'Notification', icon: 'bell', priority: 'MEDIUM' };
        
        const mongoose = require('mongoose');
        const notifications = userIds.map(userId => ({
            _id: new mongoose.Types.ObjectId(),
            title: config.title,
            message,
            type,
            priority: config.priority,
            icon: config.icon,
            user: userId,
            metadata,
            link: config.link ? config.link(metadata) : undefined
        }));
        
        // Emit to each user immediately
        for (const notification of notifications) {
            emitToUser(notification.user, 'notification:new', notification);
        }
        
        // Save to database asynchronously
        await Notification.insertMany(notifications);
        
        console.log(`[Notification Service] Sent bulk notification to ${userIds.length} users: ${type}`);
        return notifications;
    } catch (error) {
        console.error('[Notification Service] Error sending bulk notifications:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }
        
        if (notification.user.toString() !== userId.toString()) {
            throw new Error('Unauthorized');
        }
        
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        
        return notification;
    } catch (error) {
        console.error('[Notification Service] Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Mark all notifications as read for a user
 */
const markAllNotificationsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { user: userId, isAdmin: false, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        return true;
    } catch (error) {
        console.error('[Notification Service] Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, options = {}) => {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    
    const query = { user: userId, isAdmin: false };
    if (unreadOnly) {
        query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false, isAdmin: false });
    const total = await Notification.countDocuments({ user: userId, isAdmin: false });
    
    return { notifications, unreadCount, total };
};

module.exports = {
    sendNotification,
    sendBulkNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUserNotifications
};
