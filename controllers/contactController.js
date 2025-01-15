const ContactMessage = require('../models/contactModel');

const submitContactForm = async (req, res) => {
    const { firstName, middleName, lastName, email, message } = req.body;

    try {
        // Create a new contact message document and save it to the database
        const newMessage = new ContactMessage({
            firstName,
            middleName, // Added middle name
            lastName,
            email,
            message
        });
        await newMessage.save();

        res.status(201).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'There was an error processing your request', error: error });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const contacts = await ContactMessage.find();
        res.json({ contacts });
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

// Changed "Artist" to "Doctor," theme color to blue, and brand references from "Glam Hire" to "Medico."
module.exports = { submitContactForm, getAllContacts };
