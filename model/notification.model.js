const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        required: true,
        enum: [
            'ORDER_PLACED',
            'ORDER_CONFIRMED',
            'ORDER_PACKED',
            'ORDER_SHIPPED',
            'ORDER_OUT_FOR_DELIVERY',
            'ORDER_DELIVERED',
            'ORDER_CANCELLED',
            'ORDER_RETURNED',
            'REFUND_PROCESSED',
            'BACK_IN_STOCK',
            'PRICE_DROPPED',
            'NEW_PRODUCT',
            'LIMITED_STOCK',
            'RESTOCKED',
            'FLASH_SALE',
            'COUPON_AVAILABLE',
            'SPECIAL_DISCOUNT',
            'FESTIVAL_SALE',
            'FREE_SHIPPING',
            'WELCOME',
            'PROFILE_COMPLETED',
            'PASSWORD_CHANGED',
            'EMAIL_VERIFIED',
            'PHONE_VERIFIED',
            'ADMIN_NEW_ORDER',
            'ADMIN_LOW_STOCK',
            'ADMIN_NEW_USER',
            'ADMIN_CONTACT_FORM',
            'ADMIN_RETURN_REQUEST',
            'ADMIN_REFUND_REQUEST',
            'SYSTEM'
        ],
        index: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
        index: true
    },
    icon: {
        type: String,
        default: 'bell'
    },
    link: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return !this.isAdmin; },
        index: true
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        index: { expireAfterSeconds: 0 }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isAdmin: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    versionKey: false,
    timestamps: true
});

// Indexes for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ isAdmin: 1, createdAt: -1 });

// Pre-save hook to set expiresAt (e.g., 30 days from creation)
notificationSchema.pre('save', function() {
  if (!this.expiresAt) {
    const expiresIn = 30 * 24 * 60 * 60 * 1000; // 30 days
    this.expiresAt = new Date(Date.now() + expiresIn);
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
