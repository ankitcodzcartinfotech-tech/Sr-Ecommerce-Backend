const express = require('express');
const router = express.Router();
const bannerController = require('../../controller/banner.controller');

router.get('/', bannerController.getActiveBanners);

module.exports = router;
