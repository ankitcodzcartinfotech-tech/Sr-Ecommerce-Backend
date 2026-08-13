const STORY = require('../model/story.model');
const { getProfileImage } = require('../helper/image');

exports.createStory = async (req, res) => {
    try {
        const { title, subtitle, description, buttonText, buttonLink, position, isActive } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const storyData = {
            title: title.trim(),
            subtitle: subtitle?.trim(),
            description: description?.trim(),
            buttonText: buttonText?.trim(),
            buttonLink: buttonLink?.trim(),
            position: position !== undefined ? Number(position) : 0,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
        };

        let image = await getProfileImage(req, 'image', 'stories');
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }
        storyData.image = image;

        const story = await STORY.create(storyData);

        res.status(201).json({ success: true, message: 'Story created successfully', data: story });
    } catch (error) {
        console.error('Error in createStory:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getAllStories = async (req, res) => {
    try {
        const search = req.query.search || '';
        const query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const stories = await STORY.find(query).sort({ position: 1, createdAt: -1 });

        res.status(200).json({ success: true, message: 'Stories fetched successfully', data: stories });
    } catch (error) {
        console.error('Error in getAllStories:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getStoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'Story ID is required' });

        const story = await STORY.findById(id);
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        res.status(200).json({ success: true, message: 'Story fetched successfully', data: story });
    } catch (error) {
        console.error('Error in getStoryById:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateStory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'Story ID is required' });

        const story = await STORY.findById(id);
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        const { title, subtitle, description, buttonText, buttonLink, position, isActive } = req.body;
        const updateData = {};

        if (title !== undefined) {
            if (!title.trim()) return res.status(400).json({ success: false, message: 'Title cannot be empty' });
            updateData.title = title.trim();
        }

        if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() || '';
        if (description !== undefined) updateData.description = description?.trim() || '';
        if (buttonText !== undefined) updateData.buttonText = buttonText?.trim() || '';
        if (buttonLink !== undefined) updateData.buttonLink = buttonLink?.trim() || '';
        if (position !== undefined) updateData.position = Number(position);
        if (isActive !== undefined) updateData.isActive = (isActive === 'true' || isActive === true);

        const uploadedImage = await getProfileImage(req, 'image', 'stories');
        if (uploadedImage) {
            updateData.image = uploadedImage;
        }

        const updatedStory = await STORY.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });

        res.status(200).json({ success: true, message: 'Story updated successfully', data: updatedStory });
    } catch (error) {
        console.error('Error in updateStory:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteStory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: 'Story ID is required' });

        const story = await STORY.findById(id);
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        await STORY.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error in deleteStory:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateStoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'Story ID is required' });
        if (isActive === undefined) return res.status(400).json({ success: false, message: 'isActive field is required' });

        const story = await STORY.findById(id);
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        story.isActive = (isActive === 'true' || isActive === true);
        await story.save();

        res.status(200).json({ success: true, message: `Story ${story.isActive ? 'activated' : 'deactivated'} successfully`, data: story });
    } catch (error) {
        console.error('Error in updateStoryStatus:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getActiveStories = async (req, res) => {
    try {
        const stories = await STORY.find({ isActive: true }).sort({ position: 1 });
        res.status(200).json({ success: true, message: 'Active stories fetched successfully', data: stories });
    } catch (error) {
        console.error('Error in getActiveStories:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
