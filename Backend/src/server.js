// ==========================================
// DEPENDENCIES & IMPORTS
// ==========================================
const express = require('express');
require('express-async-errors');
require('dotenv').config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE IMPORTS
// ==========================================
const cors = require('cors');

// Custom middleware
const errorHandlerMiddleware = require('./middlewares/errorHandler');
const notFoundMiddleware = require('./middlewares/notFound');
const authMiddleware = require('./middlewares/authMiddleware');

// ==========================================
// ROUTE IMPORTS
// ==========================================
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');

// ==========================================
// MIDDLEWARE SETUP
// ==========================================
// Enable CORS for all routes
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// ROUTES
// ==========================================
// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'School Management System API is running!',
    version: '1.0.0'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/teachers', authMiddleware, teacherRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/classes', authMiddleware, classRoutes);
app.use('/api/subjects', authMiddleware, subjectRoutes);
app.use('/api/exams', authMiddleware, examRoutes);
app.use('/api/results', authMiddleware, resultRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================
// 404 handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorHandlerMiddleware);

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});