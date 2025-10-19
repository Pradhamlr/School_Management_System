const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/badRequest');
const { uploadFile, deleteFile } = require('../services/fileUploadService');

/**
 * Upload assignment file
 * This is used when submitting assignments
 */
const uploadAssignmentFile = async (req, res) => {
    if (!req.file) {
        throw new BadRequestError('No file uploaded');
    }

    const fileData = await uploadFile(req.file);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
            url: fileData.url,
            publicId: fileData.publicId,
            format: fileData.format
        }
    });
};

/**
 * Delete assignment file
 */
const deleteAssignmentFile = async (req, res) => {
    const { publicId } = req.body;

    if (!publicId) {
        throw new BadRequestError('Public ID is required');
    }

    const result = await deleteFile(publicId);

    res.status(StatusCodes.OK).json({
        success: result.success,
        message: result.message
    });
};

module.exports = {
    uploadAssignmentFile,
    deleteAssignmentFile
};
