const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// route for user info to the dahsboard
router.get('/me', userController.getMe);

//route to get albums, songs and artists
router.get('/user-stats', userController.saveUserStats);

//dashboard overview - top 10 of each
router.get('/dashboard-overview', userController.dashboardOverview);

//route to fetch the most and least popular song
router.get('/most-least-pop', userController.mostLeastPop);

//route to get longes/shortest songs
router.get('/longest-shortest-song', userController.longestShortes);

//top by decade 2010s and 2020s
router.get('/top-by-decade', userController.topByDecade);

//route to fetch all artists
router.get('/top-all-artists', userController.topAllArtists);

//route to fetch all songs
router.get('/top-all-songs', userController.topAllSongs);

//route to fetch all albums
router.get('/top-all-albums', userController.topAllAlbums);

//route to get user's taste
router.get('/music-insight', userController.musicInsight);

//route to fetch top genres
router.get('/top-all-genres', userController.topAllGeneres);

//profile route to fetch email, password, verification and plan in future
router.get('/profile-info', userController.profileInfo);

//route to insert or update bio for user
router.post('/user-bio', userController.saveUserBio);

//route to fetch bio from db
router.get('/bio-get', userController.bioGet);

//route to insert and update country
router.post('/user-country', userController.userCountry);

//route to logout
router.post('/logout', userController.logout);

//route to delete account
router.post('/delete-account', userController.deleteAccount);

//route to add playlists to spotify
router.post('/create-playlist', userController.createPlaylist);

//route to verify account (generating token and sending email)
router.post('/send-verification-email', userController.sendVerificationEmail);
//route to verify the email
router.get('/verify-email', userController.verifyEmail);

module.exports = router;