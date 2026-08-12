const SALES = require('../model/sales.model');
const { addSalesSchema, updateSalesSchema, validateBodyData } = require('../helper/validator');
const { uploadToCloudinary } = require('../helper/upload');

exports.getSales = async (req, res) => {
    try {
        const sales = await SALES.find()
            .populate('customer')
            .populate('transport')
            .populate('agent')
            .populate('bank')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: 'Sales fetched successfully', sales });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await SALES.findById(id)
            .populate('customer')
            .populate('transport')
            .populate('agent')
            .populate('bank')
            .populate('items.product');

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }
        res.status(200).json({ success: true, message: 'Sale fetched successfully', sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getNextInvoiceNumber = async (req, res) => {
    try {
        const sales = await SALES.find({}, { invoiceNumber: 1 });
        let nextInvoiceNo = 1;
        if (sales && sales.length > 0) {
            const numbers = sales
                .map(s => parseInt(s.invoiceNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextInvoiceNo = Math.max(...numbers) + 1;
            }
        }
        res.status(200).json({ success: true, nextInvoiceNumber: String(nextInvoiceNo) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addSale = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addSalesSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const sale = await SALES.create(value);
        res.status(201).json({ success: true, message: 'Sale created successfully', sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateSalesSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const sale = await SALES.findById(id);
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        const updatedSale = await SALES.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true })
            .populate('customer')
            .populate('transport')
            .populate('agent')
            .populate('bank')
            .populate('items.product');

        res.status(200).json({ success: true, message: 'Sale updated successfully', sale: updatedSale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await SALES.findByIdAndDelete(id);
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }
        res.status(200).json({ success: true, message: 'Sale deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.uploadBiltyImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }
        const imageUrl = await uploadToCloudinary(req.file.buffer, 'bilty');
        res.status(200).json({ success: true, message: 'Bilty image uploaded successfully', imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
