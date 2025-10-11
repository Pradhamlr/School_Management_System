const express = require('express');
const router = express.Router();
const { createExam, getExams, getExamDetails } = require('../controllers/examController');
const { authorizeAdmin, authorizeTeacher } = require('../middlewares/roleMiddleware');

router.post('/', authorizeAdmin, createExam);
router.get('/', authorizeAdmin, getExams);
router.get('/:id', authorizeAdmin, getExamDetails);

module.exports = router;
