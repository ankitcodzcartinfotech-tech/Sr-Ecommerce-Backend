const TRANSPORT = require('../model/transports.model');
const { addTransportSchema, updateTransportSchema, validateBodyData } = require('../helper/validator');

const parseTransportBody = (body) => {
    const parsed = { ...body };
    if (parsed.mobileNumber !== undefined && parsed.mobileNumber !== '') {
        parsed.mobileNumber = Number(parsed.mobileNumber);
    } else if (parsed.mobileNumber === '') {
        delete parsed.mobileNumber;
    }
    if (parsed.mobileNumber2 !== undefined && parsed.mobileNumber2 !== '') {
        parsed.mobileNumber2 = Number(parsed.mobileNumber2);
    } else if (parsed.mobileNumber2 === '') {
        delete parsed.mobileNumber2;
    }
    return parsed;
};

exports.addTransport = async (req, res) => {
    try {
        const parsedBody = parseTransportBody(req.body);
        const { error, value } = validateBodyData(addTransportSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const transport = await TRANSPORT.create(value);
        res.status(201).json({ message: 'Transport created successfully....', transport });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTransports = async (req, res) => {
    try {
        const transports = await TRANSPORT.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'Transports fetched successfully....', transports });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTransport = async (req, res) => {
    try {
        const { id } = req.params;
        const transport = await TRANSPORT.findById(id);
        if (!transport) {
            return res.status(404).json({ message: 'Transport not found' });
        }
        res.status(200).json({ message: 'Transport fetched successfully....', transport });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateTransport = async (req, res) => {
    try {
        const { id } = req.params;
        const parsedBody = parseTransportBody(req.body);
        const { error, value } = validateBodyData(updateTransportSchema, parsedBody);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const transport = await TRANSPORT.findById(id);
        if (!transport) {
            return res.status(404).json({ message: 'Transport not found' });
        }

        const updatedTransport = await TRANSPORT.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: 'Transport updated successfully....', transport: updatedTransport });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteTransport = async (req, res) => {
    try {
        const { id } = req.params;
        const transport = await TRANSPORT.findByIdAndDelete(id);
        if (!transport) {
            return res.status(404).json({ message: 'Transport not found' });
        }
        res.status(200).json({ message: 'Transport deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
