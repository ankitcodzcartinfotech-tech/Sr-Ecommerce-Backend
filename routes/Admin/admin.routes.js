const express = require('express');
const router = express.Router();
const adminController = require('../../controller/admin.controller');
const { adminVerifyToken } = require('../../helper/admin.verifyToken');
const { upload } = require('../../helper/upload');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.get('/profile', adminVerifyToken, adminController.get);
router.put('/profile', adminVerifyToken, upload.single('image'), adminController.update);

module.exports = router;
