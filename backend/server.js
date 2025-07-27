const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: 'http://192.168.1.3:3000',
    methods: ['GET', 'POST', 'put', 'delete'],
    credentials: true
}));

app.use(express.json());

// route for contact's form
const contactRoutes = require('./routes/contactRoute');
app.use('/api', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});