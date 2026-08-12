const express = require('express');
const router = express.Router();
const searchHistoryController = require('../../controller/searchHistory.controller');

const { userVerifyToken } = require('../../helper/user.verifyToken');

// Trending and suggestions don't require authentication
router.get('/trending', searchHistoryController.getTrendingSearches);
router.get('/suggestions', searchHistoryController.getSuggestions);

// User specific search history routes (protected)
router.post('/', userVerifyToken, searchHistoryController.saveSearch);
router.get('/', userVerifyToken, searchHistoryController.getRecentSearches);
router.delete('/', userVerifyToken, searchHistoryController.clearSearchHistory);
router.delete('/:id', userVerifyToken, searchHistoryController.deleteSearchItem);

module.exports = router;
