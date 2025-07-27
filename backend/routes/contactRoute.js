const express = require('express');
const router = express.Router();
const registerMessage = require('../controller/contactConroller');

const rateLimit = require('express-rate-limit');
const contactLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'too many messages sent, try again later'
})

router.post('/data', contactLimit, registerMessage);

module.exports = router;