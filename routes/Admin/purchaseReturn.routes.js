const express = require('express');
const router = express.Router();
const purchaseReturnController = require('../../controller/purchaseReturn.controller');

router.get('/', purchaseReturnController.getPurchaseReturns);
router.get('/next-purchase-return-number', purchaseReturnController.getNextPurchaseReturnNumber);
router.get('/:id', purchaseReturnController.getPurchaseReturn);
router.post('/', purchaseReturnController.addPurchaseReturn);
router.put('/:id', purchaseReturnController.updatePurchaseReturn);
router.delete('/:id', purchaseReturnController.deletePurchaseReturn);

module.exports = router;
