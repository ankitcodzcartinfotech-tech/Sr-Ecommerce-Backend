const CASHANDBANK = require('../model/cashAndBank.model');
const { addCashAndBankSchema, updateCashAndBankSchema, validateBodyData } = require('../helper/validator');

const parseCashAndBankBody = (body) => {
    const parsed = { ...body };
    if (parsed.amount !== undefined && parsed.amount !== '') {
        parsed.amount = Number(parsed.amount);
    } else if (parsed.amount === '') {
        delete parsed.amount;
    }
    return parsed;
};

exports.addCashAndBank = async (req, res) => {
    try {
        const parsedBody = parseCashAndBankBody(req.body);
        const { error, value } = validateBodyData(addCashAndBankSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const cashAndBank = await CASHANDBANK.create(value);
        const populated = await CASHANDBANK.findById(cashAndBank._id).populate('moneyIn');

        res.status(201).json({ message: 'Cash & Bank transaction created successfully....', cashAndBank: populated });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCashAndBanks = async (req, res) => {
    try {
        const cashAndBanks = await CASHANDBANK.find().populate('moneyIn').sort({ createdAt: -1 });
        res.status(200).json({ message: 'Cash & Bank transactions fetched successfully....', cashAndBanks });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCashAndBank = async (req, res) => {
    try {
        const { id } = req.params;
        const cashAndBank = await CASHANDBANK.findById(id).populate('moneyIn');
        if (!cashAndBank) {
            return res.status(404).json({ message: 'Cash & Bank transaction not found' });
        }
        res.status(200).json({ message: 'Cash & Bank transaction fetched successfully....', cashAndBank });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateCashAndBank = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedBody = parseCashAndBankBody(req.body);
        const { error, value } = validateBodyData(updateCashAndBankSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const cashAndBank = await CASHANDBANK.findById(id);
        if (!cashAndBank) {
            return res.status(404).json({ message: 'Cash & Bank transaction not found' });
        }

        const updatedCashAndBank = await CASHANDBANK.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        ).populate('moneyIn');

        res.status(200).json({ message: 'Cash & Bank transaction updated successfully....', cashAndBank: updatedCashAndBank });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteCashAndBank = async (req, res) => {
    try {
        const { id } = req.params;
        const cashAndBank = await CASHANDBANK.findByIdAndDelete(id);
        if (!cashAndBank) {
            return res.status(404).json({ message: 'Cash & Bank transaction not found' });
        }
        res.status(200).json({ message: 'Cash & Bank transaction deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
