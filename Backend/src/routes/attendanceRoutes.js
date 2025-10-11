// Express routes: Attendance
const express = require('express');
const router = express.Router();
const { getAttendanceStats, getAllStudentsAttendanceToday, getAllTeachersAttendanceToday, markTeacherAttendance, getStudentAttendance, markStudentAttendance, getTeacherAttendance} = require('../controllers/attendanceController');
const authorize = require('../middlewares/roleMiddleware');

// Get attendance statistics for dashboard
router.get('/stats', getAttendanceStats);

// Get all students with today's attendance
router.get('/students/today', getAllStudentsAttendanceToday);

// Get all teachers with today's attendance
router.get('/teachers/today', authorize('ADMIN'), getAllTeachersAttendanceToday);

// Student attendance routes
router.post('/students', authorize('TEACHER'), markStudentAttendance);
router.get('/students/:studentId', getStudentAttendance);

// Teacher attendance routes
router.post('/teachers', authorize('ADMIN'), markTeacherAttendance);
router.get('/teachers/:teacherId', getTeacherAttendance);

module.exports = router;
