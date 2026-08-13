const express = require('express');
const router = express.Router();
const storyController = require('../../controller/story.controller');
const { upload } = require('../../helper/upload');

router.post('/', upload.fields([
    { name: 'image', maxCount: 1 }
]), storyController.createStory);

router.get('/', storyController.getAllStories);

router.get('/:id', storyController.getStoryById);

router.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 }
]), storyController.updateStory);

router.delete('/:id', storyController.deleteStory);

router.patch('/:id/status', storyController.updateStoryStatus);

module.exports = router;
