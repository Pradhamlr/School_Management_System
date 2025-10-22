const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleMiddleware');
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');

// Create event: allow ADMIN, TEACHER, STUDENT (example)
router.post('/', authorize('ADMIN', 'TEACHER', 'STUDENT'), createEvent);

// Read events (public)
router.get('/', getEvents);
router.get('/:id', getEventById);

// Update event: ADMIN or TEACHER (more checks happen in controller)
router.put('/:id', authorize('ADMIN', 'TEACHER'), updateEvent);

// Delete event: ADMIN only (adjust as needed)
router.delete('/:id', authorize('ADMIN'), deleteEvent);

module.exports = router;