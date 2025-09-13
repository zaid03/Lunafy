const { db } = require('../config/db');

//login route finding admin by name
exports.findAdminByName = async (name) => {
    const [rows] = await db.query(`
        SELECT id, name, password, email FROM admin_users WHERE name = ? AND email <> '' AND email IS NOT NULL LIMIT 1
        `, [name]);
    return rows[0];
};