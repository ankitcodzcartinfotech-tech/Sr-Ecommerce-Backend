const STATE = require('../model/states.model');
const { addStateSchema, updateStateSchema, validateBodyData } = require('../helper/validator');

exports.addState = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addStateSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const state = await STATE.create(value);
        res.status(201).json({ message: 'State created successfully....', state });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getStates = async (req, res) => {
    try {
        const states = await STATE.find().sort({ stateName: 1 });
        res.status(200).json({ message: 'States fetched successfully....', states });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getState = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await STATE.findById(id);
        if (!state) {
            return res.status(404).json({ message: 'State not found' });
        }
        res.status(200).json({ message: 'State fetched successfully....', state });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateStateSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const state = await STATE.findById(id);
        if (!state) {
            return res.status(404).json({ message: 'State not found' });
        }

        const updatedState = await STATE.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: 'State updated successfully....', state: updatedState });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await STATE.findByIdAndDelete(id);
        if (!state) {
            return res.status(404).json({ message: 'State not found' });
        }
        res.status(200).json({ message: 'State deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
