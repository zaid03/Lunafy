const { saveMessage } = require('../models/contactModel');
const validator = require('validator');

const registerMessage = async (req, res) => {
    const {name, email, message} = req.body;

    if(!name || !email || !message) {
        return res.status(400).json({message: 'all fields are required'});
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({message: 'Invalid email format'});
    }

    if (name.length > 100 || message.length > 1000) {
        return res.status(400).json({message: 'Input too long'});
    }

    const sanitizedName = validator.escape(name.trim());
    const sanitizedEmail = validator.normalizeEmail(email);
    const sanitizedMessage = validator.escape(message.trim());

    try {
        const data = await saveMessage(sanitizedName, sanitizedEmail, sanitizedMessage);

        res.status(200).json({
            message: 'Message sent successfully',
            data,
        });
    } catch (e) {
        console.log('error', e);
        res.status(500).json({message: 'failed to send message'});
    }
    
};

module.exports = { registerMessage };