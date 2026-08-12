const ROLE = require('../model/role.model');

exports.addRole = async (req, res) => {
    try {
        const { name } = req.body;

        let role = await ROLE.findOne({ name });

        if (role) {
            return res.status(400).json({ message: `Role is already found` });
        }

        role = await ROLE.create({ name });

        res.status(201).json({ message: `Role create successfully....`, role });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await ROLE.find().sort({ createdAt: -1 });

        res.status(200).json({ message: `Roles fetched successfully....`, roles });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.getRole = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await ROLE.findById(id);

        if (!role) {
            return res.status(404).json({ message: `Role not found` });
        }

        res.status(200).json({ message: `Role fetched successfully....`, role });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const role = await ROLE.findById(id);

        if (!role) {
            return res.status(404).json({ message: `Role not found` });
        }

        if (name && name !== role.name) {
            const existingRole = await ROLE.findOne({ name });

            if (existingRole) {
                return res.status(400).json({ message: `Role is already found` });
            }
        }

        const updatedRole = await ROLE.findByIdAndUpdate(
            id,
            { name },
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ message: `Role updated successfully....`, role: updatedRole });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await ROLE.findByIdAndDelete(id);

        if (!role) {
            return res.status(404).json({ message: `Role not found` });
        }

        res.status(200).json({ message: `Role deleted successfully....` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `Internal server error` });
    }
};
