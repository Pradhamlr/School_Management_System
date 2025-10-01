const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

// Create a new student
const createStudent = async (req, res) => {
    const { userId, rollNumber, class: studentClass, section, dob } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STUDENT') {
        throw new BadRequestError('Invalid user ID or user is not a student');
    }

    const existingStudent = await prisma.student.findUnique({ where: { userId } });
    if (existingStudent) {
        throw new BadRequestError('Student profile already exists for this user');
    }

    const newStudent = await prisma.student.create({
        data: { userId, rollNumber, class: studentClass, section, dob: new Date(dob) },
        include: { user: true }
    });

    res.status(StatusCodes.CREATED).json({ 
        success: true,
        message: 'Student created successfully',
        student: newStudent 
    });
}

// Get all students
const getAllStudents = async (req, res) => {
    const students = await prisma.student.findMany({
        include: { user: true },
    });

    res.status(StatusCodes.OK).json({
        success: true,
        students
    });
}

// Get a single student by ID
const getStudentById = async (req, res) => {

    const student = await prisma.student.findUnique({
        where: { id: Number(req.params.id) },
        include: { user: true }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        student
    });
}

// Update student
const updateStudent = async (req, res) => {
    const { rollNumber, class: studentClass, section, dob } = req.body;

    const existingStudent = await prisma.student.findUnique({ where: { id: Number(req.params.id) } });
    if (!existingStudent) {
        throw new NotFoundError('Student not found');
    }

    if (rollNumber && rollNumber !== existingStudent.rollNumber) {
        const duplicateRoll = await prisma.student.findFirst({
            where: { 
                rollNumber,
                id: { not: Number(req.params.id) }
            }
        });
        if (duplicateRoll) {
            throw new BadRequestError('Roll number already exists');
        }
    }

    const updateData = {};
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (studentClass !== undefined) updateData.class = studentClass;
    if (section !== undefined) updateData.section = section;
    if (dob !== undefined) updateData.dob = new Date(dob);

    const updatedStudent = await prisma.student.update({
        where: { id: Number(req.params.id) },
        data: updateData,
        include: { user: true }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Student updated successfully',
        student: updatedStudent
    });
}

// Delete a student
const deleteStudent = async (req, res) => {

    const existingStudent = await prisma.student.findUnique({ where: { id: Number(req.params.id) } });
    if (!existingStudent) {
        throw new NotFoundError('Student not found');
    }

    await prisma.student.delete({ where: { id: Number(req.params.id) } });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Student deleted successfully'
    });
}

module.exports = { 
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};