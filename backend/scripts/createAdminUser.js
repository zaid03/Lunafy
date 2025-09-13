const bcrypt = require('bcrypt');
const { db } = require('../config/db');

async function createAdminUser(name, email, plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await db.query(
        'INSERT INTO admin_users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
    );
    console.log('Admin user created!');
    process.exit();
}

// Example usage:
createAdminUser('admin', 'admin@example.com', 'zaid.123');