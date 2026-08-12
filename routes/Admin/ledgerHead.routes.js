const express = require('express');
const router = express.Router();
const ledgerHeadController = require('../../controller/ledgerHead.controller');
const { validateBody, addLedgerHeadSchema, updateLedgerHeadSchema } = require('../../helper/validator');

router.post('/', validateBody(addLedgerHeadSchema), ledgerHeadController.addLedgerHead);
router.get('/', ledgerHeadController.getLedgerHeads);
router.get('/:id', ledgerHeadController.getLedgerHead);
router.put('/:id', validateBody(updateLedgerHeadSchema), ledgerHeadController.updateLedgerHead);
router.delete('/:id', ledgerHeadController.deleteLedgerHead);

module.exports = router;
