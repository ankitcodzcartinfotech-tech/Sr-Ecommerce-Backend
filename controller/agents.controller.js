const AGENT = require('../model/agents.model');
const { addAgentSchema, updateAgentSchema, validateBodyData } = require('../helper/validator');
const { getProfileImage } = require('../helper/image');

const parseAgentBody = (body) => {
    const parsed = { ...body };
    const numberFields = ['mobileNumber', 'commission', 'creditPeriod', 'creditLimit'];

    numberFields.forEach((field) => {
        if (parsed[field] !== undefined && parsed[field] !== '') {
            parsed[field] = Number(parsed[field]);
        } else if (parsed[field] === '') {
            delete parsed[field];
        }
    });

    return parsed;
};


exports.addAgent = async (req, res) => {
    try {
        const profileImage = await getProfileImage(req, 'profileImage', 'agents');
        const { error, value } = validateBodyData(addAgentSchema, {
            ...parseAgentBody(req.body),
            profileImage
        });

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const agent = await AGENT.create(value);

        res.status(201).json({ message: `Agent created successfully....`, agent });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getAgents = async (req, res) => {
    try {
        const agents = await AGENT.find().sort({ createdAt: -1 });

        res.status(200).json({ message: `Agents fetched successfully....`, agents });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await AGENT.findById(id);

        if (!agent) {
            return res.status(404).json({ message: `Agent not found` });
        }

        res.status(200).json({ message: `Agent fetched successfully....`, agent });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const body = parseAgentBody(req.body);
        const uploadedImage = await getProfileImage(req, 'profileImage', 'agents');
        if (uploadedImage) {
            body.profileImage = uploadedImage;
        }

        const { error, value } = validateBodyData(updateAgentSchema, body);

        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const agent = await AGENT.findById(id);

        if (!agent) {
            return res.status(404).json({ message: `Agent not found` });
        }

        const updatedAgent = await AGENT.findByIdAndUpdate(
            id,
            value,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ message: `Agent updated successfully....`, agent: updatedAgent });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await AGENT.findByIdAndDelete(id);

        if (!agent) {
            return res.status(404).json({ message: `Agent not found` });
        }

        res.status(200).json({ message: `Agent deleted successfully....` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};