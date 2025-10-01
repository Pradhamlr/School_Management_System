const express = require('express');
const router = express.Router();

const { authorizeAdmin } = require('../middlewares/roleMiddleware')

const { 
    createStudent,
    getAllStudents,
    getStudentById,
    getCurrentStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');

router.post('/', authorizeAdmin, createStudent);
router.get('/', authorizeAdmin, getAllStudents);          
router.get('/me', getCurrentStudent);      
router.get('/:id', authorizeAdmin, getStudentById); 
router.patch('/:id', authorizeAdmin, updateStudent);        
router.delete('/:id', authorizeAdmin, deleteStudent); 

module.exports = router;