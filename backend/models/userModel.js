const { db } = require('../config/db');

exports.getUserById = async (userId) => {
    try {
        const [user] = await db.query('SELECT name, email, country, followers, profile_image FROM users WHERE id = ?', [userId]);
        return user[0];
    } catch (error) {
        console.error(`[getUserById] Error:`, error);
        throw error;
    }
};
  
exports.getUserToken = async (userId) => {
    try {
        const [tokenRow] = await db.query('SELECT access_token FROM user_tokens WHERE user_id = ?', [userId]);
        return tokenRow[0];
    } catch (error) {
        console.error(`[getUserToken] Error:`, error);
        throw error;
    }
};

//route to get albums, songs and artists
exports.saveTrack = async (trackData) => {
    try {
        await db.query(`
            INSERT INTO user_data (
            user_id, spotify_track_id, track_name, artist_name, artist_id, album_name, album_id, image_url, preview_url, duration_ms, popularity, external_url, explicit, release_date, time_range, rank_position, genres
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            created_at = CURRENT_TIMESTAMP,
            genres = VALUES(genres)
            `, [
                trackData.user_id, 
                trackData.spotify_track_id, 
                trackData.track_name,
                trackData.artist_name,  
                trackData.artist_id, 
                trackData.album_name,
                trackData.album_id, 
                trackData.image_url, 
                trackData.preview_url,
                trackData.duration_ms, 
                trackData.popularity, 
                trackData.external_url,
                trackData.explicit, 
                trackData.release_date, 
                trackData.time_range,
                trackData.rank_position,
                trackData.genres,
            ]);

    } catch (error) {
        console.error(`[saveTrack] Error saving track:`, error);
        console.error(`[saveTrack] Track data that failed:`, trackData);
        throw error;
    }
};

//dashboard overview - top 10 of each
exports.fetchTopTenArtists = async (userId, timeRange) => {
    try {
        const [artists] = await db.query(`
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
            GROUP BY SUBSTRING_INDEX(artist_name, ',', 1)
            ORDER BY best_track_rank ASC  
            LIMIT 10
        `, [userId, timeRange]);
        return artists;
    } catch (error) {
        console.error(`[fetchTopTenArtists] Error:`, error);
        throw error;
    }
};

exports.fetchTopTenAlbums = async (userId, timeRange) => {
    try {
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
        `, [userId, timeRange]);
        return albums;
    } catch (error) {
        console.error(`[fetchTopTenAlbums] Error:`, error);
        throw error;
    }
};

exports.fetchTopTenSongs = async (userId, timeRange) => {
    try {
        const [songs] = await db.query(`
          SELECT track_name, artist_name, image_url, rank_position FROM user_data WHERE user_id = ? AND time_range = ? ORDER BY rank_position ASC LIMIT 10
        `, [userId, timeRange]);
        return songs;
    } catch (error) {
        console.error(`[fetchTopTenSongs] Error:`, error);
        throw error;
    }
};

//route to fetch the most and least popular song
exports.PopularSongs = async (userId, timeRange) => {
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
          )`, [userId, timeRange, userId, timeRange]);
        return topSongs;
    } catch (error) {
        console.error(`[PopularSongs] Error:`, error);
        throw error;
    }
};

//route to get longes/shortest songs
exports.longestShortes = async (userId, timeRange) => {
    try {
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
          `, [userId, timeRange, userId, timeRange]);
        return longSongs;
    } catch (error) {
        console.error(`[longestShortes] Error:`, error);
        throw error;
    }
};

//top by decade 2010s and 2020s
exports.topByDecade = async (userId, timeRange) => {
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
          `, [userId, timeRange, userId, timeRange]);
        return decade;
    } catch (error) {
        console.error(`[topByDecade] Error:`, error);
        throw error;
    }
};

//route to fetch all artists
exports.topAllArtists = async (userId, timeRange) => {
    try {
        const [artists] = await db.query(`
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
          GROUP BY SUBSTRING_INDEX(artist_name, ',', 1)
          ORDER BY best_track_rank ASC  
          LIMIT 50
          `, [userId, timeRange]);
        return artists;
    } catch (error) {
        console.error(`[topAllArtists] Error:`, error);
        throw error;
    }
};

//route to fetch all songs
exports.topAllSongs = async (userId, timeRange) => {
    try {
        const [songs] = await db.query(`
          SELECT track_name, artist_name, image_url, rank_position, external_url FROM user_data WHERE user_id = ? AND time_range = ? ORDER BY rank_position ASC LIMIT 50
          `, [userId, timeRange]);
        return songs;
    } catch (error) {
        console.error(`[topAllSongs] Error:`, error);
        throw error;
    }
};

//route to fetch all albums
exports.topAllAlbums = async (userId, timeRange) => {
    try {
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
          LIMIT 50
          `, [userId, timeRange]);
        return albums;
    } catch (error) {
        console.error(`[topAllAlbums] Error:`, error);
        throw error;
    }
};

//route to get user's taste
exports.musicInsightArtists = async (userId) => {
    try {
        const [topArtist] = await db.query(`
          SELECT SUBSTRING_INDEX(artist_name, ',', 1) AS topArtist
          FROM user_data
          WHERE user_id = ? AND time_range = 'short_term'
          GROUP BY topArtist
          ORDER BY COUNT(*) DESC
          LIMIT 1;
        `, [userId]);
        return topArtist;
    } catch (error) {
        console.error(`[musicInsightArtists] Error:`, error);
        throw error;
    }
};

exports.musicInsightSongs = async (userId) => {
    try {
        const [topSong] = await db.query(`
          SELECT track_name AS topSong
          FROM user_data
          WHERE user_id = ? AND time_range = 'short_term'
          ORDER BY rank_position ASC
          LIMIT 1;
        `, [userId]);
        return topSong;
    } catch (error) {
        console.error(`[musicInsightSongs] Error:`, error);
        throw error;
    }
};

exports.musicInsightAlbums = async (userId) => {
    try {
        const [topGenre] = await db.query(`
          SELECT genre, COUNT(*) AS count
          FROM (
            SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(genres, ',', numbers.n), ',', -1)) AS genre
            FROM user_data
            CROSS JOIN (
              SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
            ) numbers
            WHERE user_id = ? AND time_range = 'short_term'
              AND genres IS NOT NULL AND genres <> ''
              AND LENGTH(genres) > 0
              AND numbers.n <= 1 + LENGTH(genres) - LENGTH(REPLACE(genres, ',', ''))
              AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(genres, ',', numbers.n), ',', -1)) <> ''
          ) AS all_genres
          GROUP BY genre
          ORDER BY count DESC
          LIMIT 1;
        `, [userId]);
        return topGenre;
    } catch (error) {
        console.error(`[musicInsightAlbums] Error:`, error);
        throw error;
    }
};

exports.musicInsightUniqueArtists = async(userId) => {
    try {
        const [uniqueArtists] = await db.query(`
          SELECT COUNT(DISTINCT artist_name) AS uniqueArtists
          FROM user_data
          WHERE user_id = ? AND time_range = 'medium_term'
        `, [userId]);
        return uniqueArtists;
    } catch (error) {
        console.error(`[musicInsightUniqueArtists] Error:`, error);
        throw error;
    }
};

exports.musicInsightavgPopularity = async(userId) => {
    try {
        const [avgPopularity] = await db.query(`
          SELECT AVG(popularity) AS avgPopularity
          FROM user_data
          WHERE user_id = ? AND time_range = 'short_term'
        `, [userId]);
        return avgPopularity;
    } catch (error) {
        console.error(`[musicInsightavgPopularity] Error:`, error);
        throw error;
    }
};

//route to fetch top genres
exports.topAllGeneres = async(userId, timeRange) => {

    try {
        const [rows] = await db.query(`   
          SELECT genres
          FROM user_data
          WHERE user_id = ? AND time_range = ?
            AND genres IS NOT NULL AND genres <> ''
          `, [userId, timeRange]);
        return rows;
    } catch (error) {
        console.error(`[topAllGeneres] Error:`, error);
        throw error;
    }
};

//profile route to fetch email, password, verification and plan in future
exports.profileInfo = async(userId) => {
    try {
        const [info] = await db.query(`
          select email, verified from users where id = ?
          `, [userId]);
        return info;
    } catch (error) {
        console.error(`[profileInfo] Error:`, error);
        throw error;
    }
};

//route to insert or update bio for user
exports.saveUserBio = async (userId, bio) => {
    try {
        const [rows] = await db.query(
            'SELECT user_id FROM user_personnalisation WHERE user_id = ?',
            [userId]
        );
        if (rows.length > 0) {
            await db.query(
                'UPDATE user_personnalisation SET bio = ? WHERE user_id = ?',
                [bio, userId]
            );
        } else {
            await db.query(
                'INSERT INTO user_personnalisation (user_id, bio) VALUES (?, ?)',
                [userId, bio]
            );
        }
    } catch (error) {
        console.error(`[saveUserBio] Error:`, error);
        throw error;
    }
};

//route to fetch bio from db
exports.bioGet = async (userId) => {
    try {
        const [bio] = await db.query(`
          select bio from user_personnalisation where user_id = ?
          `, [userId]);
        return bio;
    } catch (error) {
        console.error(`[bioGet] Error:`, error);
        throw error;
    }
};

//route to insert and update country
exports.userCountry = async (userId, country) => {
    try {
        const [rows] = await db.query(`
          select user_id from user_personnalisation where user_id = ?
          `, [userId]);
        if (rows.length > 0) {
            await db.query(`
                UPDATE user_personnalisation SET country = ? WHERE user_id = ?
                `, [country, userId]);
        } else {
            await db.query(`
                INSERT INTO user_personnalisation (user_id, country) VALUES (?, ?)
                `, [userId, country]);
        }
    } catch (error) {
        console.error(`[userCountry] Error:`, error);
        throw error;
    }
};

//route to delete account
exports.deleteAccount = async(userId) => {
    try {
        const [deletion] = await db.query(`
          update users set deletion = 1 where id = ?
          `, [userId]);
    } catch (error) {
        console.error(`[deleteAccount] Error:`, error);
        throw error;
    }
};

//route to add playlists to spotify
exports.getTopSongsForPlaylist = async (userId, timeRange) => {
    try {
        const [songs] = await db.query(`
          SELECT spotify_track_id 
          FROM user_data 
          WHERE user_id = ? AND time_range = ? 
          ORDER BY rank_position ASC 
          LIMIT 50
        `, [userId, timeRange]);
        return songs;
    } catch (error) {
        console.error(`[getTopSongsForPlaylist] Error:`, error);
        throw error;
    }
};