const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

const getAnalytics = async (req, res) => {
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.teacher.count();
    const totalClasses = await prisma.class.count();
    const totalSubjects = await prisma.subject.count();

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const studentsPresentToday = await prisma.studentAttendance.count({
        where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: 'PRESENT'
        }
    });

    const teachersPresentToday = await prisma.teacherAttendance.count({
        where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: 'PRESENT'
        }
    });

        const studentAttendanceRate = totalStudents === 0 ? 0 : ((studentsPresentToday / totalStudents) * 100).toFixed(2);
        const teacherAttendanceRate = totalTeachers === 0 ? 0 : ((teachersPresentToday / totalTeachers) * 100).toFixed(2);

        const totalResults = await prisma.result.count();

        const averageScoreData = await prisma.result.aggregate({
        _avg: { marks: true }
        });

        const averageScore = (averageScoreData._avg && averageScoreData._avg.marks) || 0;

  const topStudents = await prisma.result.groupBy({
  by: ['studentId'],
  _avg: { marks: true },
  orderBy: { _avg: { marks: 'desc' } },
  take: 5,
  });

    const teacherAttendanceStats = await prisma.teacherAttendance.groupBy({
        by: ['status'],
        _count: { status: true },
    });

  // Additional analytics fields
  // monthlyNewStudents: count students whose user.createdAt is in current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setMilliseconds(endOfMonth.getMilliseconds() - 1);

  const monthlyNewStudents = await prisma.student.count({
    where: {
      user: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
    }
  });

  // departmentCount
  const departmentCount = await prisma.teacher.aggregate({
    _count: { department: true }
  });

  // avgTeacherExperience (years)
  const teachers = await prisma.teacher.findMany({ select: { hireDate: true } });
  const now = new Date();
  let avgTeacherExperience = 0;
  if (teachers.length > 0) {
    const totalYears = teachers.reduce((acc, t) => acc + ((now - new Date(t.hireDate)) / (1000 * 60 * 60 * 24 * 365)), 0);
    avgTeacherExperience = Number((totalYears / teachers.length).toFixed(1));
  }

  // monthlyRevenue: sum of paid feeRecords in current month
  const monthlyRevenueRes = await prisma.feeRecord.aggregate({
    where: {
      status: 'PAID',
      paidAt: { gte: startOfMonth, lte: endOfMonth }
    },
    _sum: { amount: true }
  });
  const monthlyRevenue = monthlyRevenueRes._sum.amount || 0;

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
    attendance: {
      totalStudents,
      studentsPresentToday,
      studentAttendanceRate,
      totalTeachers,
      teachersPresentToday,
      teacherAttendanceRate,
      totalClasses
    },
    academics: {
      totalResults,
      averageScore,
      topStudents
    },
    teachers: teacherAttendanceStats,
    monthlyNewStudents,
  // compute distinct department count
  departmentCount: (await prisma.teacher.findMany({ select: { department: true } })).reduce((acc, t) => acc.add(t.department), new Set()).size,
    avgTeacherExperience,
    monthlyRevenue
    }
  });
}

const getClassPerformance = async (req, res) => {
  const classes = await prisma.class.findMany({
    include: {
      students: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    }
  });

  const performanceData = [];

  for (const cls of classes) {
    const exams = await prisma.exam.findMany({
      where: { classId: cls.id },
      include: { results: true }
    });

    let totalMarks = 0;
    let obtainedMarks = 0;
    let passCount = 0;
    let totalResults = 0;

    exams.forEach(exam => {
      if (!exam.totalMarks || exam.totalMarks <= 0) return; // skip invalid exams
      exam.results.forEach(r => {
        obtainedMarks += r.marks;
        totalMarks += exam.totalMarks;
        totalResults++;
        if (r.marks >= exam.totalMarks * 0.4) passCount++;
      });
    });

    const avgPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const passPercentage = totalResults > 0 ? (passCount / totalResults) * 100 : 0;

    performanceData.push({
      classId: cls.id,
  className: `${cls.name}${cls.section ? `-${cls.section}` : ''}`,
      avgPercentage: avgPercentage.toFixed(2),
      passPercentage: passPercentage.toFixed(2),
      totalStudents: cls.students.length
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Class-wise performance analytics fetched successfully',
    data: performanceData
  });
};

const getSubjectPerformance = async (req, res) => {
  const subjects = await prisma.subject.findMany({
    include: {
      teachers: {
        include: {
          teacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } }
        }
      }
    }
  });

  const performanceData = [];

  for (const subject of subjects) {
    const exams = await prisma.exam.findMany({
      where: { subjectId: subject.id },
      include: { results: true }
    });

    let totalMarks = 0;
    let obtainedMarks = 0;
    let passCount = 0;
    let totalResults = 0;

    exams.forEach(exam => {
      if (!exam.totalMarks || exam.totalMarks <= 0) return;
      exam.results.forEach(r => {
        obtainedMarks += r.marks;
        totalMarks += exam.totalMarks;
        totalResults++;
        if (r.marks >= exam.totalMarks * 0.4) passCount++;
      });
    });

    const avgPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const passPercentage = totalResults > 0 ? (passCount / totalResults) * 100 : 0;

    performanceData.push({
      subjectId: subject.id,
      subjectName: subject.name,
      avgPercentage: avgPercentage.toFixed(2),
      passPercentage: passPercentage.toFixed(2),
      teacherNames: subject.teachers.map(t => t.teacher.user.name)
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Subject-wise performance analytics fetched successfully',
    data: performanceData
  });
};



module.exports = {
  getAnalytics,
  getClassPerformance,
  getSubjectPerformance
};