const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleMiddleware');
const { createNotification, getNotifications, getNotificationById, deleteNotification } = require('../controllers/notificationController');

router.post('/', authorize('ADMIN'), createNotification); // only ADMIN can create
router.get('/', getNotifications);
router.get('/:id', getNotificationById);
router.delete('/:id', authorize('ADMIN'), deleteNotification);

module.exports = router;
