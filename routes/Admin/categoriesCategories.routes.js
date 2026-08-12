const express = require('express');
const router = express.Router();
const categoriesController = require('../../controller/categories.controller');
const { upload } = require('../../helper/upload');

router.post('/', upload.single('categoryLogo'), categoriesController.addCategory);
router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategory);
router.put('/:id', upload.single('categoryLogo'), categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
