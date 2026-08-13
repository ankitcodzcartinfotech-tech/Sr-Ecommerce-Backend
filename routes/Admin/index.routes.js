const express = require('express');
const router = express.Router();


const userRoutes = require('./user.routes');
const categoriesRoutes = require('./categoriesCategories.routes');
const productRoutes = require('./product.routes');
const stateRoutes = require('./states.routes');
const transportRoutes = require('./transports.routes');
const taxRoutes = require('./taxes.routes');
const tdsRateRoutes = require('./tdsRates.routes');
const termRoutes = require('./term.routes');
const ordersRoutes = require('./orders.routes');
const userOrdersRoutes = require('./userOrders.routes');

const adminRoutes = require('./admin.routes');
const bannerRoutes = require('./banner.routes');
const contactRoutes = require('./contact.routes');
const notificationRoutes = require('./notification.routes');
const storyRoutes = require('./story.routes');

const { adminVerifyToken } = require('../../helper/admin.verifyToken');


router.use('/users', adminVerifyToken, userRoutes);
router.use('/categories', adminVerifyToken, categoriesRoutes);
router.use('/products', adminVerifyToken, productRoutes);
router.use('/states', adminVerifyToken, stateRoutes);
router.use('/transports', adminVerifyToken, transportRoutes);
router.use('/taxes', adminVerifyToken, taxRoutes);
router.use('/tds-rates', adminVerifyToken, tdsRateRoutes);
router.use('/terms', adminVerifyToken, termRoutes);
router.use('/orders', adminVerifyToken, ordersRoutes);
router.use('/user-orders', adminVerifyToken, userOrdersRoutes);

router.use('/banners', adminVerifyToken, bannerRoutes);
router.use('/contacts', adminVerifyToken, contactRoutes);
router.use('/notifications', adminVerifyToken, notificationRoutes);
router.use('/stories', adminVerifyToken, storyRoutes);
router.use('/', adminRoutes);
       
module.exports = router;
