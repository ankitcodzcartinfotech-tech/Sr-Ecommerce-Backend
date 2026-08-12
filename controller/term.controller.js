const TERM = require('../model/term.model');
const { addTermSchema, updateTermSchema, validateBodyData } = require('../helper/validator');

exports.addTerm = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addTermSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const term = await TERM.create(value);
        res.status(201).json({ message: 'Term created successfully....', term });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTerms = async (req, res) => {
    try {
        const terms = await TERM.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'Terms fetched successfully....', terms });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const term = await TERM.findById(id);
        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }
        res.status(200).json({ message: 'Term fetched successfully....', term });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateTermSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const term = await TERM.findById(id);
        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }

        const updatedTerm = await TERM.findByIdAndUpdate(id, value, { returnDocument: 'after', runValidators: true });
        res.status(200).json({ message: 'Term updated successfully....', term: updatedTerm });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const term = await TERM.findByIdAndDelete(id);
        if (!term) {
            return res.status(404).json({ message: 'Term not found' });
        }
        res.status(200).json({ message: 'Term deleted successfully....' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
