const { pool } = require('../config/db');

// save contact message into db
const saveMessage = async (name, email, message) => {
    await pool.query('INSERT into contact (name, email, message) values(?, ?, ?)', [name, email, message]);
    return { success: true, message: 'Message sent'};
};

module.exports = saveMessage;