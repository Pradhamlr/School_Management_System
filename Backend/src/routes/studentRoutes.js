const express = require('express');
const router = express.Router();

const authorize = require('../middlewares/roleMiddleware')

const { 
    createStudent,
    getAllStudents,
    getStudentById,
    getCurrentStudent,
    debugCurrentStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

router.post('/', authorize('ADMIN'), createStudent);
router.get('/', authorize('ADMIN'), getAllStudents);         
router.get('/me', getCurrentStudent);      
router.get('/me-debug', debugCurrentStudent);
router.get('/:id', authorize('ADMIN'), getStudentById); 
router.patch('/:id', authorize('ADMIN'), updateStudent);        
router.delete('/:id', authorize('ADMIN'), deleteStudent); 

module.exports = router;