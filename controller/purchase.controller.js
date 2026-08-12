const PURCHASE = require('../model/purchase.model');
const { addPurchaseSchema, updatePurchaseSchema, validateBodyData } = require('../helper/validator');

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await PURCHASE.find()
            .populate('supplier')
            .populate('transport')
            .populate('bank')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: 'Purchases fetched successfully', purchases });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getPurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await PURCHASE.findById(id)
            .populate('supplier')
            .populate('transport')
            .populate('bank')
            .populate('items.product');

        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Purchase not found' });
        }
        res.status(200).json({ success: true, message: 'Purchase fetched successfully', purchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getNextPurchaseInvoiceNumber = async (req, res) => {
    try {
        const purchases = await PURCHASE.find({}, { purchaseInvoiceNumber: 1 });
        let nextInvoiceNo = 1;
        if (purchases && purchases.length > 0) {
            const numbers = purchases
                .map(p => parseInt(p.purchaseInvoiceNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextInvoiceNo = Math.max(...numbers) + 1;
            }
        }
        res.status(200).json({ success: true, nextPurchaseInvoiceNumber: String(nextInvoiceNo) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addPurchase = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addPurchaseSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const purchase = await PURCHASE.create(value);
        res.status(201).json({ success: true, message: 'Purchase created successfully', purchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updatePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updatePurchaseSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const purchase = await PURCHASE.findById(id);
        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Purchase not found' });
        }

        const updatedPurchase = await PURCHASE.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true })
            .populate('supplier')
            .populate('transport')
            .populate('bank')
            .populate('items.product');

        res.status(200).json({ success: true, message: 'Purchase updated successfully', purchase: updatedPurchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const { id } = req.params;
        const purchase = await PURCHASE.findByIdAndDelete(id);
        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Purchase not found' });
        }
        res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
