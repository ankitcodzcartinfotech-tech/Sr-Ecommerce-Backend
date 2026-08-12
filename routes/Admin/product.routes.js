const express = require('express');
const router = express.Router();
const productController = require('../../controller/product.controller');
const { upload } = require('../../helper/upload');
const { compareProductsValidation } = require('../../middleware/productValidation');

router.post('/', upload.array('images', 10), productController.addProduct);
router.get('/compare', compareProductsValidation, productController.compareProducts);
router.get('/filters', productController.getVariantFilters);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', upload.array('images', 10), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
