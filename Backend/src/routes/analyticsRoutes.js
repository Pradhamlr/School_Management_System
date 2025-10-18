const express = require('express');
const router = express.Router();
const { getAnalytics, getClassPerformance, getSubjectPerformance } = require('../controllers/analyticsController');
const authorize = require('../middlewares/roleMiddleware');

router.get('/', authorize('ADMIN'), getAnalytics);
router.get('/class-performance', authorize('ADMIN'), getClassPerformance);
router.get('/subject-performance', authorize('ADMIN'), getSubjectPerformance);

module.exports = router;