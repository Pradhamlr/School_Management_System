const { cloudinary } = require('../config/cloudinary');

/**
 * Upload file to Cloudinary
 * @param {Object} file - Multer file object
 * @returns {Object} Upload result with URL
 */
const uploadFile = async (file) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        return {
            success: true,
            url: file.path,
            publicId: file.filename,
            format: file.format,
            resourceType: file.resource_type
        };
    } catch (error) {
        throw new Error(`File upload failed: ${error.message}`);
    }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Object} Delete result
 */
const deleteFile = async (publicId) => {
    try {
        if (!publicId) {
            throw new Error('No public ID provided');
        }

        const result = await cloudinary.uploader.destroy(publicId);
        
        return {
            success: result.result === 'ok',
            message: result.result === 'ok' ? 'File deleted successfully' : 'File not found or already deleted'
        };
    } catch (error) {
        throw new Error(`File deletion failed: ${error.message}`);
    }
};

/**
 * Get file details from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Object} File details
 */
const getFileDetails = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        
        return {
            success: true,
            url: result.secure_url,
            format: result.format,
            bytes: result.bytes,
            createdAt: result.created_at
        };
    } catch (error) {
        throw new Error(`Failed to get file details: ${error.message}`);
    }
};

module.exports = {
    uploadFile,
    deleteFile,
    getFileDetails
};
