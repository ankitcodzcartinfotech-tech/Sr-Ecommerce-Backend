const express = require('express');
const router = express.Router();
const expenseController = require('../../controller/expense.controller');
const { upload } = require('../../helper/upload');

router.post('/', upload.single('image'), expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', upload.single('image'), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
