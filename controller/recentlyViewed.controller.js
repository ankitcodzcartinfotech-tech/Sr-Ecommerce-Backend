const RECENTLY_VIEWED = require('../model/recentlyViewed.model');
const PRODUCT = require('../model/product.model');

/**
 * Add product to recently viewed
 * POST /api/user/recently-viewed/:productId
 * @requires Authentication
 */
exports.addRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.productId || req.body.productId;

        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Product ID is required' 
            });
        }

        // Verify product exists
        const product = await PRODUCT.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        // Upsert atomically — avoids duplicate key race condition
        await RECENTLY_VIEWED.findOneAndUpdate(
            { user: userId, product: productId },
            { $set: { viewedAt: new Date() } },
            { upsert: true, returnDocument: 'after' }
        );

        // Keep maximum 20 products per user — remove oldest if over limit
        const recentlyViewedCount = await RECENTLY_VIEWED.countDocuments({ user: userId });
        if (recentlyViewedCount > 20) {
            const itemsToRemove = recentlyViewedCount - 20;
            const oldestItems = await RECENTLY_VIEWED.find({ user: userId })
                .sort({ viewedAt: 1 })
                .limit(itemsToRemove)
                .select('_id');
            await RECENTLY_VIEWED.deleteMany({ _id: { $in: oldestItems.map(i => i._id) } });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Product added to recently viewed' 
        });
    } catch (error) {
        console.error('Error in addRecentlyViewed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

/**
 * Get recently viewed products
 * GET /api/user/recently-viewed
 * @requires Authentication
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 */
exports.getRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate page and limit
        if (page < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Page number must be greater than 0' 
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Limit must be between 1 and 100' 
            });
        }

        const skip = (page - 1) * limit;

        // Get total count
        const total = await RECENTLY_VIEWED.countDocuments({ user: userId });

        // Get recently viewed products with pagination
        const recentlyViewed = await RECENTLY_VIEWED.find({ user: userId })
            .sort({ viewedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('product')
            .lean();

        // Filter out any products that might have been deleted
        const products = recentlyViewed
            .filter(item => item.product !== null)
            .map(item => ({
                _id: item._id,
                product: item.product,
                viewedAt: item.viewedAt
            }));

        res.status(200).json({ 
            success: true, 
            message: 'Recently viewed products fetched successfully',
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            products 
        });
    } catch (error) {
        console.error('Error in getRecentlyViewed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

/**
 * Remove product from recently viewed
 * DELETE /api/user/recently-viewed/:id
 * @requires Authentication
 */
exports.removeRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Recently viewed ID is required' 
            });
        }

        const recentlyViewed = await RECENTLY_VIEWED.findOne({ 
            _id: id, 
            user: userId 
        });

        if (!recentlyViewed) {
            return res.status(404).json({ 
                success: false, 
                message: 'Recently viewed item not found' 
            });
        }

        await RECENTLY_VIEWED.deleteOne({ _id: id });

        res.status(200).json({ 
            success: true, 
            message: 'Product removed from recently viewed' 
        });
    } catch (error) {
        console.error('Error in removeRecentlyViewed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

/**
 * Clear all recently viewed products
 * DELETE /api/user/recently-viewed
 * @requires Authentication
 */
exports.clearRecentlyViewed = async (req, res) => {
    try {
        const userId = req.user._id;

        await RECENTLY_VIEWED.deleteMany({ user: userId });

        res.status(200).json({ 
            success: true, 
            message: 'Recently viewed list cleared successfully' 
        });
    } catch (error) {
        console.error('Error in clearRecentlyViewed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
