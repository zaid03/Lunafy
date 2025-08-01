const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { handleSpotifyAuth } = require('./controller/SpotifyCallbackController');
const session = require('express-session');

dotenv.config();
connectDB();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'put', 'delete'],
    credentials: true
}));

app.use(express.json());

// route for contact's form
const contactRoutes = require('./routes/contactRoute');
app.use('/api', contactRoutes);

//route for callback
const spotifyRoutes = require('./routes/SpotifyCallbackRoute');
app.use('/api', spotifyRoutes);

//route to test session
app.get('/api/test-session', (req, res) => {
  res.json({ userId: req.session.userId || null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});