const express = require('express');
const router = express.Router();
const transportController = require('../../controller/transport.controller');

router.post('/', transportController.addTransport);
router.get('/', transportController.getTransports);
router.get('/:id', transportController.getTransport);
router.put('/:id', transportController.updateTransport);
router.delete('/:id', transportController.deleteTransport);

module.exports = router;
