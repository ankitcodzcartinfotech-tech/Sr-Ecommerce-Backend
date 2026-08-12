const express = require('express');
const router = express.Router();
const couponController = require('../../controller/coupon.controller');

// Public validation (no auth needed — cart might be guest in future)
router.post('/validate', couponController.validateCoupon);

module.exports = router;
