const express = require('express');
const router = express.Router();
const wishlistController = require('../../controller/wishlist.controller');

router.post('/add', wishlistController.addToWishlist);
router.post('/', wishlistController.addToWishlist);

router.get('/', wishlistController.getWishlist);

router.delete('/clear', wishlistController.clearWishlist);
router.delete('/', wishlistController.clearWishlist);

router.delete('/remove/:itemId', wishlistController.removeFromWishlist);
router.delete('/:itemId', wishlistController.removeFromWishlist);

router.post('/move-to-cart/:itemId', wishlistController.moveToCart);
router.post('/:itemId/move-to-cart', wishlistController.moveToCart);

module.exports = router;
