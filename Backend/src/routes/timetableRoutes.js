const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/roleMiddleware');
const { createTimetable, getTimetables, getTimetableById, updateTimetable, deleteTimetable } = require('../controllers/timetableController');

// Create timetable: ADMIN or TEACHER
router.post('/', authorize('ADMIN','TEACHER'), createTimetable);

// Read
router.get('/', getTimetables);
router.get('/:id', getTimetableById);

// Update
router.put('/:id', authorize('ADMIN','TEACHER'), updateTimetable);

// Delete
router.delete('/:id', authorize('ADMIN'), deleteTimetable);

module.exports = router;
// Express routes: Timetable
