const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

const getAttendanceStats = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const totalStudents = await prisma.student.count();
  const presentStudents = await prisma.studentAttendance.count({
    where: {
      date: today,
      status: 'PRESENT'
    }
  });
  
  const totalTeachers = await prisma.teacher.count();
  const presentTeachers = await prisma.teacherAttendance.count({
    where: {
      date: today,
      status: 'PRESENT'
    }
  });

  const studentAttendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
  const teacherAttendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const classStats = await prisma.studentAttendance.groupBy({
    by: ['studentId'],
    where: {
      date: {
        gte: thirtyDaysAgo,
        lte: today
      }
    },
    _count: {
      status: true
    },
    _sum: {
      status: true
    }
  });

  let excellent = 0, good = 0, average = 0, poor = 0;
  
  for (const stat of classStats) {
    const attendanceRate = (stat._count.status > 0) ? 
      await prisma.studentAttendance.count({
        where: {
          studentId: stat.studentId,
          date: { gte: thirtyDaysAgo, lte: today },
          status: 'PRESENT'
        }
      }) / stat._count.status * 100 : 0;

    if (attendanceRate >= 90) excellent++;
    else if (attendanceRate >= 75) good++;
    else if (attendanceRate >= 60) average++;
    else poor++;
  }

  const data = {
    students: [
      { name: "Present", value: presentStudents, color: "#6366F1" },
      { name: "Absent", value: totalStudents - presentStudents, color: "#EF4444" }
    ],
    teachers: [
      { name: "Present", value: presentTeachers, color: "#EC4899" },
      { name: "Absent", value: totalTeachers - presentTeachers, color: "#EF4444" }
    ],
    performance: [
      { name: "Excellent (90%+)", value: excellent, color: "#10B981" },
      { name: "Good (75-89%)", value: good, color: "#F59E0B" },
      { name: "Average (60-74%)", value: average, color: "#F97316" },
      { name: "Poor (<60%)", value: poor, color: "#EF4444" }
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

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Attendance statistics fetched successfully',
    data
  });
}

const markStudentAttendance = async (req, res) => {
  const { studentId, date, status, remarks } = req.body;
  
  if (!studentId || !date || !status) {
    throw new BadRequestError('Student ID, date, and status are required');
  }

  const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED');
  }

  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) },
    include: { user: true }
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await prisma.studentAttendance.upsert({
    where: {
      studentId_date: {
        studentId: Number(studentId),
        date: attendanceDate
      }
    },
    update: {
      status,
      remarks
    },
    create: {
      studentId: Number(studentId),
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

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Student attendance marked successfully',
    data: {
      attendance,
      message: `Attendance marked as ${status} for ${student.user.name}`
    }
  });
}

  // Mark teacher attendance
const markTeacherAttendance = async (req, res) => {
  const { teacherId, date, status, remarks } = req.body;
  
  if (!teacherId || !date || !status) {
    throw new BadRequestError('Teacher ID, date, and status are required');
  }

  const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status. Must be PRESENT, ABSENT, LATE, or EXCUSED');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: Number(teacherId) },
    include: { user: true }
  });

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const attendance = await prisma.teacherAttendance.upsert({
    where: {
      teacherId_date: {
        teacherId: Number(teacherId),
        date: attendanceDate
      }
    },
    update: {
      status,
      remarks
    },
    create: {
      teacherId: Number(teacherId),
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

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Teacher attendance marked successfully',
    data: {
      attendance,
      message: `Attendance marked as ${status} for ${teacher.user.name}`
    }
  });
}

  // Get attendance by student ID
const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate, page = 1, limit = 10 } = req.query;

  if (!studentId) {
    throw new BadRequestError('Student ID is required');
  }

  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) },
    include: { user: { select: { name: true, email: true } } }
  });

  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const dateFilter = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const attendance = await prisma.studentAttendance.findMany({
    where: {
      studentId: Number(studentId),
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    },
    orderBy: {
      date: 'desc'
    },
    skip,
    take: Number(limit)
  });

  const totalCount = await prisma.studentAttendance.count({
    where: {
      studentId: Number(studentId),
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }
  });

  const stats = await prisma.studentAttendance.groupBy({
    by: ['status'],
    where: {
      studentId: Number(studentId),
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
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalRecords: totalCount,
      hasNext: skip + Number(limit) < totalCount,
      hasPrev: Number(page) > 1
    }
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Student attendance fetched successfully',
    data
  });
}

  // Get attendance by teacher ID
const getTeacherAttendance = async (req, res) => {
  const { teacherId } = req.params;
  const { startDate, endDate, page = 1, limit = 10 } = req.query;

  if (!teacherId) {
    throw new BadRequestError('Teacher ID is required');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: Number(teacherId) },
    include: { user: { select: { name: true, email: true } } }
  });

  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  const dateFilter = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const attendance = await prisma.teacherAttendance.findMany({
    where: {
      teacherId: Number(teacherId),
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    },
    orderBy: {
      date: 'desc'
    },
    skip,
    take: Number(limit)
  });

  const totalCount = await prisma.teacherAttendance.count({
    where: {
      teacherId: Number(teacherId),
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    }
  });

  const stats = await prisma.teacherAttendance.groupBy({
    by: ['status'],
    where: {
      teacherId: Number(teacherId),
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
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      totalRecords: totalCount,
      hasNext: skip + Number(limit) < totalCount,
      hasPrev: Number(page) > 1
    }
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Teacher attendance fetched successfully',
    data
  });
}

  // Get all students with today's attendance status
const getAllStudentsAttendanceToday = async (req, res) => {
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

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Students attendance for today fetched successfully',
    data: studentsWithAttendance
  });
}

  // Get all teachers with today's attendance status
 const getAllTeachersAttendanceToday = async (req, res) => {
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

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Teachers attendance for today fetched successfully',
    data: teachersWithAttendance
  });
}

module.exports = {
  getAttendanceStats,
  markStudentAttendance,
  getStudentAttendance,
  markTeacherAttendance,
  getTeacherAttendance,
  getAllStudentsAttendanceToday,
  getAllTeachersAttendanceToday
};
