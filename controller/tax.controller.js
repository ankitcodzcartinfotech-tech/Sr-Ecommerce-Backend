const TAX = require('../model/taxes.model');
const { addTaxSchema, updateTaxSchema, validateBodyData } = require('../helper/validator');

exports.addTax = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addTaxSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const tax = await TAX.create(value);
        res.status(201).json({ message: 'Tax type created successfully....', tax });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTaxes = async (req, res) => {
    try {
        const taxes = await TAX.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'Taxes fetched successfully....', taxes });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTax = async (req, res) => {
    try {
        const { id } = req.params;
        const tax = await TAX.findById(id);
        if (!tax) {
            return res.status(404).json({ message: 'Tax type not found' });
        }
        res.status(200).json({ message: 'Tax type fetched successfully....', tax });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateTax = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateTaxSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const tax = await TAX.findById(id);
        if (!tax) {
            return res.status(404).json({ message: 'Tax type not found' });
        }

        const updatedTax = await TAX.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: 'Tax type updated successfully....', tax: updatedTax });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteTax = async (req, res) => {
    try {
        const { id } = req.params;
        const tax = await TAX.findByIdAndDelete(id);
        if (!tax) {
            return res.status(404).json({ message: 'Tax type not found' });
        }
        res.status(200).json({ message: 'Tax type deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
