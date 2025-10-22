const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
 


const createStudent = async (req, res) => {
    const { userId, rollNumber, classId, dob } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STUDENT') {
        throw new BadRequestError('Invalid user ID or user is not a student');
    }

    const existingStudent = await prisma.student.findUnique({ where: { userId } });
    if (existingStudent) {
        throw new BadRequestError('Student profile already exists for this user');
    }

    const newStudent = await prisma.student.create({
    data: { userId, rollNumber, classId, dob: new Date(dob) },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    res.status(StatusCodes.CREATED).json({ 
        success: true,
        message: 'Student created successfully',
        student: newStudent
    });
}

const getAllStudents = async (req, res) => {
    const students = await prisma.student.findMany({
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    res.status(StatusCodes.OK).json({
        success: true,
        students
    });
}

const getStudentById = async (req, res) => {

    const student = await prisma.student.findUnique({
        where: { id: Number(req.params.id) },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        student
    });
}

const getCurrentStudent = async (req, res) => {
    const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        student
    });
}

const updateStudent = async (req, res) => {
    const { rollNumber, classId, dob } = req.body;

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
    if (classId !== undefined) updateData.classId = classId;
    // 'section' removed from Student model; section lives on Class. Use classId to associate.
    if (dob !== undefined) updateData.dob = new Date(dob);

    const updatedStudent = await prisma.student.update({
        where: { id: Number(req.params.id) },
        data: updateData,
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Student updated successfully',
        student: updatedStudent
    });
}

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
    getCurrentStudent,
    updateStudent,
    deleteStudent,
    // debug helper
    debugCurrentStudent: async (req, res) => {
        // Return decoded token and student lookup for debugging purposes
        try {
            const tokenUser = req.user || null;
            let student = null;
            try {
                student = await prisma.student.findUnique({ where: { userId: req.user?.id || -1 }, include: { user: true } });
            } catch (e) {
                // ignore lookup errors
            }

            return res.status(200).json({ success: true, tokenUser, student });
        } catch (err) {
            return res.status(500).json({ success: false, error: String(err) });
        }
    }
};
