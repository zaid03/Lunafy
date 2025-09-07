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






module.exports = router;