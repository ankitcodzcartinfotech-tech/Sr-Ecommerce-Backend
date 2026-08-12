const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    addressLine1: {
        type: String,
        required: true,
        trim: true
    },
    addressLine2: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        default: 'India',
        trim: true
    },
    addressType: {
        type: String,
        enum: ['Home', 'Office', 'Other'],
        default: 'Home'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
});

addressSchema.index({ user: 1 });

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
