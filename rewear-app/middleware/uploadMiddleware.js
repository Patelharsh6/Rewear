const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Check for Cloudinary environment variables to provide a better error message
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("!!! CLOUDINARY CONFIGURATION ERROR !!!");
    console.error("Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set correctly in your .env file.");
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Ensures https URLs
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rewear_items', // A folder name in your Cloudinary account
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
        transformation: [{ width: 800, height: 1000, crop: 'limit' }]
    }
});

// Initialize Multer with the storage engine
const upload = multer({ storage: storage });

module.exports = upload;
