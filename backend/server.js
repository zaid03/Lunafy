const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const session = require('express-session');
const axios = require('axios');
const { db } = require('./config/db');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');

//loading env vriables and connecting to db and creating server instance
dotenv.config();
connectDB();
const app = express();

//adding cookie parsing middleware to the express app and session management middleware
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
   }
}));

//enabling CORS for the express
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'http://localhost:5000',    
        'http://127.0.0.1:5000',
        'http://127.0.0.1:3001',
        'http://localhost:3001',
        'http://192.168.1.3:3001'   
    ],
    methods: ['GET', 'POST', 'put', 'delete'],
    credentials: true
}));

//add middleware to parse incoming json for post and put request that allows req.body  to work otherwise it'll be undefined
app.use(express.json());

//move these 2 routes above the scurf cause they dont need scurf

// route for contact's form
const contactRoutes = require('./routes/contactRoute');
app.use('/api', contactRoutes);

//route for callback
const spotifyRoutes = require('./routes/SpotifyCallbackRoute');
app.use('/api', spotifyRoutes);

//csurf initilization
app.use(csurf({ cookie: true }));

//route to send csurf token to the front
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

//route to test session
app.get('/api/test-session', (req, res) => {
  res.json({ userId: req.session.userId || null });
});

// route for all user related apis
const userRoutes = require('./routes/userRoute');
app.use('/api', userRoutes);

// route for all admin related apis
const adminRoutes = require('./routes/adminRoute');
app.use('/admin', adminRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {});