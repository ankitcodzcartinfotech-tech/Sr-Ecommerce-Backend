const express = require('express');
const router = express.Router();
const storyController = require('../../controller/story.controller');

router.get('/', storyController.getActiveStories);

module.exports = router;
