const SearchHistory = require('../model/searchHistory.model');

// Save or update a search query
exports.saveSearch = async (req, res) => {
    try {
        const userId = req.user._id;
        const { query } = req.body;

        if (!query || query.trim() === '') {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }

        const normalizedQuery = query.trim().toLowerCase();

        const updatedHistory = await SearchHistory.findOneAndUpdate(
            { user: userId, query: normalizedQuery },
            { 
                $inc: { searchCount: 1 },
                $set: { updatedAt: Date.now() }
            },
            { returnDocument: 'after', upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Search history saved successfully',
            data: updatedHistory
        });
    } catch (error) {
        console.error('Error saving search history:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get recent searches for a user
exports.getRecentSearches = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;

        const recentSearches = await SearchHistory.find({ user: userId })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .select('query updatedAt');

        res.status(200).json({
            success: true,
            message: 'Recent searches fetched successfully',
            data: recentSearches
        });
    } catch (error) {
        console.error('Error fetching recent searches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Clear all search history for a user
exports.clearSearchHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        await SearchHistory.deleteMany({ user: userId });

        res.status(200).json({
            success: true,
            message: 'Search history cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing search history:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a specific search query for a user
exports.deleteSearchItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const deletedItem = await SearchHistory.findOneAndDelete({ _id: id, user: userId });

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Search history item not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Search history item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting search history item:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get globally trending searches
exports.getTrendingSearches = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const trendingSearches = await SearchHistory.aggregate([
            {
                $group: {
                    _id: '$query',
                    totalSearches: { $sum: '$searchCount' }
                }
            },
            { $sort: { totalSearches: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    query: '$_id',
                    totalSearches: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Trending searches fetched successfully',
            data: trendingSearches
        });
    } catch (error) {
        console.error('Error fetching trending searches:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get quick search suggestions based on partial matching
exports.getSuggestions = async (req, res) => {
    try {
        const q = req.query.q;
        const limit = parseInt(req.query.limit) || 5;

        if (!q || q.trim() === '') {
            return res.status(400).json({ success: false, message: 'Search query parameter (q) is required' });
        }

        const suggestions = await SearchHistory.aggregate([
            {
                $match: {
                    query: { $regex: q, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: '$query',
                    totalSearches: { $sum: '$searchCount' }
                }
            },
            { $sort: { totalSearches: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    query: '$_id'
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Search suggestions fetched successfully',
            data: suggestions.map(s => s.query)
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
