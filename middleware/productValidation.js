const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

const compareProductsValidation = [
    query('ids')
        .notEmpty()
        .withMessage('Product IDs are required')
        .custom((value) => {
            const ids = value.split(',').map(id => id.trim()).filter(id => id);
            
            if (ids.length < 2) {
                throw new Error('Minimum 2 products required for comparison');
            }
            
            if (ids.length > 4) {
                throw new Error('Maximum 4 products allowed for comparison');
            }
            
            const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
            if (invalidIds.length > 0) {
                throw new Error(`Invalid product IDs: ${invalidIds.join(', ')}`);
            }
            
            return true;
        }),
    handleValidationErrors
];

const variantValidation = [
    body('variants').optional().isArray().withMessage('Variants must be an array'),
    body('variants.*.sku')
        .notEmpty()
        .withMessage('Variant SKU is required')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('SKU must be between 1 and 100 characters'),
    body('variants.*.color')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Color must not exceed 50 characters'),
    body('variants.*.fabric')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Fabric must not exceed 100 characters'),
    body('variants.*.design')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Design must not exceed 100 characters'),
    body('variants.*.images')
        .optional()
        .isArray()
        .withMessage('Variant images must be an array'),
    body('variants.*.salePrice')
        .notEmpty()
        .withMessage('Variant sale price is required')
        .isFloat({ min: 0 })
        .withMessage('Sale price must be a positive number'),
    body('variants.*.purchasePrice')
        .notEmpty()
        .withMessage('Variant purchase price is required')
        .isFloat({ min: 0 })
        .withMessage('Purchase price must be a positive number'),
    body('variants.*.stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('variants.*.isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),
    handleValidationErrors
];

module.exports = {
    compareProductsValidation,
    variantValidation,
    handleValidationErrors
};
