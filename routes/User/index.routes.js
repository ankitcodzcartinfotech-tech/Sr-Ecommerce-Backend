const express = require('express');
const router = express.Router();

const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const recentlyViewedRoutes = require('./recentlyViewed.routes');
const bannerRoutes = require('./banner.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const addressRoutes = require('./address.routes');
const searchHistoryRoutes = require('./searchHistory.routes');
const categoryRoutes = require('./category.routes');
const couponRoutes = require('./coupon.routes');
const userController = require('../../controller/user.controller');
const reviewController = require('../../controller/review.controller');
const { upload } = require('../../helper/upload');

const { userVerifyToken } = require('../../helper/user.verifyToken');

const questionRoutes = require('./question.routes');
const answerRoutes = require('./answer.routes');
const contactRoutes = require('./contact.routes');
const notificationRoutes = require('./notification.routes');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);

router.get('/reviews/featured', reviewController.getFeaturedReviews);
router.get('/profile', userVerifyToken, userController.getProfile);
router.post('/logout', userVerifyToken, userController.logout);
router.put('/profile', userVerifyToken, upload.single('profileImage'), userController.updateProfile);

router.use('/cart', userVerifyToken, cartRoutes);
router.use('/wishlist', userVerifyToken, wishlistRoutes);
router.use('/recently-viewed', userVerifyToken, recentlyViewedRoutes);
router.use('/banners', bannerRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', userVerifyToken, orderRoutes);
router.use('/reviews', userVerifyToken, reviewRoutes);

// Expose pincode validation publicly so guests can use it on the product page
const addressController = require('../../controller/address.controller');
router.get('/addresses/validate-pincode/:pincode', addressController.validatePincode);

router.use('/addresses', userVerifyToken, addressRoutes);
router.use('/search-history', searchHistoryRoutes);
router.use('/coupons', couponRoutes);

// Q&A Routes
router.use('/questions', userVerifyToken, questionRoutes);
router.use('/answers', userVerifyToken, answerRoutes);

router.use('/contact', contactRoutes);
router.use('/notifications', userVerifyToken, notificationRoutes);

module.exports = router;
