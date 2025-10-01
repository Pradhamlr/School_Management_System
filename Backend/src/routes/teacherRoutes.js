const express = require('express');
const router = express.Router();

const { 
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

router.post('/', createTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.patch('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;