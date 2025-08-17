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

//route to get albums, songs and artists
app.get('/api/user-stats', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';
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
    const timeRanges = ['short_term', 'medium_term', 'long_term'];

    // Get user's top tracks first, then extract unique albums
    for (const timeRange of timeRanges) {
      const topTracksRes = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
        headers: { Authorization: `Bearer ${tokenRow[0].access_token}` }
      });

      if (topTracksRes.data && topTracksRes.data.items) {
        for (let i = 0; i < topTracksRes.data.items.length; i++) {
          const track = topTracksRes.data.items[i];
          
          const trackData = {
            user_id: req.session.userId,
            spotify_track_id: track.id,
            track_name: track.name,
            artist_name: track.artists.map(a => a.name).join(', '),
            artist_id: track.artists[0]?.id || null,
            album_name: track.album.name,
            album_id: track.album.id,
            image_url: track.album.images && track.album.images.length > 0 ? track.album.images[0].url : null,
            preview_url: track.preview_url,
            duration_ms: track.duration_ms,
            popularity: track.popularity,
            external_url: track.external_urls?.spotify || null,
            explicit: track.explicit,
            release_date: track.album.release_date || null,
            time_range: timeRange, // ✅ Use the current time range
            rank_position: i + 1
          };

          await db.query(`
            INSERT INTO user_data (
              user_id, spotify_track_id, track_name, artist_name, artist_id, 
              album_name, album_id, image_url, preview_url, duration_ms, 
              popularity, external_url, explicit, release_date, time_range, rank_position
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              track_name = VALUES(track_name),
              artist_name = VALUES(artist_name),
              album_name = VALUES(album_name),
              image_url = VALUES(image_url),
              preview_url = VALUES(preview_url),
              duration_ms = VALUES(duration_ms),
              popularity = VALUES(popularity),
              external_url = VALUES(external_url),
              explicit = VALUES(explicit),
              release_date = VALUES(release_date),
              rank_position = VALUES(rank_position),
              created_at = CURRENT_TIMESTAMP
          `, [
            trackData.user_id, trackData.spotify_track_id, trackData.track_name,
            trackData.artist_name, trackData.artist_id, trackData.album_name,
            trackData.album_id, trackData.image_url, trackData.preview_url,
            trackData.duration_ms, trackData.popularity, trackData.external_url,
            trackData.explicit, trackData.release_date, trackData.time_range,
            trackData.rank_position
          ]);
        }
      }
    }
    console.log('Saved tracks to database:');
    res.json({
      message: `Saved tracks to database`
    });
  } catch (err) {
    console.error('Error saving content into database:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error saving content into database'});
  }
});

//dashboard overview - top 10 of each
app.get('/api/dashboard-overview', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try {
    //top 10 artists
    const [artists] = await db.query (`
        SELECT 
    SUBSTRING_INDEX(artist_name, ',', 1) as main_artist,
    ANY_VALUE(artist_id) as artist_id, 
    ANY_VALUE(image_url) as image_url,  
    COUNT(*) as track_count,
    AVG(popularity) as avg_popularity,
    AVG(rank_position) as avg_rank,
    MIN(rank_position) as best_track_rank
  FROM user_data 
  WHERE user_id = ? AND time_range = ?
  GROUP BY SUBSTRING_INDEX(artist_name, ',', 1)  -- ✅ Group by FIRST artist only
  ORDER BY best_track_rank ASC  
  LIMIT 10
      `, [req.session.userId, timeRange]);

    //top 10 albums
    const [albums] = await db.query(`
        SELECT 
          album_id,
          album_name,
          artist_name,
          ANY_VALUE(image_url) as image_url, 
          MIN(release_date) as release_date,
          COUNT(*) as track_count,
          AVG(popularity) as avg_popularity,
          AVG(rank_position) as avg_rank,
          MIN(rank_position) as best_track_rank
        FROM user_data 
        WHERE user_id = ? AND time_range = ?
        GROUP BY album_id, album_name, artist_name  
        ORDER BY best_track_rank ASC 
        LIMIT 10
    `, [req.session.userId, timeRange]);

    //top 10 songs
    const [songs] = await db.query(`
      SELECT track_name, artist_name, image_url, rank_position FROM user_data WHERE user_id = ? AND time_range = ? ORDER BY rank_position ASC LIMIT 10
    `, [req.session.userId, timeRange]);


    res.json({
      artists: artists,
      albums: albums,
      songs: songs
    });
  } catch (err) {
    console.log('Error fetching dashboard overview data:', err);
    res.status(500).json({ error: 'failed to fetch dashboard content'});
  }
})

//route to fetch the most and least popular song
app.get('/api/most-least-pop', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try {
    const [topSongs] = await db.query(`
      (
        SELECT track_name, artist_name, image_url, popularity
        FROM user_data
        WHERE user_id = ? AND time_range = ?
        ORDER BY popularity DESC
        LIMIT 1
      )
      UNION
      (
        SELECT track_name, artist_name, image_url, popularity
        FROM user_data
        WHERE user_id = ? AND time_range = ?
        ORDER BY popularity ASC
        LIMIT 1
      )`, [req.session.userId, timeRange, req.session.userId, timeRange]);
    res.json({
      mostPopular: topSongs[0],
      leastPopular: topSongs[1]
    });
  } catch (e) {
    console.log('Error fetching songs by popularity:', e);
    res.status(500).json({ error: 'failed to fetch songs by popularity'});
  }
})


//route to get longes/shortest songs
app.get('/api/longest-shortest-song', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';

  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try{
    const [longSongs] = await db.query(`
      (
        SELECT track_name, artist_name, image_url, duration_ms
        FROM user_data
        WHERE user_id = ? AND time_range = ?
        ORDER BY duration_ms DESC
        LIMIT 1
      )
      UNION
      (
        SELECT track_name, artist_name, image_url, duration_ms
        FROM user_data
        WHERE user_id = ? AND time_range = ?
        ORDER BY duration_ms ASC
        LIMIT 1
      )
      ORDER BY duration_ms DESC
      `, [req.session.userId, timeRange, req.session.userId, timeRange]);
    res.json({
      longest: longSongs[0],
      shortest: longSongs[1]
    });
  } catch(e) {
    console.log('Error fetching songs by duration:', e);
    res.status(500).json({ error: 'failed to fetch songs by duration'});
  }
})

//top by decade 2010s and 2020s
app.get('/api/top-by-decade', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';

  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try {
    const [decade] = await db.query(`
      (
        SELECT track_name, artist_name, image_url, popularity, release_date, '2010s' as decade_label
        FROM user_data
        WHERE user_id = ? 
          AND time_range = ?
          AND release_date >= '2010-01-01' 
          AND release_date < '2020-01-01'
        ORDER BY rank_position ASC
        LIMIT 1
      )
      UNION
      (
        SELECT track_name, artist_name, image_url, popularity, release_date, '2020s' as decade_label
        FROM user_data
        WHERE user_id = ? 
          AND time_range = ?
          AND release_date >= '2020-01-01'
        ORDER BY rank_position ASC
        LIMIT 1
      )
      `, [req.session.userId, timeRange, req.session.userId, timeRange]);
      

    const decade2010s = decade.find(item => item.decade_label === '2010s') || null;
    const decade2020s = decade.find(item => item.decade_label === '2020s') || null;

    res.json({
      decade2010s: decade2010s,
      decade2020s: decade2020s
    });
  } catch (e) {
    console.log('Error fetching songs by decade:', e);
    res.status(500).json({ error: 'failed to fetch songs by decade'});
  }
})  




//route to logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("error detroyig session:", err);
      return res.status(500).json({ error: 'failed to logout' });
    }

    res.redirect('http://127.0.0.1:3000/')
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});