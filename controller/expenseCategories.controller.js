const EXPENSE = require('../model/expenseCategories.model');
const { addExpenseSchema, updateExpenseSchema, validateBodyData } = require('../helper/validator');

exports.addExpense = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addExpenseSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const expense = await EXPENSE.create(value);
        res.status(201).json({ message: 'Expense category created successfully....', expense });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await EXPENSE.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'Expense categories fetched successfully....', expenses });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await EXPENSE.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense category not found' });
        }
        res.status(200).json({ message: 'Expense category fetched successfully....', expense });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateExpenseSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const expense = await EXPENSE.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense category not found' });
        }

        const updatedExpense = await EXPENSE.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: 'Expense category updated successfully....', expense: updatedExpense });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await EXPENSE.findByIdAndDelete(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense category not found' });
        }
        res.status(200).json({ message: 'Expense category deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
