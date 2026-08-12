const express = require('express');
const router = express.Router();
const salesReturnController = require('../../controller/salesReturn.controller');

router.get('/', salesReturnController.getSalesReturns);
router.get('/next-return-number', salesReturnController.getNextSalesReturnNumber);
router.get('/:id', salesReturnController.getSalesReturn);
router.post('/', salesReturnController.addSalesReturn);
router.put('/:id', salesReturnController.updateSalesReturn);
router.delete('/:id', salesReturnController.deleteSalesReturn);

module.exports = router;
