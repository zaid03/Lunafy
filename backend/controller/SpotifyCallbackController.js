const axios = require('axios');
const querystring = require('querystring');
const { db } = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

exports.handleAuth = async (req, res, next) => {
    const code = req.body.code;
    if (!code) {
        return res.status(400).json({ error: 'authorization code missing'});
    }

    try {
      // Exchange code for tokens
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
    // Fetch user info from Spotify
    const userRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const {display_name, email, country, followers, images} = userRes.data;

    const followerCount = followers?.total || 0;
    const profileImage = images && images.length > 0 ? images[0].url : null;

    // update user in DB
    let [user] = await db.query('select * from users where email = ?', [email]);
    let userId;
    if(user.length > 0) {
      userId = user[0].id;
        await db.query('update users set name = ?, country = ?, followers = ?, profile_image = ? where id = ?',
    [display_name, country, followerCount, profileImage, userId]);

      await db.query(
        'update user_tokens set access_token = ?, refresh_token = ?, expires_in = ?, token_type = ?, scope = ?, token_received_at = NOW() where user_id = ?', [access_token, refresh_token, expires_in, token_type, scope, userId]
        );
    } else {
      const [result] = await db.query(
        'insert into users (name, email, country, followers, profile_image, joined) values (?, ?, ?, ?, ?, NOW())',
        [display_name, email, country, followerCount, profileImage]
      );
      userId = result.insertId;
      

      await db.query(
      'insert into user_tokens (user_id, access_token, refresh_token, expires_in, token_type, scope, token_received_at) values (?, ?, ?, ?, ?, ?, NOW())', [userId, access_token, refresh_token, expires_in, token_type, scope]
      );
    }

    let playingNow = null;
    try {
      const playingRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (playingRes.data && playingRes.data.item) {
        const item = playingRes.data.item;
        playingNow = {
          name: item.name,
          artists: item.artists.map(a => a.name).join(', '),
          albumImage: item.album.images && item.album.images.length > 0 ? item.album.images[0].url : null,
          is_playing: playingRes.data.is_playing
        };
      }
    } catch (err) {
      playingNow = null;
    }

    //setting items to send and save in db
    req.session.userId = userId;
    req.session.display_name = display_name;
    req.session.profileImage = profileImage;

    // updating the last_login and seen for admin panel
    await db.query('UPDATE users SET last_login = NOW(), last_seen = NOW() WHERE id = ?', [userId]);

    await logActivity({
      action: 'user_login',
      actorType: `User ${display_name}`,
      actorId: userId,
      message: `User ${display_name} logged in`
    });
    // Send and save token with other items into db
    return res.json({ success: true, userId, display_name, profileImage, playingNow});

  } catch (err) {
    if (err.isAxiosError) {
      err.status = 502;
      err.code = err.code || 'AXIOS_ERROR';
      const m = err.config?.method?.toUpperCase();
      const u = err.config?.url;
      const s = err.response?.status;
      err.message = `[axios ${m} ${u} -> ${s}] ${err.message}`;
    }
    return next(err);
  }
};