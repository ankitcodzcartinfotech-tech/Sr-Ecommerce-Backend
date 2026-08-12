const express = require('express');
const router = express.Router();
const bannerController = require('../../controller/banner.controller');
const { upload } = require('../../helper/upload');

// Accept both desktopImage (required) and mobileImage (optional)
router.post('/', upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 },
    { name: 'image', maxCount: 1 } // Legacy support for single image upload
]), bannerController.createBanner);

router.get('/', bannerController.getAllBanners);

router.get('/:id', bannerController.getBannerById);

router.put('/:id', upload.fields([
    { name: 'desktopImage', maxCount: 1 },
    { name: 'mobileImage', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), bannerController.updateBanner);

router.delete('/:id', bannerController.deleteBanner);

router.patch('/:id/status', bannerController.updateBannerStatus);

module.exports = router;
