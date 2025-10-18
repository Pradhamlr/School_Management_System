const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const authorize = require('../middlewares/roleMiddleware');

router.get('/', authorize('ADMIN'), getAnalytics);

module.exports = router;