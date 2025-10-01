const BadRequestError = require('../errors/badRequest');
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

const createStudent = async (req, res) => {
    const { userId, rollNumber, class: studentClass, section, dob } = req.body;

    const user = await prisma.user.findUnique({ where: { id:  userId } });
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

    res.status(StatusCodes.CREATED).json({ student: newStudent });
}

module.exports = { createStudent };