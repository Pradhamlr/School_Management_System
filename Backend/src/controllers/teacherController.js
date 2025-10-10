const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

const createTeacher = async (req, res) => {
    const { userId, department, hireDate } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'TEACHER') {
        throw new BadRequestError('Invalid user ID or user is not a teacher');
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { userId } });
    if (existingTeacher) {
        throw new BadRequestError('Teacher profile already exists for this user');
    }

    const newTeacher = await prisma.teacher.create({
        data: { userId, department, hireDate: new Date(hireDate) },
        include: { user: true }
    });

    res.status(StatusCodes.CREATED).json({ 
        success: true,
        message: 'Teacher created successfully',
        teacher: newTeacher 
    });
}

const getAllTeachers = async (req, res) => {
    const teachers = await prisma.teacher.findMany({
        include: { user: true }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        teachers
    });
}

const getTeacherById = async (req, res) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: Number(req.params.id) },
        include: { user: true }
    });

    if (!teacher) {
        throw new NotFoundError('Teacher not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        teacher
    });
}

const getCurrentTeacher = async (req, res) => {
    const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id },
        include: { user: true }
    });

    if (!teacher) {
        throw new NotFoundError('Teacher not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        teacher
    });
}

const updateTeacher = async (req, res) => {
    const { department, hireDate } = req.body;

    const existingTeacher = await prisma.teacher.findUnique({ where: { id: Number(req.params.id) } });
    if (!existingTeacher) {
        throw new NotFoundError('Teacher not found');
    }

    const updateData = {};
    if (department !== undefined) updateData.department = department;
    if (hireDate !== undefined) updateData.hireDate = new Date(hireDate);

    const updatedTeacher = await prisma.teacher.update({
        where: { id: Number(req.params.id) },
        data: updateData,
        include: { user: true }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Teacher updated successfully',
        teacher: updatedTeacher
    });
}

const deleteTeacher = async (req, res) => {
    const existingTeacher = await prisma.teacher.findUnique({ where: { id: Number(req.params.id) } });
    if (!existingTeacher) {
        throw new NotFoundError('Teacher not found');
    }

    await prisma.teacher.delete({ where: { id: Number(req.params.id) } });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Teacher deleted successfully'
    });
}

module.exports = { 
    createTeacher,
    getAllTeachers,
    getTeacherById,
    getCurrentTeacher,
    updateTeacher,
    deleteTeacher
};