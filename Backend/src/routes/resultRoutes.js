const express = require('express');
const router = express.Router();
const { recordResult, getClassResults, getStudentResults } = require('../controllers/resultController');
const authorize = require('../middlewares/roleMiddleware');

router.post('/', authorize('TEACHER'), recordResult);
router.get('/exam/:examId', authorize('TEACHER'), getClassResults);
router.get('/student/:studentId', authorize('TEACHER'), getStudentResults);

module.exports = router;
