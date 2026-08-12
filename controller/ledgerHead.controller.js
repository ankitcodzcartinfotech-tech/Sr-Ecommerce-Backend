const LEDGERHEAD = require('../model/ledgerHead.model');
const { addLedgerHeadSchema, updateLedgerHeadSchema, validateBodyData } = require('../helper/validator');

exports.addLedgerHead = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addLedgerHeadSchema, req.body);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const ledgerHead = await LEDGERHEAD.create(value);

        res.status(201).json({ message: `Ledger Head created successfully....`, ledgerHead });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getLedgerHeads = async (req, res) => {
    try {
        const ledgerHeads = await LEDGERHEAD.find().sort({ createdAt: -1 });

        res.status(200).json({ message: `Ledger Heads fetched successfully....`, ledgerHeads });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getLedgerHead = async (req, res) => {
    try {
        const { id } = req.params;

        const ledgerHead = await LEDGERHEAD.findById(id);

        if (!ledgerHead) {
            return res.status(404).json({ message: `Ledger Head not found` });
        }

        res.status(200).json({ message: `Ledger Head fetched successfully....`, ledgerHead });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.updateLedgerHead = async (req, res) => {
    try {
        const { id } = req.params;

        const { error, value } = validateBodyData(updateLedgerHeadSchema, req.body);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const ledgerHead = await LEDGERHEAD.findById(id);

        if (!ledgerHead) {
            return res.status(404).json({ message: `Ledger Head not found` });
        }

        const updatedLedgerHead = await LEDGERHEAD.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ message: `Ledger Head updated successfully....`, ledgerHead: updatedLedgerHead });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.deleteLedgerHead = async (req, res) => {
    try {
        const { id } = req.params;

        const ledgerHead = await LEDGERHEAD.findByIdAndDelete(id);

        if (!ledgerHead) {
            return res.status(404).json({ message: `Ledger Head not found` });
        }

        res.status(200).json({ message: `Ledger Head deleted successfully....` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};
