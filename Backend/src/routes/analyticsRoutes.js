const express = require('express');
const router = express.Router();
const { getAnalytics, getClassPerformance, getSubjectPerformance, getTeacherAnalytics } = require('../controllers/analyticsController');
const authorize = require('../middlewares/roleMiddleware');

router.get('/', authorize('ADMIN'), getAnalytics);
router.get('/class-performance', authorize('ADMIN'), getClassPerformance);
router.get('/subject-performance', authorize('ADMIN'), getSubjectPerformance);
router.get('/teacher', authorize('TEACHER','ADMIN'), getTeacherAnalytics);

module.exports = router;