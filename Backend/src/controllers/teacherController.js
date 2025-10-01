const BadRequestError = require('../errors/badRequest');
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

const createTeacher = async (req, res) => {
    const { userId, subject, department, hireDate } = req.body;

    const user = await prisma.user.findUnique({ where: { id:  userId } });
    if (!user || user.role !== 'TEACHER') {
        throw new BadRequestError('Invalid user ID or user is not a teacher');
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { userId } });
    if (existingTeacher) {
        throw new BadRequestError('Teacher profile already exists for this user');
    }

    const newTeacher = await prisma.teacher.create({
        data: { userId, subject, department, hireDate: new Date(hireDate) },
        include: { user: true }
    });

    res.status(StatusCodes.CREATED).json({ teacher: newTeacher });
}

module.exports = { createTeacher };