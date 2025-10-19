// Express routes: Assignment
const express = require('express');
const router = express.Router();
const {
    // Assignment Controllers
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    getStudentAssignments,
    
    // Submission Controllers
    submitAssignment,
    submitAssignmentWithFile,
    getSubmissions,
    getSubmissionById,
    gradeSubmission,
    updateSubmission,
    deleteSubmission,
    getAssignmentStats
} = require('../controllers/assignmentController');
const { uploadAssignmentFile, deleteAssignmentFile } = require('../controllers/fileUploadController');
const { uploadAssignment } = require('../config/cloudinary');
const authorize = require('../middlewares/roleMiddleware');

// ========== ASSIGNMENT ROUTES ==========

// Create a new assignment (Teachers and Admins only)
router.post('/', authorize('ADMIN', 'TEACHER'), createAssignment);

// Get all assignments with optional filters
router.get('/', authorize('ADMIN', 'TEACHER'), getAssignments);

// Get assignments for a specific student
router.get('/student/:studentId', authorize('ADMIN', 'TEACHER', 'STUDENT'), getStudentAssignments);

// Get assignment statistics
router.get('/:assignmentId/stats', authorize('ADMIN', 'TEACHER'), getAssignmentStats);
// ========== SUBMISSION ROUTES ==========

// Upload file endpoint (for direct file upload)
router.post('/upload', authorize('ADMIN', 'STUDENT'), uploadAssignment.single('file'), uploadAssignmentFile);

// Submit an assignment (Students) - JSON only
router.post('/submissions', authorize('ADMIN', 'STUDENT'), submitAssignment);

// Submit an assignment with file (Students) - Multipart form data
router.post('/submissions/with-file', authorize('ADMIN', 'STUDENT'), uploadAssignment.single('file'), submitAssignmentWithFile);

// Delete uploaded file
router.delete('/upload', authorize('ADMIN', 'STUDENT', 'TEACHER'), deleteAssignmentFile);

// Get all submissions with optional filters
router.get('/submissions', authorize('ADMIN', 'TEACHER'), getSubmissions);

// Get submission by ID
router.get('/submissions/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getSubmissionById);

// Grade a submission (Teachers and Admins only)
router.put('/submissions/:id/grade', authorize('ADMIN', 'TEACHER'), gradeSubmission);

// Update submission (Students - for resubmission)
router.put('/submissions/:id', authorize('ADMIN', 'STUDENT'), updateSubmission);

// Delete submission
router.delete('/submissions/:id', authorize('ADMIN', 'TEACHER'), deleteSubmission);

// Get assignment by ID
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getAssignmentById);

// Update assignment
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateAssignment);

// Delete assignment
router.delete('/:id', authorize('ADMIN', 'TEACHER'), deleteAssignment);

module.exports = router;