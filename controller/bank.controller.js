const BANK = require('../model/bank.model');
const { addBankSchema, updateBankSchema, validateBodyData } = require('../helper/validator');

const parseBankBody = (body) => {
    const parsed = { ...body };
    if (parsed.openingBalance !== undefined && parsed.openingBalance !== '') {
        parsed.openingBalance = Number(parsed.openingBalance);
    } else if (parsed.openingBalance === '') {
        delete parsed.openingBalance;
    }
    // Parse nested object fields if sent as flat parameters (common in forms)
    if (parsed.bankAccountNumber !== undefined || parsed.ifscCode !== undefined || parsed.branchName !== undefined || parsed.accountHoldersName !== undefined || parsed.upiId !== undefined) {
        parsed.addBankDetails = {
            bankAccountNumber: parsed.bankAccountNumber || '',
            ifscCode: parsed.ifscCode || '',
            branchName: parsed.branchName || '',
            accountHoldersName: parsed.accountHoldersName || '',
            upiId: parsed.upiId || ''
        };
        // Clean empty fields
        delete parsed.bankAccountNumber;
        delete parsed.ifscCode;
        delete parsed.branchName;
        delete parsed.accountHoldersName;
        delete parsed.upiId;
    }
    return parsed;
};

exports.addBank = async (req, res) => {
    try {
        const parsedBody = parseBankBody(req.body);
        const { error, value } = validateBodyData(addBankSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const bank = await BANK.create(value);
        res.status(201).json({ message: 'Bank account created successfully....', bank });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getBanks = async (req, res) => {
    try {
        const banks = await BANK.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'Bank accounts fetched successfully....', banks });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getBank = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await BANK.findById(id);
        if (!bank) {
            return res.status(404).json({ message: 'Bank account not found' });
        }
        res.status(200).json({ message: 'Bank account fetched successfully....', bank });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateBank = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedBody = parseBankBody(req.body);
        const { error, value } = validateBodyData(updateBankSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const bank = await BANK.findById(id);
        if (!bank) {
            return res.status(404).json({ message: 'Bank account not found' });
        }

        const updatedBank = await BANK.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ message: 'Bank account updated successfully....', bank: updatedBank });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteBank = async (req, res) => {
    try {
        const { id } = req.params;
        const bank = await BANK.findByIdAndDelete(id);
        if (!bank) {
            return res.status(404).json({ message: 'Bank account not found' });
        }
        res.status(200).json({ message: 'Bank account deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
