const axios = require('axios');
const userModel = require('../models/userModel');

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
}

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
}

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
}

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
}

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
}

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
}

//route to fetch all artists
exports.topAllArtists = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const topAllArtists = await userModel.topAllArtists(req.session.userId, timeRange);

        res.json({ artists: topAllArtists });
    } catch (e) {
        console.error('Error fetching top all artists', e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
}

//route to fetch all songs
exports.topAllSongs = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const topAllSongs = await userModel.topAllSongs(req.session.userId, timeRange);

        res.json({ 
            songs : topAllSongs
        })
    } catch (e) {
        console.error('error fetching all songs:', e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
}

//route to fetch all albums
exports.topAllAlbums = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try { 
        const topAllAlbums = await userModel.topAllAlbums(req.session.userId, timeRange);

        res.json({ 
            albums : topAllAlbums
        })
    } catch (e) {
        console.error("error fetching top all albums", e);
        res.status(500).json({ error: 'failed to fetch dashboard content'});
    }
}

//route to get user's taste
exports.musicInsight = async (req, res) => {
    const timeRange = req.query.timeRange || 'medium_term';
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const musicInsightArtists = await userModel.musicInsightArtists(req.session.userId);
        const musicInsightSongs = await userModel.musicInsightSongs(req.session.userId);
        const musicInsightAlbums = await userModel.musicInsightAlbums(req.session.userId);
        const musicInsightUniqueArtists = await userModel.musicInsightUniqueArtists(req.session.userId);
        const musicInsightavgPopularity = await userModel.musicInsightavgPopularity(req.session.userId);

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
}