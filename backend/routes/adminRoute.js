const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

//login route
router.post('/login', adminController.checkAdmin);

//dashboard route
router.get('/general', adminController.getDashboardInfo);

//users route
router.get('/users', adminController.getUsers);


module.exports = router