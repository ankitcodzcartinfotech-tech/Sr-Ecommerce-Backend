    const mongoose = require('mongoose');

    const bannerSchema = new mongoose.Schema({
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true
        },
        subtitle: {
            type: String,
            trim: true
        },
        // Backward compatible: old `image` field maps to `desktopImage`
        desktopImage: {
            type: String,
            required: [true, 'Desktop Banner is required']
        },
        mobileImage: {
            type: String,
            default: null, // Optional, fallback to desktopImage if null
            trim: true
        },
        // Keep original `image` field for backward compatibility
        image: {
            type: String,
            trim: true
        },
        buttonText: {
            type: String,
            trim: true
        },
        buttonLink: {
            type: String,
            trim: true
        },
        position: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    }, {
        versionKey: false,
        timestamps: true
    });



    bannerSchema.index({ position: 1 });
    bannerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

    const Banner = mongoose.model('Banner', bannerSchema);
    module.exports = Banner;
