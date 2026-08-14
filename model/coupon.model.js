const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,   // this alone creates the index — no need for schema.index() below
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'flat'],
        required: true,
        default: 'percentage',
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number, // cap for percentage coupons
        default: null,
    },
    usageLimit: {
        type: Number,
        default: null, // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        default: '',
    },
}, {
    versionKey: false,
    timestamps: true,
});

// Index is already created by `unique: true` on the code field above.
// Removed duplicate couponSchema.index({ code: 1 }) to suppress Mongoose warning.

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
