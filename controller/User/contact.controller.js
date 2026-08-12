const Contact = require('../../model/contact.model');
const { sendNotification } = require('../../services/notification.service');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, mobile, subject, message } = req.body;

        if (!name || !email || !mobile || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newContact = await Contact.create({
            name,
            email,
            mobile,
            subject,
            message
        });

        // Send admin notification
        await sendNotification({
            type: 'ADMIN_CONTACT_FORM',
            message: `New contact form from ${name}: ${subject}`,
            isAdmin: true,
            metadata: { contactId: newContact._id, name, email, subject }
        });

        res.status(201).json({ message: "Contact inquiry submitted successfully", contact: newContact });
    } catch (error) {
        console.error("Error submitting contact:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};