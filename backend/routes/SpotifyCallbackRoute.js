const express = require('express');
const router = express.Router();
const spotifyController = require('../controller/SpotifyCallbackController');

router.post('/auth/spotify', spotifyController.handleAuth);

module.exports = router;