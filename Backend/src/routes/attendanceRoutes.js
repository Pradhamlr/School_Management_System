// Express routes: Attendance
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Get attendance statistics for dashboard
router.get('/stats', attendanceController.getAttendanceStats);

// Get all students with today's attendance
router.get('/students/today', attendanceController.getAllStudentsAttendanceToday);

// Get all teachers with today's attendance  
router.get('/teachers/today', attendanceController.getAllTeachersAttendanceToday);

// Student attendance routes
router.post('/students', attendanceController.markStudentAttendance);
router.get('/students/:studentId', attendanceController.getStudentAttendance);

// Teacher attendance routes
router.post('/teachers', attendanceController.markTeacherAttendance);
router.get('/teachers/:teacherId', attendanceController.getTeacherAttendance);

module.exports = router;
