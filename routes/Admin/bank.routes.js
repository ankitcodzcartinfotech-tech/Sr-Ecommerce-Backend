const express = require('express');
const router = express.Router();
const bankController = require('../../controller/bank.controller');

router.post('/', bankController.addBank);
router.get('/', bankController.getBanks);
router.get('/:id', bankController.getBank);
router.put('/:id', bankController.updateBank);
router.delete('/:id', bankController.deleteBank);

module.exports = router;
