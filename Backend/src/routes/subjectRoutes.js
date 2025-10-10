const express = require('express');
const router = express.Router();

const { authorizeAdmin, authorizeTeacher } = require('../middlewares/roleMiddleware');
const { createSubject, getSubjects, updateSubject, deleteSubject, assignTeacherToSubject, getTeacherAssignments, getClassSubjects } = require('../controllers/subjectControllers');

router.post('/', authorizeAdmin, createSubject);
router.get('/', getSubjects);
router.put('/:id', authorizeAdmin, updateSubject);
router.delete('/:id', authorizeAdmin, deleteSubject);
router.post('/assign', assignTeacherToSubject);
router.get('/teacher/assignments', authorizeTeacher, getTeacherAssignments);
router.get('/class/:classId/subjects', getClassSubjects);

module.exports = router;
