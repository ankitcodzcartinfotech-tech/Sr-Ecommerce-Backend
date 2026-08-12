const express = require('express');
const router = express.Router();
const cashAndBankController = require('../../controller/cashAndBank.controller');

router.post('/', cashAndBankController.addCashAndBank);
router.get('/', cashAndBankController.getCashAndBanks);
router.get('/:id', cashAndBankController.getCashAndBank);
router.put('/:id', cashAndBankController.updateCashAndBank);
router.delete('/:id', cashAndBankController.deleteCashAndBank);

module.exports = router;
