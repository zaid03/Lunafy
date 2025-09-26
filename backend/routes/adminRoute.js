const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

//login route
router.post('/login', adminController.checkAdmin);

//dashboard route
router.get('/general', adminController.getDashboardInfo);

//users route
router.get('/users', adminController.getUsers);

//logs route
router.get('/logs', adminController.getUserLog);

//details route
router.get('/details', adminController.getUserActivation);

//deletion route
router.post('/activation', adminController.userAccountActivationControl);

//admin list route
router.get('/admins', adminController.getAdminList);

module.exports = router