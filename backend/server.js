const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { handleSpotifyAuth } = require('./controller/SpotifyCallbackController');
const session = require('express-session');
const axios = require('axios');
const { db } = require('./config/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer')
const csurf = require('csurf');
const cookieParser = require('cookie-parser');

dotenv.config();
connectDB();

const app = express();

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

// route for user info to the dahsboard
const userRoutes = require('./routes/userRoute');
app.use('/api', userRoutes);

//route to add playlists to spotify
app.post('/api/create-playlist', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { name, description, timeRange } = req.body;
    
    const [tokenRow] = await db.query('SELECT access_token FROM user_tokens WHERE user_id = ?', [req.session.userId]);
    if (!tokenRow || !tokenRow[0] || !tokenRow[0].access_token) {
      return res.status(401).json({ error: 'No access token found' });
    }

    const accessToken = tokenRow[0].access_token;

    
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const spotifyUserId = userResponse.data.id;


    const playlistResponse = await axios.post(`https://api.spotify.com/v1/users/${spotifyUserId}/playlists`, {
      name: name,
      description: description,
      public: false
    }, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const playlistId = playlistResponse.data.id;

    // Get top songs from database
    const [songs] = await db.query(`
      SELECT spotify_track_id 
      FROM user_data 
      WHERE user_id = ? AND time_range = ? 
      ORDER BY rank_position ASC 
      LIMIT 50
    `, [req.session.userId, timeRange]);

    if (songs.length === 0) {
      return res.status(400).json({ error: 'No songs found for this time range' });
    }

    const trackUris = songs.map(song => `spotify:track:${song.spotify_track_id}`);
    
    await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      uris: trackUris
    }, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      message: 'Playlist created successfully!',
      playlist: {
        id: playlistId,
        name: playlistResponse.data.name,
        url: playlistResponse.data.external_urls.spotify,
        tracks_added: songs.length
      }
    });

  } catch (error) {
    console.error('Error creating playlist:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create playlist',
      details: error.response?.data?.error?.message || error.message
    });
  }
});





//route to fetch top genres
app.get('/api/top-all-genres', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try {
    const [rows] = await db.query (`   
      SELECT genres
      FROM user_data
      WHERE user_id = ? AND time_range = ?
        AND genres IS NOT NULL AND genres <> ''
      `, [req.session.userId, timeRange])
      const genreCount = {};
      rows.forEach(row => {
        row.genres.split(',').forEach(genre => {
          const g = genre.trim();
          if (g) genreCount[g] = (genreCount[g] || 0) + 1;
        });
      });

      const genres = Object.entries(genreCount)
      .map(([genre, count]) => ({ genres: genre, track_count: count }))
      .sort((a, b) => b.track_count - a.track_count)
      .slice(0, 50);

      res.json({ genres });
  } catch (e) {
    console.error("error fetching top genres:", e);
    res.status(500).json({ error: 'failed to fetch genres content'});
  }
})

//profile route to fetch email, password, verification and plan in future
app.get('/api/profile-info', async (req, res) => {
  const timeRange = req.query.timeRange || 'medium_term';
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try {
    const [info] = await db.query(`
      select email, verified from users where id = ?
      `, [req.session.userId]);
    res.json({
      info
    })
  } catch (e) {
    console.error("error fetching user's profile's info:", e);
    res.status(500).json({ error: "error fetching user's profile's info"});
  }
})

//route to verify account (generating token and sending email)
app.post('/api/send-verification-email', async(req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try{
    const token = crypto.randomBytes(32).toString('hex');
    await db.query('UPDATE users SET verification_token = ? WHERE id = ?', [token, req.session.userId]);

    const [user] = await db.query('SELECT email FROM users WHERE id = ?', [req.session.userId]);
    const email = user[0]?.email;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const verifyUrl = `http://localhost:5000/api/verify-email?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #181818; color: #fff; padding: 32px; border-radius: 12px; max-width: 420px; margin: 40px auto; box-shadow: 0 2px 12px #0003;">
      <h2 style="color: #1db954; margin-bottom: 18px;">Lunafy Email Verification</h2>
      <p style="font-size: 1.1rem; margin-bottom: 24px;">
        Welcome to <b>Lunafy</b>! Please verify your email address to unlock all features and keep your account secure.
      </p>
      <a href="${verifyUrl}" style="display: inline-block; background: #1db954; color: #fff; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 1.1rem; box-shadow: 0 2px 8px #0002;">
        ✅ Verify My Email
      </a>
      <p style="margin-top: 32px; font-size: 0.95rem; color: #aaa;">
        If you did not request this, you can safely ignore this email.<br>
        <span style="color: #1db954;">Lunafy</span> &mdash; Your music, your stats.
      </p>
    </div>`
    });

    res.json({ message: 'Verification email sent!' });
  } catch (e) {
    console.error("error sending verification email:", e);
    res.status(500).json({ error: "error sending verification email"});
  }
})

//route to verify the email
app.get('/api/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('No token provided');
  }

  try {
    const [user] = await db.query('SELECT id FROM users WHERE verification_token = ?', [token]);
    if (!user.length) {
      return res.status(400).send('Invalid or expired token');
    }

    await db.query('UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?', [user[0].id]);
    res.send(`<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #181818; color: #fff; padding: 48px 32px; border-radius: 14px; max-width: 420px; margin: 80px auto; box-shadow: 0 2px 16px #0005; text-align: center;">
    <h2 style="color: #1db954; margin-bottom: 18px;">✅ Email Verified!</h2>
    <p style="font-size: 1.15rem; margin-bottom: 24px;">
      Your email has been successfully verified.<br>
      You can now close this tab and continue using <span style="color: #1db954;">Lunafy</span>.
    </p>
    <a href="http://localhost:3000/" style="display: inline-block; background: #1db954; color: #fff; font-weight: 600; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 1rem;">
      Go to Lunafy
    </a>
  </div>`);
  } catch (e) {
    console.error('Error verifying email:', e);
    res.status(500).send('Failed to verify email');
  }
});

//route to insert or update bio for user
app.post('/api/user-bio', async(req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  const { bio } = req.body

  try {
    const [rows] = await db.query(`
      select user_id from user_personnalisation where user_id = ?
      `, [req.session.userId]);

    if (rows.length > 0 ) {
      await db.query(`
        UPDATE user_personnalisation SET bio = ? WHERE user_id = ?
        `, [bio, req.session.userId]);
    } else {
      await db.query(`
        INSERT INTO user_personnalisation (user_id, bio) VALUES (?, ?)
        `, [req.session.userId, bio]);
    }

    res.json({ message: 'Bio Saved!' });
  } catch (e) {
    console.error('Error saving bio:', e);
    res.status(500).json({ error: 'Failed to save bio' });
  }
});

//route to fetch bio from db
app.get('/api/bio-get', async(req,res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try { 
    const [bio] = await db.query(`
      select bio from user_personnalisation where user_id = ?
      `, [req.session.userId]);
    
    res.json({bio})
  } catch(e) {
    console.error('Error fetching bio:', e);
    res.status(500).json({ error: 'Failed to fetch bio' });
  }
})

//route to insert and update country
app.post('/api/user-country', async(req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  const { country } = req.body

  try {
    const [rows] = await db.query(`
      select user_id from user_personnalisation where user_id = ?
      `, [req.session.userId]);

    if (rows.length > 0 ) {
      await db.query(`
        UPDATE user_personnalisation SET country = ? WHERE user_id = ?
        `, [country, req.session.userId]);
    } else {
      await db.query(`
        INSERT INTO user_personnalisation (user_id, country) VALUES (?, ?)
        `, [req.session.userId, country]);
    }

    res.json({ message: 'country Saved!' });
  } catch (e) {
    console.error('Error saving country:', e);
    res.status(500).json({ error: 'Failed to save country' });
  }
});

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

//route to delete account
app.post('/api/delete-account', async(req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'not authenticated'});
  }

  try {
    const [deletion] = await db.query(`
      update users set deletion = 1 where id = ?
      `, [req.session.userId]);

    res.json({
      message: "account deleted successfully"
    })
  } catch (e) {
    console.error("error deleting account:", e);
    res.status(500).json({ error: "error deleting account"});
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on localhost:${PORT}`);
});