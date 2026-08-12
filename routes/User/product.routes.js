const express = require('express');
const router = express.Router();
const productController = require('../../controller/product.controller');
const { compareProductsValidation } = require('../../middleware/productValidation');

const questionController = require('../../controller/question.controller');
const reviewController = require('../../controller/review.controller');
const { userVerifyToken } = require('../../helper/user.verifyToken');
const { upload } = require('../../helper/upload');

router.get('/compare', compareProductsValidation, productController.compareProducts);
router.get('/filters', productController.getVariantFilters);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Q&A Routes
router.get('/:id/questions', questionController.getQuestionsForProduct);
router.post('/:id/questions', userVerifyToken, questionController.askQuestion);

// Reviews Routes
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', userVerifyToken, upload.array('images', 5), reviewController.addReview);

module.exports = router;
