const Coupon = require('../model/coupon.model');

/**
 * Validate a coupon code
 * POST /api/user/coupons/validate
 * Body: { code, orderAmount }
 */
exports.validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount = 0 } = req.body;

        if (!code || !code.trim()) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
        }

        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return res.status(400).json({ success: false, message: 'This coupon has expired' });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon`,
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = Math.round((orderAmount * coupon.value) / 100);
            if (coupon.maxDiscount !== null) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        } else {
            discountAmount = Math.min(coupon.value, orderAmount);
        }

        return res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discountAmount,
                description: coupon.description,
            },
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Admin: Create a coupon
 * POST /api/admin/coupons
 */
exports.createCoupon = async (req, res) => {
    try {
        const { code, type, value, minOrderAmount, maxDiscount, usageLimit, expiresAt, description } = req.body;

        if (!code || !type || value === undefined) {
            return res.status(400).json({ success: false, message: 'code, type, and value are required' });
        }

        const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.trim().toUpperCase(),
            type,
            value,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || null,
            usageLimit: usageLimit || null,
            expiresAt: expiresAt || null,
            description: description || '',
        });

        res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Admin: Get all coupons
 * GET /api/admin/coupons
 */
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Admin: Toggle coupon active status
 * PATCH /api/admin/coupons/:id/toggle
 */
exports.toggleCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.status(200).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Admin: Delete coupon
 * DELETE /api/admin/coupons/:id
 */
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
