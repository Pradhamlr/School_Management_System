const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for assignments
const assignmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'school_management/assignments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt', 'zip'],
        resource_type: 'auto',
        public_id: (req, file) => {
            const studentId = req.body.studentId || 'unknown';
            const assignmentId = req.body.assignmentId || 'unknown';
            const timestamp = Date.now();
            return `assignment_${assignmentId}_student_${studentId}_${timestamp}`;
        }
    }
});

// Create multer upload middleware
const uploadAssignment = multer({
    storage: assignmentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/zip',
            'application/x-zip-compressed'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, PDF, DOC, DOCX, TXT, and ZIP files are allowed.'));
        }
    }
});

module.exports = {
    cloudinary,
    uploadAssignment
};
