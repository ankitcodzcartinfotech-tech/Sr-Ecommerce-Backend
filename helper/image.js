const { uploadToCloudinary, uploadMultipleToCloudinary } = require('./upload');

const getProfileImage = async (req, fieldName = 'profileImage', folder = 'Sr Software ') => {
    // If we have a file in req.file
    if (req.file && req.file.fieldname === fieldName) {
        try {
            return await uploadToCloudinary(req.file.buffer, folder);
        } catch (error) {
            console.error(`Error uploading ${fieldName}:`, error);
            return null;
        }
    }

    // If we have files in req.files
    if (req.files && req.files[fieldName] && req.files[fieldName][0]) {
        try {
            return await uploadToCloudinary(req.files[fieldName][0].buffer, folder);
        } catch (error) {
            console.error(`Error uploading ${fieldName}:`, error);
            return null;
        }
    }

    if (req.body.generalDetails) {
        let genDetails = req.body.generalDetails;
        if (typeof genDetails === 'string') {
            try { genDetails = JSON.parse(genDetails); } catch (e) { }
        }
        if (genDetails && genDetails[fieldName]) {
            // If it's already a URL, keep it as is
            return genDetails[fieldName];
        }
    }

    // If existing value is a URL, keep it as is
    const existingVal = req.body[fieldName];
    return existingVal;
};
const getMultipleImages = async (req, fieldName = 'images', folder = 'Sr Software ') => {
    let newImages = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
            newImages = await uploadMultipleToCloudinary(req.files, folder);
        } catch (error) {
            console.error(`Error uploading ${fieldName}:`, error);
        }
    } else if (req.files && req.files[fieldName] && req.files[fieldName].length > 0) {
        try {
            newImages = await uploadMultipleToCloudinary(req.files[fieldName], folder);
        } catch (error) {
            console.error(`Error uploading ${fieldName}:`, error);
        }
    }

    let existingImages = req.body[fieldName] || [];
    if (typeof existingImages === 'string') {
        try {
            existingImages = JSON.parse(existingImages);
        } catch (e) {
            existingImages = [existingImages];
        }
    }

    // Ensure existingImages is always an array
    if (!Array.isArray(existingImages)) {
        existingImages = [existingImages];
    }

    // Filter out any empty strings
    existingImages = existingImages.filter(img => img && img.trim() !== "");

    return [...existingImages, ...newImages];
};

module.exports = {
    getProfileImage,
    getMultipleImages
};
