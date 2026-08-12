const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    timestamps: true
});

recentlyViewedSchema.index({ user: 1, product: 1 }, { unique: true });
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

const RecentlyViewed = mongoose.model('RecentlyViewed', recentlyViewedSchema);
module.exports = RecentlyViewed;
