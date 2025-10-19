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
    getSubmissions,
    getSubmissionById,
    gradeSubmission,
    updateSubmission,
    deleteSubmission,
    getAssignmentStats
} = require('../controllers/assignmentController');
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

// Get assignment by ID
router.get('/:id', authorize('ADMIN', 'TEACHER', 'STUDENT'), getAssignmentById);

// Update assignment
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateAssignment);

// Delete assignment
router.delete('/:id', authorize('ADMIN', 'TEACHER'), deleteAssignment);

// ========== SUBMISSION ROUTES ==========

// Submit an assignment (Students)
router.post('/submissions', authorize('ADMIN', 'STUDENT'), submitAssignment);

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

module.exports = router;
