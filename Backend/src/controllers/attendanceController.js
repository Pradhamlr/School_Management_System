// Business logic: Attendance
const prisma = require('../config/db');
const { CustomAPIError } = require('../errors/customError');
const { sendResponse } = require('../utils/response');

const attendanceController = {
  // Get attendance statistics for dashboard - Simplified version
  getAttendanceStats: async (req, res) => {
    try {
      // Get today's date for stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get basic student stats for today
      const totalStudents = await prisma.student.count();
      const presentStudents = await prisma.studentAttendance.count({
        where: {
          date: today,
          status: 'PRESENT'
        }
      });
      
      // Get basic teacher stats for today  
      const totalTeachers = await prisma.teacher.count();
      const presentTeachers = await prisma.teacherAttendance.count({
        where: {
          date: today,
          status: 'PRESENT'
        }
      });

      // Calculate percentages
      const studentAttendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
      const teacherAttendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;

      // Simple performance stats (just use present/absent for now)
      const absentStudents = totalStudents - presentStudents;
      const absentTeachers = totalTeachers - presentTeachers;

      const data = {
        students: [
          { name: "Present", value: presentStudents, color: "#6366F1" },
          { name: "Absent", value: absentStudents, color: "#EF4444" }
        ],
        teachers: [
          { name: "Present", value: presentTeachers, color: "#EC4899" },
          { name: "Absent", value: absentTeachers, color: "#EF4444" }
        ],
        performance: [
          { name: "Good Attendance", value: presentStudents, color: "#10B981" },
          { name: "Poor Attendance", value: absentStudents, color: "#EF4444" },
          { name: "Total Students", value: totalStudents, color: "#6366F1" },
          { name: "Total Teachers", value: totalTeachers, color: "#EC4899" }
        ],
        summary: {
          totalStudents,
          presentStudents,
          studentAttendanceRate,
          totalTeachers,
          presentTeachers,
          teacherAttendanceRate
        }
      };

      sendResponse(res, 200, true, 'Attendance statistics fetched successfully', data);
    } catch (error) {
      console.error('Get attendance stats error:', error);
      throw new CustomAPIError('Failed to fetch attendance statistics', 500);
    }
  },

  // Mark student attendance
  markStudentAttendance: async (req, res) => {
    try {
      const { studentId, date, status, remarks } = req.body;
      
      if (!studentId || !date || !status) {
        throw new CustomAPIError('Student ID, date, and status are required', 400);
      }

      // Validate status
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      if (!validStatuses.includes(status)) {
        throw new CustomAPIError('Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED', 400);
      }

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
        include: { user: true }
      });

      if (!student) {
        throw new CustomAPIError('Student not found', 404);
      }

      // Parse date
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Use upsert to handle existing attendance
      const attendance = await prisma.studentAttendance.upsert({
        where: {
          studentId_date: {
            studentId: parseInt(studentId),
            date: attendanceDate
          }
        },
        update: {
          status,
          remarks
        },
        create: {
          studentId: parseInt(studentId),
          date: attendanceDate,
          status,
          remarks
        },
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      sendResponse(res, 201, true, 'Student attendance marked successfully', {
        attendance,
        message: `Attendance marked as ${status} for ${student.user.name}`
      });
    } catch (error) {
      console.error('Mark student attendance error:', error);
      if (error instanceof CustomAPIError) {
        throw error;
      }
      throw new CustomAPIError('Failed to mark student attendance', 500);
    }
  },

  // Mark teacher attendance
  markTeacherAttendance: async (req, res) => {
    try {
      const { teacherId, date, status, remarks } = req.body;
      
      if (!teacherId || !date || !status) {
        throw new CustomAPIError('Teacher ID, date, and status are required', 400);
      }

      // Validate status
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      if (!validStatuses.includes(status)) {
        throw new CustomAPIError('Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED', 400);
      }

      // Check if teacher exists
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId) },
        include: { user: true }
      });

      if (!teacher) {
        throw new CustomAPIError('Teacher not found', 404);
      }

      // Parse date
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Use upsert to handle existing attendance
      const attendance = await prisma.teacherAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId: parseInt(teacherId),
            date: attendanceDate
          }
        },
        update: {
          status,
          remarks
        },
        create: {
          teacherId: parseInt(teacherId),
          date: attendanceDate,
          status,
          remarks
        },
        include: {
          teacher: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      });

      sendResponse(res, 201, true, 'Teacher attendance marked successfully', {
        attendance,
        message: `Attendance marked as ${status} for ${teacher.user.name}`
      });
    } catch (error) {
      console.error('Mark teacher attendance error:', error);
      if (error instanceof CustomAPIError) {
        throw error;
      }
      throw new CustomAPIError('Failed to mark teacher attendance', 500);
    }
  },

  // Get attendance by student ID
  getStudentAttendance: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { startDate, endDate, page = 1, limit = 10 } = req.query;

      if (!studentId) {
        throw new CustomAPIError('Student ID is required', 400);
      }

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id: parseInt(studentId) },
        include: { user: { select: { name: true, email: true } } }
      });

      if (!student) {
        throw new CustomAPIError('Student not found', 404);
      }

      // Build date filter
      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }

      // Get attendance records with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const attendance = await prisma.studentAttendance.findMany({
        where: {
          studentId: parseInt(studentId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: parseInt(limit)
      });

      // Get total count for pagination
      const totalCount = await prisma.studentAttendance.count({
        where: {
          studentId: parseInt(studentId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        }
      });

      // Calculate statistics
      const stats = await prisma.studentAttendance.groupBy({
        by: ['status'],
        where: {
          studentId: parseInt(studentId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        _count: {
          status: true
        }
      });

      const statistics = {
        total: totalCount,
        present: stats.find(s => s.status === 'PRESENT')?._count.status || 0,
        absent: stats.find(s => s.status === 'ABSENT')?._count.status || 0,
        late: stats.find(s => s.status === 'LATE')?._count.status || 0,
        excused: stats.find(s => s.status === 'EXCUSED')?._count.status || 0
      };
      statistics.attendanceRate = statistics.total > 0 ? 
        Math.round((statistics.present / statistics.total) * 100) : 0;

      const data = {
        student: student,
        attendance,
        statistics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRecords: totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      };

      sendResponse(res, 200, true, 'Student attendance fetched successfully', data);
    } catch (error) {
      console.error('Get student attendance error:', error);
      if (error instanceof CustomAPIError) {
        throw error;
      }
      throw new CustomAPIError('Failed to fetch student attendance', 500);
    }
  },

  // Get attendance by teacher ID
  getTeacherAttendance: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const { startDate, endDate, page = 1, limit = 10 } = req.query;

      if (!teacherId) {
        throw new CustomAPIError('Teacher ID is required', 400);
      }

      // Check if teacher exists
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId) },
        include: { user: { select: { name: true, email: true } } }
      });

      if (!teacher) {
        throw new CustomAPIError('Teacher not found', 404);
      }

      // Build date filter
      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }

      // Get attendance records with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const attendance = await prisma.teacherAttendance.findMany({
        where: {
          teacherId: parseInt(teacherId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: parseInt(limit)
      });

      // Get total count for pagination
      const totalCount = await prisma.teacherAttendance.count({
        where: {
          teacherId: parseInt(teacherId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        }
      });

      // Calculate statistics
      const stats = await prisma.teacherAttendance.groupBy({
        by: ['status'],
        where: {
          teacherId: parseInt(teacherId),
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
        },
        _count: {
          status: true
        }
      });

      const statistics = {
        total: totalCount,
        present: stats.find(s => s.status === 'PRESENT')?._count.status || 0,
        absent: stats.find(s => s.status === 'ABSENT')?._count.status || 0,
        late: stats.find(s => s.status === 'LATE')?._count.status || 0,
        excused: stats.find(s => s.status === 'EXCUSED')?._count.status || 0
      };
      statistics.attendanceRate = statistics.total > 0 ? 
        Math.round((statistics.present / statistics.total) * 100) : 0;

      const data = {
        teacher: teacher,
        attendance,
        statistics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalRecords: totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      };

      sendResponse(res, 200, true, 'Teacher attendance fetched successfully', data);
    } catch (error) {
      console.error('Get teacher attendance error:', error);
      if (error instanceof CustomAPIError) {
        throw error;
      }
      throw new CustomAPIError('Failed to fetch teacher attendance', 500);
    }
  },

  // Get all students with today's attendance status
  getAllStudentsAttendanceToday: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const students = await prisma.student.findMany({
        include: {
          user: {
            select: { name: true, email: true }
          },
          attendances: {
            where: {
              date: today
            }
          }
        },
        orderBy: {
          user: {
            name: 'asc'
          }
        }
      });

      const studentsWithAttendance = students.map(student => ({
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        attendanceStatus: student.attendances[0]?.status || 'NOT_MARKED',
        remarks: student.attendances[0]?.remarks || null,
        attendanceId: student.attendances[0]?.id || null
      }));

      sendResponse(res, 200, true, 'Students attendance for today fetched successfully', studentsWithAttendance);
    } catch (error) {
      console.error('Get all students attendance today error:', error);
      throw new CustomAPIError('Failed to fetch students attendance', 500);
    }
  },

  // Get all teachers with today's attendance status
  getAllTeachersAttendanceToday: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const teachers = await prisma.teacher.findMany({
        include: {
          user: {
            select: { name: true, email: true }
          },
          attendances: {
            where: {
              date: today
            }
          }
        },
        orderBy: {
          user: {
            name: 'asc'
          }
        }
      });

      const teachersWithAttendance = teachers.map(teacher => ({
        id: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        subject: teacher.subject,
        department: teacher.department,
        attendanceStatus: teacher.attendances[0]?.status || 'NOT_MARKED',
        remarks: teacher.attendances[0]?.remarks || null,
        attendanceId: teacher.attendances[0]?.id || null
      }));

      sendResponse(res, 200, true, 'Teachers attendance for today fetched successfully', teachersWithAttendance);
    } catch (error) {
      console.error('Get all teachers attendance today error:', error);
      throw new CustomAPIError('Failed to fetch teachers attendance', 500);
    }
  }
};

module.exports = attendanceController;
