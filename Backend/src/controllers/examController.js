const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

const createExam = async (req, res) => {
    const { name, date, classId, subjectId, totalMarks } = req.body;
    const examDate = new Date(date);

    const existingExam = await prisma.exam.findFirst({ where: { name, classId, subjectId } });
    if (existingExam) {
        throw new BadRequestError('Exam with this name for the specified class and subject already exists');
    }

    const exam = await prisma.exam.create({
        data: { name, date: examDate, classId, subjectId, totalMarks },
        include: { class: true, subject: true }
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Exam created successfully',
        data: exam
    });
}


const getExams = async (req, res) => {

    const { classId } = req.query;

    const exams = await prisma.exam.findMany({
        where:  classId ? { classId: Number(classId) } : {},
        include: { class: true, subject: true },
        orderBy: { date: 'desc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        exams
    });
}

const getExamDetails = async (req, res) => {
    const examId = Number(req.params.id);
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { class: true, subject: true, results: { include: { student: { include: { user: true } } } } }
    });

    if (!exam) {
        throw new NotFoundError('Exam not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        exam
    });
}

module.exports = {
    createExam,
    getExams,
    getExamDetails
};