const PURCHASE_RETURN = require('../model/purchaseReturn.model');
const { addPurchaseReturnSchema, updatePurchaseReturnSchema, validateBodyData } = require('../helper/validator');

exports.getPurchaseReturns = async (req, res) => {
    try {
        const purchaseReturns = await PURCHASE_RETURN.find()
            .populate('supplier')
            .populate('transport')
            .populate('bank')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: 'Purchase returns fetched successfully', purchaseReturns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getPurchaseReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PURCHASE_RETURN.findById(id)
            .populate('supplier')
            .populate('transport')
            .populate('bank')
            .populate('items.product');

        if (!purchaseReturn) {
            return res.status(404).json({ success: false, message: 'Purchase return not found' });
        }
        res.status(200).json({ success: true, message: 'Purchase return fetched successfully', purchaseReturn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getNextPurchaseReturnNumber = async (req, res) => {
    try {
        const returns = await PURCHASE_RETURN.find({}, { purchaseReturnNumber: 1 });
        let nextNo = 1;
        if (returns && returns.length > 0) {
            const numbers = returns
                .map(r => parseInt(r.purchaseReturnNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNo = Math.max(...numbers) + 1;
            }
        }
        res.status(200).json({ success: true, nextPurchaseReturnNumber: String(nextNo) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addPurchaseReturn = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addPurchaseReturnSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const purchaseReturn = await PURCHASE_RETURN.create(value);
        res.status(201).json({ success: true, message: 'Purchase return created successfully', purchaseReturn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updatePurchaseReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updatePurchaseReturnSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const purchaseReturn = await PURCHASE_RETURN.findById(id);
        if (!purchaseReturn) {
            return res.status(404).json({ success: false, message: 'Purchase return not found' });
        }

        const updatedPurchaseReturn = await PURCHASE_RETURN.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true })
            .populate('supplier')
            .populate('transport')
            .populate('bank')
            .populate('items.product');

        res.status(200).json({ success: true, message: 'Purchase return updated successfully', purchaseReturn: updatedPurchaseReturn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deletePurchaseReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await PURCHASE_RETURN.findByIdAndDelete(id);
        if (!purchaseReturn) {
            return res.status(404).json({ success: false, message: 'Purchase return not found' });
        }
        res.status(200).json({ success: true, message: 'Purchase return deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
