const express = require('express');
const router = express.Router();
const expenseController = require('../../controller/expenseCategories.controller');

router.post('/', expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
