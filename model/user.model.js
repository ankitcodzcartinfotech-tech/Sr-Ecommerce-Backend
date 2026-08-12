const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: { type: String, trim: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    profileImage: { type: String },

    // OTP for authentication
    otp: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date },
    isVerified: { type: Boolean, default: false },

    role: { type: require('mongoose').Schema.Types.ObjectId, ref: 'Role' },

    fcmTokens: [{
        type: String
    }],

    // Login tracking
    lastLogin: { type: Date },
    loginInfo: {
        ip: { type: String },
        browser: { type: String },
        os: { type: String },
        device: { type: String },
        userAgent: { type: String },
        country: { type: String },
        state: { type: String },
        city: { type: String }
    }

}, {
    versionKey: false,
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;