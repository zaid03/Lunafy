const { db } = require('../config/db');

exports.getUserById = async (userId) => {
    const [user] = await db.query('SELECT name, email, country, followers, profile_image FROM users WHERE id = ?', [userId]);
    return user[0];
};

exports.getUserToken = async (userId) => {
    const [tokenRow] = await db.query('SELECT access_token FROM user_tokens WHERE user_id = ?', [userId]);
    return tokenRow[0];
};

//route to get albums, songs and artists
exports.saveTrack = async (trackData) => {
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
};

//dashboard overview - top 10 of each
exports.fetchTopTenArtists = async (userId, timeRange) =>{
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
        GROUP BY SUBSTRING_INDEX(artist_name, ',', 1)
        ORDER BY best_track_rank ASC  
        LIMIT 10
    `, [userId, timeRange]);
    
    return artists;
}

exports.fetchTopTenAlbums = async (userId, timeRange) =>{
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
}

exports.fetchTopTenSongs = async (userId, timeRange) => {
    const [songs] = await db.query(`
      SELECT track_name, artist_name, image_url, rank_position FROM user_data WHERE user_id = ? AND time_range = ? ORDER BY rank_position ASC LIMIT 10
    `, [userId, timeRange]);

    return songs
}

//route to fetch the most and least popular song
exports.PopularSongs = async (userId, timeRange) => {
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
}

//route to get longes/shortest songs
exports.longestShortes = async (userId, timeRange) => {
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
}

//top by decade 2010s and 2020s
exports.topByDecade = async (userId, timeRange) => {
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
}

//route to fetch all artists
exports.topAllArtists = async (userId, timeRange) => {
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
      GROUP BY SUBSTRING_INDEX(artist_name, ',', 1)
      ORDER BY best_track_rank ASC  
      LIMIT 50
      `, [userId, timeRange]);

    return artists;
}

//route to fetch all songs
exports.topAllSongs = async (userId, timeRange) => {
    const [songs] = await db.query (`
      SELECT track_name, artist_name, image_url, rank_position, external_url FROM user_data WHERE user_id = ? AND time_range = ? ORDER BY rank_position ASC LIMIT 50
      `, [userId, timeRange])

    return songs;
}

//route to fetch all albums
exports.topAllAlbums = async (userId, timeRange) => {
    const [albums] = await db.query (`
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
      `, [userId, timeRange])

    return albums;
}

//route to get user's taste
exports.musicInsightArtists = async (userId) => {
    const [topArtist] = await db.query(`
      SELECT SUBSTRING_INDEX(artist_name, ',', 1) AS topArtist
      FROM user_data
      WHERE user_id = ? AND time_range = 'short_term'
      GROUP BY topArtist
      ORDER BY COUNT(*) DESC
      LIMIT 1;
    `, [userId]);

    return topArtist;
}
exports.musicInsightSongs = async (userId) => {
    const [topSong] = await db.query(`
      SELECT track_name AS topSong
      FROM user_data
      WHERE user_id = ? AND time_range = 'short_term'
      ORDER BY rank_position ASC
      LIMIT 1;
    `, [userId]);

    return topSong;
}

exports.musicInsightAlbums = async (userId) => {
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
}

exports.musicInsightUniqueArtists = async(userId) =>{
    const [uniqueArtists] = await db.query(`
      SELECT COUNT(DISTINCT artist_name) AS uniqueArtists
      FROM user_data
      WHERE user_id = ? AND time_range = 'medium_term'
    `, [userId]);

    return uniqueArtists;
}

exports.musicInsightavgPopularity = async(userId) => {
    const [avgPopularity] = await db.query(`
      SELECT AVG(popularity) AS avgPopularity
      FROM user_data
      WHERE user_id = ? AND time_range = 'short_term'
    `, [userId]);

    return avgPopularity;
}