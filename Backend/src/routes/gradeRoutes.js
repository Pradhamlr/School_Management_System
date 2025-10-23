const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleMiddleware');

const {
    getGrades,
    addGrade,
    getExams,
    getStudents,
    getClasses,
    getSubjects
} = require('../controllers/gradeController');

// Get grades with filters
router.get('/', authorize('ADMIN', 'TEACHER'), getGrades);

// Add grade
router.post('/', authorize('ADMIN', 'TEACHER'), addGrade);

// Get exams for dropdown
router.get('/exams', authorize('ADMIN', 'TEACHER'), getExams);

// Get students for dropdown
router.get('/students', authorize('ADMIN', 'TEACHER'), getStudents);

// Get classes for dropdown
router.get('/classes', authorize('ADMIN', 'TEACHER'), getClasses);

// Get subjects for dropdown
router.get('/subjects', authorize('ADMIN', 'TEACHER'), getSubjects);

module.exports = router;