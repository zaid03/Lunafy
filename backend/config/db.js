const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('DB connection failed:', err.message);
    } else {
      console.log('Connected to MySQL DB');
      connection.release();
    }
  });
};

module.exports = {
    connectDB,
    pool: pool.promise(),
};