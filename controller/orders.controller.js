const ORDER = require('../model/orders.model');
const { addOrderSchema, updateOrderSchema, validateBodyData } = require('../helper/validator');

exports.getOrders = async (req, res) => {
    try {
        const orders = await ORDER.find()
            .populate('party')
            .populate('transport')
            .populate('agent')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: 'Orders fetched successfully', orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await ORDER.findById(id)
            .populate('party')
            .populate('transport')
            .populate('agent')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order fetched successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getNextSpoNo = async (req, res) => {
    try {
        const lastOrder = await ORDER.findOne({}, {}, { sort: { spoNo: -1 } });
        const nextSpoNo = lastOrder && lastOrder.spoNo ? lastOrder.spoNo + 1 : 1;
        res.status(200).json({ success: true, nextSpoNo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.addOrder = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addOrderSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const order = await ORDER.create(value);
        res.status(201).json({ success: true, message: 'Order created successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateOrderSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const order = await ORDER.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const updatedOrder = await ORDER.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true })
            .populate('party')
            .populate('transport')
            .populate('agent')
            .populate('items.product');

        res.status(200).json({ success: true, message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await ORDER.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
