const express = require('express');
const router = express.Router();

const authorize = require('../middlewares/roleMiddleware')

const { 
    createTeacher,
    getAllTeachers,
    getTeacherById,
    getCurrentTeacher,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

router.post('/', authorize('ADMIN'), createTeacher);
router.get('/', authorize('ADMIN'), getAllTeachers);
router.get('/me', getCurrentTeacher);
router.get('/:id', authorize('ADMIN'), getTeacherById);
router.patch('/:id', authorize('ADMIN'), updateTeacher);
router.delete('/:id', authorize('ADMIN'), deleteTeacher);

module.exports = router;