const express = require('express');
const router = express.Router();
const orderController = require('../../controller/userOrder.controller');

router.post('/create', orderController.createOrder);
router.post('/', orderController.createOrder);

router.get('/', orderController.getOrders);
router.get('/:orderId', orderController.getOrderById);
router.get('/:orderId/track', orderController.trackOrder);
router.get('/:orderId/invoice', orderController.generateInvoice);

router.put('/:orderId/cancel', orderController.cancelOrder);
router.patch('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
