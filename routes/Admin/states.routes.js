const express = require('express');
const router = express.Router();
const stateController = require('../../controller/state.controller');

router.post('/', stateController.addState);
router.get('/', stateController.getStates);
router.get('/:id', stateController.getState);
router.put('/:id', stateController.updateState);
router.delete('/:id', stateController.deleteState);

module.exports = router;
