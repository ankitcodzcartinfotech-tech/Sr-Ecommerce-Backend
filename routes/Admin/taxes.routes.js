const express = require('express');
const router = express.Router();
const taxController = require('../../controller/tax.controller');

router.post('/', taxController.addTax);
router.get('/', taxController.getTaxes);
router.get('/:id', taxController.getTax);
router.put('/:id', taxController.updateTax);
router.delete('/:id', taxController.deleteTax);

module.exports = router;
