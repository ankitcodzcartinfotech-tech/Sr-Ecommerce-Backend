const express = require('express');
const router = express.Router();
const questionController = require('../../controller/question.controller');

router.post('/:id/upvote', questionController.upvoteAnswer);

module.exports = router;
