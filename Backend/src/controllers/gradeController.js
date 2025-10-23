const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

// Get grades by class and subject
const getGrades = async (req, res) => {
    const { classId, subjectId } = req.query;

    const whereConditions = {};
    if (classId) whereConditions.classId = Number(classId);
    if (subjectId) whereConditions.subjectId = Number(subjectId);

    const results = await prisma.result.findMany({
        where: {
            exam: whereConditions
        },
        include: {
            student: {
                include: {
                    user: { select: { name: true } },
                    class: true
                }
            },
            exam: {
                include: {
                    subject: true,
                    class: true
                }
            }
        },
        orderBy: [
            { exam: { name: 'asc' } },
            { student: { rollNumber: 'asc' } }
        ]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: results.length,
        data: results
    });
};

// Add grade
const addGrade = async (req, res) => {
    const { examId, studentId, marks, grade } = req.body;

    if (!examId || !studentId || marks === undefined) {
        throw new BadRequestError('Exam ID, Student ID, and marks are required');
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
        where: { id: Number(examId) }
    });

    if (!exam) {
        throw new NotFoundError('Exam not found');
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: Number(studentId) }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    // Check if result already exists
    const existingResult = await prisma.result.findUnique({
        where: {
            examId_studentId: {
                examId: Number(examId),
                studentId: Number(studentId)
            }
        }
    });

    if (existingResult) {
        throw new BadRequestError('Grade already exists for this student and exam');
    }

    const result = await prisma.result.create({
        data: {
            examId: Number(examId),
            studentId: Number(studentId),
            marks: Number(marks),
            grade: grade || null
        },
        include: {
            student: {
                include: {
                    user: { select: { name: true } }
                }
            },
            exam: {
                include: {
                    subject: true,
                    class: true
                }
            }
        }
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Grade added successfully',
        data: result
    });
};

// Get exams for dropdown
const getExams = async (req, res) => {
    const exams = await prisma.exam.findMany({
        include: {
            subject: true,
            class: true
        },
        orderBy: { date: 'desc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: exams
    });
};

// Get students for dropdown
const getStudents = async (req, res) => {
    const { classId } = req.query;
    
    const whereConditions = {};
    if (classId) whereConditions.classId = Number(classId);

    const students = await prisma.student.findMany({
        where: whereConditions,
        include: {
            user: { select: { name: true } },
            class: true
        },
        orderBy: { rollNumber: 'asc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: students
    });
};

// Get classes for dropdown
const getClasses = async (req, res) => {
    const classes = await prisma.class.findMany({
        orderBy: [{ name: 'asc' }, { section: 'asc' }]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: classes
    });
};

// Get subjects for dropdown
const getSubjects = async (req, res) => {
    const subjects = await prisma.subject.findMany({
        orderBy: { name: 'asc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: subjects
    });
};

module.exports = {
    getGrades,
    addGrade,
    getExams,
    getStudents,
    getClasses,
    getSubjects
};