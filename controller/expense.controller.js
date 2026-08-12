const EXPENSE = require('../model/expense.model');
const { addActualExpenseSchema, updateActualExpenseSchema, validateBodyData } = require('../helper/validator');
const { getProfileImage } = require('../helper/image');

const parseExpenseBody = (body) => {
    const parsed = { ...body };
    if (parsed.expenseAmount !== undefined && parsed.expenseAmount !== '') {
        parsed.expenseAmount = Number(parsed.expenseAmount);
    }
    return parsed;
};

exports.addExpense = async (req, res) => {
    try {
        const parsedBody = parseExpenseBody(req.body);
        const uploadedImage = await getProfileImage(req, 'image', 'expenses');
        if (uploadedImage) {
            parsedBody.image = uploadedImage;
        }

        const { error, value } = validateBodyData(addActualExpenseSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const expense = await EXPENSE.create(value);
        const populatedExpense = await EXPENSE.findById(expense._id).populate('categoryType');

        res.status(201).json({ message: 'Expense record created successfully....', expense: populatedExpense });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await EXPENSE.find().populate('categoryType').sort({ createdAt: -1 });
        res.status(200).json({ message: 'Expense records fetched successfully....', expenses });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await EXPENSE.findById(id).populate('categoryType');
        if (!expense) {
            return res.status(404).json({ message: 'Expense record not found' });
        }
        res.status(200).json({ message: 'Expense record fetched successfully....', expense });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedBody = parseExpenseBody(req.body);
        const uploadedImage = await getProfileImage(req, 'image', 'expenses');
        if (uploadedImage) {
            parsedBody.image = uploadedImage;
        }

        const { error, value } = validateBodyData(updateActualExpenseSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const expense = await EXPENSE.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense record not found' });
        }

        const updatedExpense = await EXPENSE.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        ).populate('categoryType');

        res.status(200).json({ message: 'Expense record updated successfully....', expense: updatedExpense });
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
            return res.status(404).json({ message: 'Expense record not found' });
        }
        res.status(200).json({ message: 'Expense record deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
