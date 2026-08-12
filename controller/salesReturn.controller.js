const SALES_RETURN = require('../model/salesReturn.model');
const { addSalesReturnSchema, updateSalesReturnSchema, validateBodyData } = require('../helper/validator');

exports.getSalesReturns = async (req, res) => {
    try {
        const salesReturns = await SALES_RETURN.find()
            .populate('customer')
            .populate('transport')
            .populate('bank')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: 'Sales returns fetched successfully', salesReturns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const salesReturn = await SALES_RETURN.findById(id)
            .populate('customer')
            .populate('transport')
            .populate('bank')
            .populate('items.product');

        if (!salesReturn) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }
        res.status(200).json({ success: true, message: 'Sales return fetched successfully', salesReturn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getNextSalesReturnNumber = async (req, res) => {
    try {
        const returns = await SALES_RETURN.find({}, { saleReturnNumber: 1 });
        let nextNumber = 1;
        if (returns && returns.length > 0) {
            const numbers = returns
                .map(r => parseInt(r.saleReturnNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        res.status(200).json({ success: true, nextSalesReturnNumber: String(nextNumber) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addSalesReturn = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addSalesReturnSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const salesReturn = await SALES_RETURN.create(value);
        res.status(201).json({ success: true, message: 'Sales return created successfully', salesReturn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateSalesReturnSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const salesReturn = await SALES_RETURN.findById(id);
        if (!salesReturn) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }

        const updatedSalesReturn = await SALES_RETURN.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true })
            .populate('customer')
            .populate('transport')
            .populate('bank')
            .populate('items.product');

        res.status(200).json({ success: true, message: 'Sales return updated successfully', salesReturn: updatedSalesReturn });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;
        const salesReturn = await SALES_RETURN.findByIdAndDelete(id);
        if (!salesReturn) {
            return res.status(404).json({ success: false, message: 'Sales return not found' });
        }
        res.status(200).json({ success: true, message: 'Sales return deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
