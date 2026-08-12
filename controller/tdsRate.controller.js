const TDSRATE = require('../model/tdsRate.model');
const { addTdsRateSchema, updateTdsRateSchema, validateBodyData } = require('../helper/validator');

const parseTdsRateBody = (body) => {
    const parsed = { ...body };
    if (parsed.rate !== undefined && parsed.rate !== '') {
        parsed.rate = Number(parsed.rate);
    } else if (parsed.rate === '') {
        delete parsed.rate;
    }
    return parsed;
};

exports.addTdsRate = async (req, res) => {
    try {
        const parsedBody = parseTdsRateBody(req.body);
        const { error, value } = validateBodyData(addTdsRateSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const tdsRate = await TDSRATE.create(value);
        res.status(201).json({ message: 'TDS rate created successfully....', tdsRate });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTdsRates = async (req, res) => {
    try {
        const tdsRates = await TDSRATE.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'TDS rates fetched successfully....', tdsRates });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTdsRate = async (req, res) => {
    try {
        const { id } = req.params;
        const tdsRate = await TDSRATE.findById(id);
        if (!tdsRate) {
            return res.status(404).json({ message: 'TDS rate not found' });
        }
        res.status(200).json({ message: 'TDS rate fetched successfully....', tdsRate });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateTdsRate = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedBody = parseTdsRateBody(req.body);
        const { error, value } = validateBodyData(updateTdsRateSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const tdsRate = await TDSRATE.findById(id);
        if (!tdsRate) {
            return res.status(404).json({ message: 'TDS rate not found' });
        }

        const updatedTdsRate = await TDSRATE.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: 'TDS rate updated successfully....', tdsRate: updatedTdsRate });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteTdsRate = async (req, res) => {
    try {
        const { id } = req.params;
        const tdsRate = await TDSRATE.findByIdAndDelete(id);
        if (!tdsRate) {
            return res.status(404).json({ message: 'TDS rate not found' });
        }
        res.status(200).json({ message: 'TDS rate deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
