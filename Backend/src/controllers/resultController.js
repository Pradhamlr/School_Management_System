const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

const recordResult = async (req, res) => {
    const { examId, studentId, marks } = req.body;
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
        throw new NotFoundError('Exam not found');
    }

    const percentage = (marks / exam.totalMarks) * 100;
    const grade =
        percentage >= 90 ? 'A+' :
        percentage >= 80 ? 'A' :
        percentage >= 70 ? 'B' :
        percentage >= 60 ? 'C' :
        percentage >= 50 ? 'D' : 'F';

    const result = await prisma.result.upsert({
    where: { examId_studentId: { examId, studentId } },
    update: { marks, grade },
    create: { examId, studentId, marks, grade },
    include: { student: { include: { user: true } } }
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Result recorded successfully',
    data: result
  });
};


const getClassResults = async (req, res) => {
    const { examId } = Number(req.params);
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
        throw new NotFoundError('Exam not found');
    }

    const results = await prisma.result.findMany({
        where: { examId },
        include: { student: { include: { user: true, class: true } } },
        orderBy: { marks: 'desc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        exam,
        results
    });
}

const getStudentResults = async (req, res) => {
    const studentId = Number(req.params.id);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
        throw new NotFoundError('Student not found');
    }

    const results = await prisma.result.findMany({
    where: { studentId: Number(studentId) },
    include: {
      exam: { include: { subject: true, class: true } }
    },
    orderBy: { exam: { date: 'desc' } }
  });

    res.status(StatusCodes.OK).json({
        success: true,
        student,
        results
    });
};

module.exports = {
    recordResult,
    getClassResults,
    getStudentResults
};
