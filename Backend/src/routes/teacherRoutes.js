const express = require('express');
const router = express.Router();

const authorizeAdmin = require('../middlewares/roleMiddleware')

const { 
    createTeacher,
    getAllTeachers,
    getTeacherById,
    getCurrentTeacher,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

router.post('/', authorizeAdmin, createTeacher);
router.get('/', authorizeAdmin, getAllTeachers);
router.get('/me', getCurrentTeacher);
router.get('/:id', authorizeAdmin, getTeacherById);
router.patch('/:id', authorizeAdmin, updateTeacher);
router.delete('/:id', authorizeAdmin, deleteTeacher);

module.exports = router;