const express = require('express');
const router = express.Router();
const purchaseController = require('../../controller/purchase.controller');

router.get('/', purchaseController.getPurchases);
router.get('/next-purchase-invoice-number', purchaseController.getNextPurchaseInvoiceNumber);
router.get('/:id', purchaseController.getPurchase);
router.post('/', purchaseController.addPurchase);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
