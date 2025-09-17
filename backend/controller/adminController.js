const { db } = require('../config/db');
const adminModel = require('../models/adminModel');
const bcrypt = require('bcrypt')

//login route finding admin by name
exports.checkAdmin = async (req, res) => {
    const { name, password } = req.body;

    try {
        const admin = await adminModel.findAdminByName(name);
        if (!admin) return res.status(401).json({ message: 'invalid credentials '});

        const match = await bcrypt.compare(password, admin.password);
        if (!match) return res.status(401).json({ message: 'invalid credentials '});

        await db.query('UPDATE admin_users SET last_login = NOW(), last_seen = NOW() WHERE id = ?', [admin.id]);

        req.session.adminId = admin.id;

        res.json({ message: 'Login successful' });

    } catch (e) {
        res.status(500).json({ message: 'server error maybe' });
    }
}