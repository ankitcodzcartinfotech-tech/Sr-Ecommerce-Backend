const express = require('express');
const router = express.Router();
const termController = require('../../controller/term.controller');

router.post('/', termController.addTerm);
router.get('/', termController.getTerms);
router.get('/:id', termController.getTerm);
router.put('/:id', termController.updateTerm);
router.delete('/:id', termController.deleteTerm);

module.exports = router;
