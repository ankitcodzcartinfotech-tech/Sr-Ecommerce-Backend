const express = require('express');
const router = express.Router();
const couponController = require('../../controller/coupon.controller');

router.get('/', couponController.getCoupons);
router.post('/', couponController.createCoupon);
router.patch('/:id/toggle', couponController.toggleCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
