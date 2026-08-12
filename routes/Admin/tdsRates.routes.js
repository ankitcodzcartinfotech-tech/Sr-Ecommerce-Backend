const express = require('express');
const router = express.Router();
const tdsRateController = require('../../controller/tdsRate.controller');

router.post('/', tdsRateController.addTdsRate);
router.get('/', tdsRateController.getTdsRates);
router.get('/:id', tdsRateController.getTdsRate);
router.put('/:id', tdsRateController.updateTdsRate);
router.delete('/:id', tdsRateController.deleteTdsRate);

module.exports = router;
