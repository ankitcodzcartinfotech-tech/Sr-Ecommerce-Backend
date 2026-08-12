const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    searchCount: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
module.exports = SearchHistory;
