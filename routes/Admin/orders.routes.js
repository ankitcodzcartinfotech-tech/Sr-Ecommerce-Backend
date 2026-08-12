const express = require('express');
const router = express.Router();
const ordersController = require('../../controller/orders.controller');

router.get('/', ordersController.getOrders);
router.get('/next-spo-no', ordersController.getNextSpoNo);
router.get('/:id', ordersController.getOrder);
router.post('/', ordersController.addOrder);
router.put('/:id', ordersController.updateOrder);
router.delete('/:id', ordersController.deleteOrder);

module.exports = router;
