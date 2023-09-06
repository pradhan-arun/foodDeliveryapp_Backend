const express = require('express');
const UserController = require('../Controller/UserController');
const router = express.Router();

router.post('/create', UserController.create);
router.post('/login/user',UserController.login);
router.get('/user/search/:params', UserController.searchUser);
router.get('/', UserController.findAll);
router.patch('/user/:id',UserController.updateData);
router.post('/user/avatar',UserController.uploadAvatar);
router.post('/login/otp',UserController.otpGenerate);


module.exports = router;