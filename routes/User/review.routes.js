const express = require('express');
const router = express.Router();
const reviewController = require('../../controller/review.controller');
const { upload } = require('../../helper/upload');

router.post('/add', upload.array('images', 5), reviewController.addReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/my-reviews', reviewController.getUserReviews);
router.put('/:reviewId', upload.array('images', 5), reviewController.editReview);
router.delete('/:reviewId', reviewController.deleteReview);
router.post('/:reviewId/vote', reviewController.voteReview);
router.post('/:reviewId/upvote', reviewController.voteReview);

module.exports = router;
