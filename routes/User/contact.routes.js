const express = require('express');
const router = express.Router();
const contactController = require('../../controller/User/contact.controller');

router.post('/submit', contactController.submitContact);

module.exports = router;