const express = require('express');
const router = express.Router();
const recentlyViewedController = require('../../controller/recentlyViewed.controller');

// Add product to recently viewed
router.post('/:productId', recentlyViewedController.addRecentlyViewed);
router.post('/', recentlyViewedController.addRecentlyViewed);

// Get recently viewed products with pagination
router.get('/', recentlyViewedController.getRecentlyViewed);

// Remove specific product from recently viewed
router.delete('/:id', recentlyViewedController.removeRecentlyViewed);

// Clear all recently viewed products
router.delete('/', recentlyViewedController.clearRecentlyViewed);

module.exports = router;
