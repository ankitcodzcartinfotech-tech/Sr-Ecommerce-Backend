const express = require('express');
const router = express.Router();
const questionController = require('../../controller/question.controller');

router.post('/:id/answers', questionController.answerQuestion);

module.exports = router;
