const express = require('express');
const router = express.Router();
const adminUserOrderController = require('../../controller/admin-userOrder.controller');

router.get('/', adminUserOrderController.getAllUserOrders);
router.get('/:id', adminUserOrderController.getUserOrderById);
router.put('/:id', adminUserOrderController.updateUserOrderStatus);

module.exports = router;
