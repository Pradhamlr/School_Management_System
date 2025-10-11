const express = require('express');
const router = express.Router();
const { recordResult, getClassResults, getStudentResults } = require('../controllers/resultController');
const { authorizeAdmin, authorizeTeacher } = require('../middlewares/roleMiddleware');

router.post('/', authorizeTeacher, recordResult);
router.get('/exam/:examId', authorizeTeacher, getClassResults);
router.get('/student/:studentId', authorizeTeacher, getStudentResults);

module.exports = router;
