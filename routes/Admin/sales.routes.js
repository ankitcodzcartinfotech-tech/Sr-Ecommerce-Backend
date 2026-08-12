const express = require('express');
const router = express.Router();
const salesController = require('../../controller/sales.controller');
const { upload } = require('../../helper/upload');

router.get('/', salesController.getSales);
router.get('/next-invoice-number', salesController.getNextInvoiceNumber);
router.post('/upload', upload.single('biltyImage'), salesController.uploadBiltyImage);
router.get('/:id', salesController.getSale);
router.post('/', salesController.addSale);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);

module.exports = router;
