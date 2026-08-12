const Review = require('../model/review.model');
const UserOrder = require('../model/userOrder.model');
const { uploadMultipleToCloudinary } = require('../helper/upload');

exports.addReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, orderId, rating, title = '', comment = '' } = req.body;

        if (!productId || !orderId || !rating) {
            return res.status(400).json({ success: false, message: 'Product ID, order ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const order = await UserOrder.findOne({
            _id: orderId,
            user: userId,
            'items.product': productId
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const allowedStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
        if (!allowedStatuses.includes(order.orderStatus)) {
            return res.status(403).json({
                success: false,
                message: `Reviews are not allowed for cancelled orders`
            });
        }

        let review = await Review.findOne({ product: productId, user: userId, order: orderId });
        
        let images = [];
        if (req.files && req.files.length > 0) {
            images = await uploadMultipleToCloudinary(req.files, 'reviews');
        }

        if (review) {
            review.rating = rating;
            if (title) review.title = title;
            if (comment) review.comment = comment;
            if (images.length > 0) {
                 review.images = [...review.images, ...images];
            }
            await review.save();
        } else {
            review = await Review.create({
                product: productId,
                user: userId,
                order: orderId,
                rating,
                title,
                comment,
                images,
                isVerifiedPurchase: order.orderStatus === 'Delivered'
            });
        }

        await review.populate('user', 'name profileImage');

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            highest: { rating: -1 },
            lowest: { rating: 1 },
            helpful: { helpfulVotes: -1 }
        };

        const [reviews, total] = await Promise.all([
            Review.find({ product: productId })
                .populate('user', 'name profileImage')
                .sort(sortOptions[sort] || sortOptions.newest)
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments({ product: productId })
        ]);

        const ratingStats = await Review.aggregate([
            { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(productId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            reviews,
            stats: ratingStats[0] || { avgRating: 0, totalReviews: 0, fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 },
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getFeaturedReviews = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const reviews = await Review.find({
            isApproved: true,
            $or: [
                { comment: { $exists: true, $ne: '' } },
                { title: { $exists: true, $ne: '' } },
            ],
        })
            .populate('user', 'name profileImage')
            .populate('product', 'productDetail.name productDetail.image slug')
            .sort({ createdAt: -1 })
            .limit(Math.min(parseInt(limit, 10) || 10, 20));

        res.status(200).json({
            success: true,
            message: 'Featured reviews fetched successfully',
            reviews,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reviews, total] = await Promise.all([
            Review.find({ user: userId })
                .populate('product', 'productDetail.name productDetail.image')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Review.countDocuments({ user: userId })
        ]);

        res.status(200).json({
            success: true,
            message: 'User reviews fetched successfully',
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.editReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;

        const review = await Review.findOne({ _id: reviewId, user: userId });
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
            }
            review.rating = rating;
        }

        if (title !== undefined) review.title = title;
        if (comment !== undefined) review.comment = comment;

        if (req.files && req.files.length > 0) {
            const newImages = await uploadMultipleToCloudinary(req.files, 'reviews');
            review.images = [...review.images, ...newImages];
        }

        await review.save();
        await review.populate('user', 'name profileImage');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;

        const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.voteReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        let { vote } = req.body;

        if (!vote && req.path.includes('upvote')) {
            vote = 'helpful';
        }

        if (!['helpful', 'not_helpful'].includes(vote)) {
            return res.status(400).json({ success: false, message: 'Vote must be helpful or not_helpful' });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.user.toString() === userId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot vote on your own review' });
        }

        const helpfulIndex = review.helpfulVotes.indexOf(userId);
        const notHelpfulIndex = review.notHelpfulVotes.indexOf(userId);

        if (vote === 'helpful') {
            if (helpfulIndex > -1) {
                review.helpfulVotes.splice(helpfulIndex, 1);
            } else {
                review.helpfulVotes.push(userId);
                if (notHelpfulIndex > -1) review.notHelpfulVotes.splice(notHelpfulIndex, 1);
            }
        } else {
            if (notHelpfulIndex > -1) {
                review.notHelpfulVotes.splice(notHelpfulIndex, 1);
            } else {
                review.notHelpfulVotes.push(userId);
                if (helpfulIndex > -1) review.helpfulVotes.splice(helpfulIndex, 1);
            }
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Vote recorded successfully',
            helpfulCount: review.helpfulVotes.length,
            notHelpfulCount: review.notHelpfulVotes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
