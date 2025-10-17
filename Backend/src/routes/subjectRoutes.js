const express = require('express');
const router = express.Router();

const authorize = require('../middlewares/roleMiddleware');
const { createSubject, getSubjects, updateSubject, deleteSubject, assignTeacherToSubject, getTeacherAssignments, getClassSubjects } = require('../controllers/subjectControllers');

router.post('/', authorize('ADMIN'), createSubject);
router.get('/', getSubjects);
router.put('/:id', authorize('ADMIN'), updateSubject);
router.delete('/:id', authorize('ADMIN'), deleteSubject);
router.post('/assign', assignTeacherToSubject);
router.get('/teacher/assignments', authorize('TEACHER'), getTeacherAssignments);
router.get('/class/:classId/subjects', getClassSubjects);

module.exports = router;
