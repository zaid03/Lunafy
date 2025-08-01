const axios = require('axios');
const querystring = require('querystring');
const { db } = require('../config/db');

const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

exports.handleAuth = async (req, res) => {
    const code = req.body.code;

    if (!code) {
        return res.status(400).json({ error: 'authorization code missing'});
    }

    try {
      // 1. Exchange code for tokens
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in, token_type, scope } = response.data;
    // 2. Fetch user info from Spotify
    const userRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const {display_name, email} = userRes.data;

    // 3. Upsert user in DB
    let [user] = await db.query('select * from users where email = ?', [email]);
    let userId;
    if(user.length > 0) {
      userId = user[0].id;
      await db.query('update users set name = ? where id = ?', [display_name, userId]);
    } else {
      const [result] = await db.query('insert into users (name, email) values (?, ?)', [display_name, email]);
      userId = result.insertId;
    }

    // 4. Save tokens in user_tokens table
    
    await db.query(
      'insert into user_tokens (user_id, access_token, refresh_token, expires_in, token_type, scope, token_received_at) values (?, ?, ?, ?, ?, ?, NOW())', [userId, access_token, refresh_token, expires_in, token_type, scope]
    );

    // Send tokens to frontend (or save them later in a DB)
    req.session.userId = userId;
    res.json({ success: true, userId});

  } catch (err) {
    console.error('Spotify OAuth error:', err);
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
    }
    if (err.request) {
      console.error('Error request:', err.request);
    }
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Failed to get access token' });
  }
};