const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { handleSpotifyAuth } = require('./controller/SpotifyCallbackController');
const session = require('express-session');
const axios = require('axios');
const { db } = require('./config/db');

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

// route for user info to the dahsboard
app.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // Fetch user info from DB
  const [user] = await db.query('SELECT name, email, country, followers, profile_image FROM users WHERE id = ?', [req.session.userId]);
  // Fetch access token
  const [tokenRow] = await db.query('SELECT access_token FROM user_tokens WHERE user_id = ?', [req.session.userId]);
  let playingNow = null;
  if (tokenRow && tokenRow[0] && tokenRow[0].access_token) {
  try {
    const playingRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${tokenRow[0].access_token}` }
    });
    console.log('Spotify currently-playing status:', playingRes.status);
    console.log('Spotify currently-playing data:', playingRes.data);
    if (playingRes.data && playingRes.data.item) {
      const item = playingRes.data.item;
      playingNow = {
        name: item.name,
        artists: item.artists.map(a => a.name).join(', '),
        albumImage: item.album.images && item.album.images.length > 0 ? item.album.images[0].url : null,
        is_playing: playingRes.data.is_playing,
        preview_url: item.preview_url
      };
      console.log('Full item from Spotify:', item);
    }
  } catch (err) {
    console.error('Error fetching currently playing:', err);
    playingNow = null;
  }
}
  res.json({
    userId: req.session.userId,
    display_name: req.session.display_name,
    profileImage: req.session.profileImage,
    ...user[0],
    playingNow
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});