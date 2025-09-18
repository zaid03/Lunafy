const axios = require('axios');
const userModel = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { db } = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

// route for user info to the dahsboard
exports.getMe = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try{
        const user = await userModel.getUserById(req.session.userId);
        const tokenRow = await userModel.getUserToken(req.session.userId);

        let playingNow = null;
        if ( tokenRow && tokenRow.access_token){
            try {
                const playingRes = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: { Authorization: `Bearer ${tokenRow.access_token}` }
                });

                if ( playingRes.data && playingRes.data.item) {
                    const item = playingRes.data.item;
                    playingNow = {
                        name: item.name,
                        artists: item.artists.map(a => a.name).join(', '),
                        albumImage: item.album.images?.[0]?.url || null,
                        is_playing: playingRes.data.is_playing,
                        preview_url: item.preview_url
                    };
                }
            } catch (e) {
                playingNow = null;
            }
        }
        await logActivity({
            action: 'user_fetched_their_data',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has fetched their data`
        });
        res.json({
            userId: req.session.userId,
            display_name: req.session.display_name,
            profileImage: req.session.profileImage,
            ...user,
            playingNow
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
};

//route to get albums, songs and artists
exports.saveUserStats = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const tokenRow = await userModel.getUserToken(req.session.userId);
        if (!tokenRow || !tokenRow.access_token) {
            return res.status(401).json({ error: 'No access token found' });
        }
        const accessToken = tokenRow.access_token;
        const timeRanges = ['short_term', 'medium_term', 'long_term'];
        const artistGenreMap = {};

        for (const timeRange of timeRanges) {
            // Fetch top tracks
            const topTracksRes = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            // Collect unique artist IDs from tracks
            const uniqueArtistIds = new Set();
            if (topTracksRes.data && topTracksRes.data.items) {
                topTracksRes.data.items.forEach(track => {
                    track.artists.forEach(artist => {
                        uniqueArtistIds.add(artist.id);
                });
            });
        }

        // Fetch genres for each unique artist (cache in artistGenreMap)
        for (const artistId of uniqueArtistIds) {
            if (!artistGenreMap[artistId]) {
                try {
                    const artistRes = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    artistGenreMap[artistId] = artistRes.data.genres.join(',');
                } catch (e) {
                    artistGenreMap[artistId] = '';
                }
            }
        }

        // Save tracks to DB with genres
        if (topTracksRes.data && topTracksRes.data.items) {
            for (let i = 0; i < topTracksRes.data.items.length; i++) {
                const track = topTracksRes.data.items[i];
                const artistId = track.artists[0]?.id || null;
                const genres = artistGenreMap[artistId] || '';

                const trackData = {
                    user_id: req.session.userId,
                    spotify_track_id: track.id,
                    track_name: track.name,
                    artist_name: track.artists.map(a => a.name).join(', '),
                    artist_id: artistId,
                    album_name: track.album.name,
                    album_id: track.album.id,
                    image_url: track.album.images && track.album.images.length > 0 ? track.album.images[0].url : null,
                    preview_url: track.preview_url,
                    duration_ms: track.duration_ms,
                    popularity: track.popularity,
                    external_url: track.external_urls?.spotify || null,
                    explicit: track.explicit,
                    release_date: track.album.release_date || null,
                    time_range: timeRange,
                    rank_position: i + 1,
                    genres: genres
                };

                await userModel.saveTrack(trackData);
            }
        }
    }
        res.json({ message: `Saved tracks to database` });
    } catch (err) {
        console.error('Error saving content into database:', err.response?.data || err.message);
        res.status(500).json({ error: 'Error saving content into database'});
    }
};

//dashboard overview - top 10 of each
exports.dashboardOverview = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const topArtists = await userModel.fetchTopTenArtists(req.session.userId, timeRange);
        const topalbums = await userModel.fetchTopTenAlbums(req.session.userId, timeRange);
        const topsongs = await userModel.fetchTopTenSongs(req.session.userId, timeRange);

        res.json({
            artists: topArtists,
            albums: topalbums,
            songs: topsongs
        });
    } catch (e) {
        console.log('Error fetching dashboard overview data:', e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
};

//route to fetch the most and least popular song
exports.mostLeastPop = async (req,res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const PopularSongs = await userModel.PopularSongs(req.session.userId, timeRange);

        res.json({
            mostPopular: PopularSongs[0],
            leastPopular: PopularSongs[1]
        });

    } catch (e) {
        console.log('Error fetching songs by popularity:', e);
        res.status(500).json({ error: 'failed to fetch songs by popularity'});
    }
};

//route to get longes/shortest songs
exports.longestShortes = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {

        const longestShortes = await userModel.longestShortes(req.session.userId, timeRange);

        res.json({
            longest: longestShortes[0],
            shortest: longestShortes[1]
        });
    } catch (e) {
        console.log('Error fetching songs by duration:', e);
        res.status(500).json({ error: 'failed to fetch songs by duration'});
    }
};

//top by decade 2010s and 2020s
exports.topByDecade = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {

        const topByDecade = await userModel.topByDecade(req.session.userId, timeRange);

        res.json({
            decade2010s: topByDecade[0],
            decade2020s: topByDecade[1]
        });

    } catch (e) {
        console.log('Error fetching songs by decade:', e);
        res.status(500).json({ error: 'failed to fetch songs by decade'});
    }
};

//route to fetch all artists
exports.topAllArtists = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const topAllArtists = await userModel.topAllArtists(req.session.userId, timeRange);

        //to log action
        await logActivity({
            action: 'user_fetched_top_artists',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has fetched top artists`
        });

        res.json({ artists: topAllArtists });
    } catch (e) {
        console.error('Error fetching top all artists', e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
};

//route to fetch all songs
exports.topAllSongs = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const topAllSongs = await userModel.topAllSongs(req.session.userId, timeRange);

        //to log action
        await logActivity({
            action: 'user_fetched_top_songs',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has fetched top songs`
        });

        res.json({ 
            songs : topAllSongs
        })
    } catch (e) {
        console.error('error fetching all songs:', e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
};

//route to fetch all albums
exports.topAllAlbums = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try { 
        const topAllAlbums = await userModel.topAllAlbums(req.session.userId, timeRange);

        //to log action
        await logActivity({
            action: 'user_fetched_top_albums',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has fetched top albums`
        });

        res.json({ 
            albums : topAllAlbums
        })
    } catch (e) {
        console.error("error fetching top all albums", e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
};

//route to get user's taste
exports.musicInsight = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const musicInsightArtists = await userModel.musicInsightArtists(req.session.userId);
        const musicInsightSongs = await userModel.musicInsightSongs(req.session.userId);
        const musicInsightAlbums = await userModel.musicInsightAlbums(req.session.userId);
        const musicInsightUniqueArtists = await userModel.musicInsightUniqueArtists(req.session.userId);
        const musicInsightavgPopularity = await userModel.musicInsightavgPopularity(req.session.userId);

        //to log action
        await logActivity({
            action: 'user_discovered_their_taste',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has visited their taste`
        });

         res.json({
            topArtist: musicInsightArtists,
            topSong: musicInsightSongs,
            topGenre: musicInsightAlbums,
            uniqueArtists: musicInsightUniqueArtists?.[0].uniqueArtists || '',
            avgPopularity: musicInsightavgPopularity?.[0].avgPopularity || ''
        });
    } catch (e) {
        console.error("Error fetching insights:", e);
        res.status(500).json({ error: "failed to fetch insights" });
    }
};

//route to fetch top genres
exports.topAllGeneres = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const topAllGeneres = await userModel.topAllGeneres(req.session.userId, timeRange)
        const genreCount = {};
        topAllGeneres.forEach(row => {
            row.genres.split(',').forEach(genre => {
                const g = genre.trim();
                if (g) genreCount[g] = (genreCount[g] || 0) + 1;
            });
        });

        const genres = Object.entries(genreCount)
        .map(([genre, count]) => ({ genres: genre, track_count: count }))
        .sort((a, b) => b.track_count - a.track_count)
        .slice(0, 50);

        //to log action
        await logActivity({
            action: 'user_fetched_top_genres',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has fetched top genres`
        });

        res.json({ 
            genres
         });
    } catch (e) {
        console.error("error fetching top genres:", e);
        res.status(500).json({ error: 'failed to fetch genres content'});
    }
};

//profile route to fetch email, password, verification and plan in future
exports.profileInfo = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const profileInfo = await userModel.profileInfo(req.session.userId);
        res.json({
            info: profileInfo
        })

    } catch(e) {
        console.error("error fetching user's profile's info:", e);
        res.status(500).json({ error: "error fetching user's profile's info"});
    }
};

//route to insert or update bio for user
exports.saveUserBio = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const { bio } = req.body;

    try {
        await userModel.saveUserBio(req.session.userId, bio);

        //to log action
        await logActivity({
            action: 'user_updated_their_bio',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has updated their bio`
        });

        res.json({ message: 'Bio Saved!' });
    } catch (e) {
        console.error('Error saving bio:', e);
        res.status(500).json({ error: 'Failed to save bio' });
    }
};

//route to fetch bio from db
exports.bioGet = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const bioGet = await userModel.bioGet(req.session.userId)
        res.json({
            bio : bioGet
        })
    } catch(e) {
        console.error('Error fetching bio:', e);
        res.status(500).json({ error: 'Failed to fetch bio' });
    }
};

//route to insert and update country
exports.userCountry = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { country } = req.body;

    try {
        await userModel.userCountry(req.session.userId, country);

        //to log action
        await logActivity({
            action: 'user_updated_Their_country',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has updated their country`
        });
        res.json({ message: 'country Saved!' });
    } catch (e) {
        console.error('Error saving country:', e);
        res.status(500).json({ error: 'Failed to save country' });
    }
};

//route to logout
exports.logout = async(req, res) => {
    try {
        if (req.session?.userId) {
            await logActivity({
                action: 'user_logged_out',
                actorType: 'user',
                actorId: req.session.userId,
                message: `user ${req.session.display_name || 'unknown'} logged out`,
            });
        }
    } catch (e) {
    // ignore logging errors
    }

    req.session.destroy((err) => {
        if (err) {
            console.error('error destroying session:', err);
            return res.status(500).json({ error: 'failed to logout' });
        }
        res.clearCookie('connect.sid');
        return res.redirect('http://127.0.0.1:3000/');
    });
};

//route to delete account
exports.deleteAccount = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        await userModel.deleteAccount(req.session.userId);

        //to log action
        await logActivity({
            action: 'user_deleted_Account',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has deleted their account`
        });

        res.json({
            message: "account deleted successfully"
        })
    } catch(e) {
        console.error("error deleting account:", e);
        res.status(500).json({ error: "error deleting account"});
    }
}

//route to add playlists to spotify
exports.createPlaylist = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const { name, description, timeRange } = req.body;
        const tokenRow = await userModel.getUserToken(req.session.userId);
        const accessToken = tokenRow?.access_token;

        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }

        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const spotifyUserId = userResponse.data.id;

        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
            { name, description, public: false },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const playlistId = playlistResponse.data.id;

        const songs = await userModel.getTopSongsForPlaylist(req.session.userId, timeRange);
        if (songs.length === 0) {
            return res.status(400).json({ error: 'No songs found for this time range' });
        }
        const trackUris = songs.map(song => `spotify:track:${song.spotify_track_id}`);

        await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: trackUris },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        //to log action
        await logActivity({
            action: 'user_added_a_playlist_to_spotify',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has added a new playlist, ${playlistResponse.data.name}`
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
};

//route to verify account (generating token and sending email)
exports.sendVerificationEmail = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
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

        //to log action
        await logActivity({
            action: 'user_tried_to_verify_their_email',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has sent a verification email`
        });
        res.json({ message: 'Verification email sent!' });
    } catch (e) {
        console.error("error sending verification email:", e);
        res.status(500).json({ error: "error sending verification email" });
    }
};

//route to verify the email
exports.verifyEmail = async (req, res) => {
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

        //to log action
        await logActivity({
            action: 'user_verified_their_email',
            actorType: 'user',
            actorId:  req.session.userId,
            message: `user ${req.session.display_name || unknown} has verified their email`
        });

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
};