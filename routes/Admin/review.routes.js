const express = require('express');
const router = express.Router();
const reviewController = require('../../controller/review.controller');

router.get('/', reviewController.getAllReviewsAdmin);
router.patch('/:id/approve', reviewController.toggleApproveReviewAdmin);
router.delete('/:id', reviewController.deleteReviewAdmin);

module.exports = router;
