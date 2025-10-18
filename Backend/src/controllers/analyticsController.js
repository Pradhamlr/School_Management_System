const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

const getAnalytics = async (req, res) => {
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.teacher.count();
    const totalClasses = await prisma.class.count();
    const totalSubjects = await prisma.subject.count();

  // count present records for today (use start/end of day)
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
    // aggregate average using `marks` field from schema
    const averageScoreData = await prisma.result.aggregate({
      _avg: { marks: true }
    });

    const averageScore = (averageScoreData._avg && averageScoreData._avg.marks) || 0;

    // get top students by average marks
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

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      attendance: {
        totalStudents,
        studentsPresentToday,
        studentAttendanceRate,
        totalTeachers,
        teachersPresentToday,
        teacherAttendanceRate
      },
      academics: {
        totalResults,
        averageScore,
        topStudents
      },
      teachers: teacherAttendanceStats,
    }
  });
}

module.exports = {
    getAnalytics
};