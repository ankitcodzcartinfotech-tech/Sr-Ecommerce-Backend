const express = require('express');
const router = express.Router();
const categoryController = require('../../controller/categories.controller');

// Public routes - no authentication required
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

module.exports = router;
