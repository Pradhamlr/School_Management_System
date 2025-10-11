const express = require('express');
const router = express.Router();
const { createExam, getExams, getExamDetails } = require('../controllers/examController');
const authorize = require('../middlewares/roleMiddleware');

router.post('/', authorize('ADMIN'), createExam);
router.get('/', authorize('ADMIN'), getExams);
router.get('/:id', authorize('ADMIN'), getExamDetails);

module.exports = router;
