const multer = require('multer');
const cloudinary = require('./cloudinary');

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({ storage });

// Function to upload single file to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder = "Sr Software ") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Function to upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (files, folder = "Sr Software ") => {
  if (!files || files.length === 0) {
    return [];
  }
  const uploadPromises = files.map(file => uploadToCloudinary(file.buffer, folder));
  return Promise.all(uploadPromises);
};

module.exports = { upload, uploadToCloudinary, uploadMultipleToCloudinary };

