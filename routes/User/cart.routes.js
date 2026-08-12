const express = require('express');
const router = express.Router();
const cartController = require('../../controller/cart.controller');

router.post('/add', cartController.addToCart);
router.post('/', cartController.addToCart);

router.get('/', cartController.getCart);

router.put('/update/:itemId', cartController.updateQuantity);
router.put('/:itemId', cartController.updateQuantity);

router.delete('/remove/:itemId', cartController.removeItem);
router.delete('/:itemId', cartController.removeItem);

router.delete('/clear', cartController.clearCart);
router.delete('/', cartController.clearCart);

router.get('/validate-stock', cartController.validateStock);

module.exports = router;
