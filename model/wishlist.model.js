const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: {
        type: [wishlistItemSchema],
        default: []
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false,
    timestamps: true
});

wishlistSchema.index({ 'items.product': 1 });

wishlistSchema.methods.calculateTotal = function() {
    this.totalItems = this.items.length;
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
