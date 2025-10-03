// Express routes: Attendance
const express = require('express');
const router = express.Router();
const { getAttendanceStats, getAllStudentsAttendanceToday, getAllTeachersAttendanceToday, markTeacherAttendance, getStudentAttendance, markStudentAttendance, getTeacherAttendance} = require('../controllers/attendanceController');

// Get attendance statistics for dashboard
router.get('/stats', getAttendanceStats);

// Get all students with today's attendance
router.get('/students/today', getAllStudentsAttendanceToday);

// Get all teachers with today's attendance
router.get('/teachers/today', getAllTeachersAttendanceToday);

// Student attendance routes
router.post('/students', markStudentAttendance);
router.get('/students/:studentId', getStudentAttendance);

// Teacher attendance routes
router.post('/teachers', markTeacherAttendance);
router.get('/teachers/:teacherId', getTeacherAttendance);

module.exports = router;
