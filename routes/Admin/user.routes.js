const express = require('express');
const router = express.Router();
const userController = require('../../controller/user.controller');
const { upload } = require('../../helper/upload');

router.post('/', upload.single('profileImage'), userController.addUser);
router.get('/', userController.getUsers);
router.get('/login-tracking/list', userController.getLoginTracking);
router.get('/:id', userController.getUser);
router.put('/:id', upload.single('profileImage'), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
