const adminModel = require('../models/adminModel');
const bcrypt = require('bcrypt')

//login route finding admin by name
exports.checkAdmin = async (req, res) => {
    const { name, password } = req.body;

    try {
        const user = await adminModel.findAdminByName(name);
        if (!user) return res.status(401).json({ message: 'invalid credentials '});

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'invalid credentials '});

        req.session.userId = user.id;
        res.json({ message: 'Login successful' });
    } catch (e) {
        res.status(500).json({ message: 'server error' });
    }
}