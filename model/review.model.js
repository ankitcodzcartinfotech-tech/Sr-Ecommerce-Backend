const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOrder',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    images: [{
        type: String
    }],
    helpfulVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notHelpfulVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true
});

reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
