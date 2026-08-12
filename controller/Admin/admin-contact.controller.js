const Contact = require('../../model/contact.model');

// Get all contacts
exports.getAllContacts = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { subject: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Contact.countDocuments(query);

        res.status(200).json({
            contacts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update status
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'resolved'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const contact = await Contact.findByIdAndUpdate(id, { status }, { new: true });
        
        if (!contact) {
            return res.status(404).json({ message: "Contact inquiry not found" });
        }

        res.status(200).json({ message: "Status updated successfully", contact });
    } catch (error) {
        console.error("Error updating contact status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete contact
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({ message: "Contact inquiry not found" });
        }

        res.status(200).json({ message: "Contact inquiry deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};