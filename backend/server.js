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
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
   }
}));

app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'http://localhost:5000',    
        'http://127.0.0.1:5000'   
    ],
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
   console.log('=== /api/me CALLED ===');
  console.log('Session:', req.session);
  console.log('Session ID:', req.sessionID);
  console.log('Cookie header:', req.headers.cookie);
  console.log('All headers:', req.headers);
  if (!req.session.userId) {
    console.log('❌ Session userId is:', req.session.userId);
    return res.status(401).json({ error: 'Not authenticated' });
  }
  console.log('✅ Session userId found:', req.session.userId);
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

//route to get albums
app.get('/api/top-albums', async (req, res) => {

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Fetch access token
    const [tokenRow] = await db.query('SELECT access_token FROM user_tokens WHERE user_id = ?', [req.session.userId]);
    if (!tokenRow || !tokenRow[0] || !tokenRow[0].access_token) {
      return res.status(401).json({ error: 'No access token found' });
    }
    console.log('Session userId:', req.session.userId);
    // Get user's top tracks first, then extract unique albums
    const topTracksRes = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term', {
      headers: { Authorization: `Bearer ${tokenRow[0].access_token}` }
    });

    if (topTracksRes.data && topTracksRes.data.items) {
      // Extract unique albums from top tracks
      const albumsMap = new Map();

      topTracksRes.data.items.forEach(track => {
        const album = track.album;
        if (!albumsMap.has(album.id)) {
          albumsMap.set(album.id, {
            id: album.id,
            name: album.name,
            artists: album.artists.map(a => a.name).join(', '),
            images: album.images,
            release_date: album.release_date,
            total_tracks: album.total_tracks
          });
        }
      });
      const topAlbums = Array.from(albumsMap.values()).slice(0, 10);
      res.json({
        albums: topAlbums
      });
    } else {
      res.json({ albums: [] });
    }
  } catch (err) {
    console.error('Error fetching top albums:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch top albums' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});