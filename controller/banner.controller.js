const BANNER = require('../model/banner.model');
const { getProfileImage } = require('../helper/image');

exports.createBanner = async (req, res) => {
    try {
        const { title, subtitle, buttonText, buttonLink, position, isActive, startDate, endDate } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title is required' 
            });
        }

        const bannerData = {
            title: title.trim(),
            subtitle: subtitle?.trim(),
            buttonText: buttonText?.trim(),
            buttonLink: buttonLink?.trim(),
            position: position !== undefined ? Number(position) : 0,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
        };

        if (startDate) {
            bannerData.startDate = new Date(startDate);
        }

        if (endDate) {
            bannerData.endDate = new Date(endDate);
        }

        // Get desktop banner (required)
        let desktopImage = await getProfileImage(req, 'desktopImage', 'banners');
        if (!desktopImage) {
            desktopImage = await getProfileImage(req, 'image', 'banners');
        }
        
        if (!desktopImage) {
            return res.status(400).json({ 
                success: false, 
                message: 'Desktop Banner is required' 
            });
        }
        bannerData.desktopImage = desktopImage;
        bannerData.image = desktopImage;

        // Get mobile banner (optional)
        const mobileImage = await getProfileImage(req, 'mobileImage', 'banners');
        if (mobileImage) {
            bannerData.mobileImage = mobileImage;
        }

        const banner = await BANNER.create(bannerData);

        res.status(201).json({ 
            success: true, 
            message: 'Banner created successfully', 
            data: banner 
        });
    } catch (error) {
        console.error('Error in createBanner:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.getAllBanners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        if (page < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Page number must be greater than 0' 
            });
        }

        if (limit < 1 || limit > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Limit must be between 1 and 100' 
            });
        }

        const skip = (page - 1) * limit;

        const query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const total = await BANNER.countDocuments(query);

        const banners = await BANNER.find(query)
            .sort({ position: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({ 
            success: true, 
            message: 'Banners fetched successfully',
            data: banners,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getAllBanners:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.getBannerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Banner ID is required' 
            });
        }

        const banner = await BANNER.findById(id);

        if (!banner) {
            return res.status(404).json({ 
                success: false, 
                message: 'Banner not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Banner fetched successfully', 
            data: banner 
        });
    } catch (error) {
        console.error('Error in getBannerById:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Banner ID is required' 
            });
        }

        const banner = await BANNER.findById(id);

        if (!banner) {
            return res.status(404).json({ 
                success: false, 
                message: 'Banner not found' 
            });
        }

        const { title, subtitle, buttonText, buttonLink, position, isActive, startDate, endDate } = req.body;

        const updateData = {};

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Title cannot be empty' 
                });
            }
            updateData.title = title.trim();
        }

        if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() || '';
        if (buttonText !== undefined) updateData.buttonText = buttonText?.trim() || '';
        if (buttonLink !== undefined) updateData.buttonLink = buttonLink?.trim() || '';
        if (position !== undefined) updateData.position = Number(position);
        if (isActive !== undefined) updateData.isActive = (isActive === 'true' || isActive === true);

        if (startDate !== undefined) {
            updateData.startDate = startDate ? new Date(startDate) : null;
        }

        if (endDate !== undefined) {
            updateData.endDate = endDate ? new Date(endDate) : null;
        }

        // Update desktop image if provided (supports both desktopImage and image fields)
        const uploadedDesktopImage = await getProfileImage(req, 'desktopImage', 'banners');
        if (uploadedDesktopImage) {
            updateData.desktopImage = uploadedDesktopImage;
            updateData.image = uploadedDesktopImage;
        } else {
            const uploadedLegacyImage = await getProfileImage(req, 'image', 'banners');
            if (uploadedLegacyImage) {
                updateData.desktopImage = uploadedLegacyImage;
                updateData.image = uploadedLegacyImage;
            }
        }

        // Update mobile image if provided
        const uploadedMobileImage = await getProfileImage(req, 'mobileImage', 'banners');
        if (uploadedMobileImage) {
            updateData.mobileImage = uploadedMobileImage;
        }

        const updatedBanner = await BANNER.findByIdAndUpdate(
            id, 
            updateData, 
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Banner updated successfully', 
            data: updatedBanner 
        });
    } catch (error) {
        console.error('Error in updateBanner:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Banner ID is required' 
            });
        }

        const banner = await BANNER.findById(id);

        if (!banner) {
            return res.status(404).json({ 
                success: false, 
                message: 'Banner not found' 
            });
        }

        await BANNER.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: 'Banner deleted successfully' 
        });
    } catch (error) {
        console.error('Error in deleteBanner:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.updateBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Banner ID is required' 
            });
        }

        if (isActive === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'isActive field is required' 
            });
        }

        const banner = await BANNER.findById(id);

        if (!banner) {
            return res.status(404).json({ 
                success: false, 
                message: 'Banner not found' 
            });
        }

        banner.isActive = (isActive === 'true' || isActive === true);
        await banner.save();

        res.status(200).json({ 
            success: true, 
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`, 
            data: banner 
        });
    } catch (error) {
        console.error('Error in updateBannerStatus:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.getActiveBanners = async (req, res) => {
    try {
        const now = new Date();
        const currentDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const banners = await BANNER.find({
            isActive: true,
            $and: [
                {
                    $or: [
                        { startDate: { $exists: false } },
                        { startDate: null },
                        { startDate: { $lte: currentDate } }
                    ]
                },
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: currentDate } }
                    ]
                }
            ]
        })
        .sort({ position: 1 });

        const filteredBanners = banners.filter(banner => {
            if (!banner.startDate && !banner.endDate) return true;
            
            if (banner.startDate && banner.endDate) {
                return currentDate >= banner.startDate && currentDate <= banner.endDate;
            }
            
            if (banner.startDate) {
                return currentDate >= banner.startDate;
            }
            
            if (banner.endDate) {
                return currentDate <= banner.endDate;
            }
            
            return true;
        });

        res.status(200).json({ 
            success: true, 
            message: 'Active banners fetched successfully', 
            data: filteredBanners 
        });
    } catch (error) {
        console.error('Error in getActiveBanners:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
