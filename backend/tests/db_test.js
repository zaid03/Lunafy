const db = require('../config/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('Database connected! Test result:', rows[0].result); // Should print 2
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
}

testConnection();
