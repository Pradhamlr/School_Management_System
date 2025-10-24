const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
 

const createClass = async (req, res) => {
    const { name, section } = req.body;

    const existingClass = await prisma.class.findFirst({ where: { name, section } });
    if (existingClass) {
        throw new BadRequestError('Class with this name and section already exists');
    }

    const newClass = await prisma.class.create({
        data: { name, section },
        include: { classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } }
    });

    res.status(StatusCodes.CREATED).json({ class: newClass });
}

const getClasses = async (req, res) => {
    const classes = await prisma.class.findMany({
        include: { classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } }
    });
    res.status(StatusCodes.OK).json({ classes });
}

const getClassById = async (req, res) => {
    const classId = Number(req.params.id);
    const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: { classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } }
    });
    if (!classData) {
        throw new NotFoundError('Class not found');
    }
    res.status(StatusCodes.OK).json({ class: classData });
}

const deleteClass = async (req, res) => {
    const classId = Number(req.params.id);
    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) {
        throw new NotFoundError('Class not found');
    }
    // Prevent deletion if there are students assigned to this class
    const studentCount = await prisma.student.count({ where: { classId } });
    if (studentCount > 0) {
        throw new BadRequestError('Cannot delete class with assigned students. Reassign or remove students first.');
    }

    await prisma.class.delete({ where: { id: classId } });
    res.status(StatusCodes.NO_CONTENT).send();
}

const updateClass = async (req, res) => {
    const classId = Number(req.params.id);
    const { name, section } = req.body;

    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) {
        throw new NotFoundError('Class not found');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (section !== undefined) updateData.section = section;

    const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: updateData,
        include: { classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } }
    });

    res.status(StatusCodes.OK).json({ class: updatedClass });
}

const assignClassTeacher = async (req, res) => {
    const classId = Number(req.params.id);
    const { classTeacherId } = req.body;

    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) {
        throw new NotFoundError('Class not found');
    }

    const classTeacher = await prisma.teacher.findUnique({ where: { id: classTeacherId } });
    if (!classTeacher) {
        throw new BadRequestError('Invalid class teacher ID');
    }

    const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: { classTeacherId },
        include: { classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } }
    });

    res.status(StatusCodes.OK).json({ class: updatedClass });
}

const assignStudentToClass = async (req, res) => {
    const classId = Number(req.params.id);
    const { studentId } = req.body;

    const classData = await prisma.class.findUnique({ where: { id: classId } });
    if (!classData) {
        throw new NotFoundError('Class not found');
    }   

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
        throw new BadRequestError('Invalid student ID');
    }
     
    const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: { classId },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });
    res.status(StatusCodes.OK).json({ student: updatedStudent });
}

const getStudentClass = async (req, res) => {
    const studentId = req.user.id;

    const student = await prisma.student.findUnique({
        where: { userId: studentId },
    include: { class: { include: { classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } } } } }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    res.status(StatusCodes.OK).json({ class: student.class });
};

// Get classes assigned to the currently authenticated teacher
const getTeacherClasses = async (req, res) => {
    const userId = req.user.id;

    // Find teacher record linked to this user
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) {
        throw new NotFoundError('Teacher record not found for this user');
    }

    // Find classes where this teacher is assigned as classTeacher
    const classes = await prisma.class.findMany({
        where: { classTeacherId: teacher.id },
        include: {
            classTeacher: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
            students: { include: { user: { select: { id: true, name: true, email: true } } } },
            // include timetable entries for this class (optional, useful for teacher view)
            // Prisma relation name is `timetables` (plural) in the schema
            timetables: { include: { subject: true, classroom: true, teacher: { include: { user: { select: { id: true, name: true, email: true } } } } } }
        }
    });

    res.status(StatusCodes.OK).json({ classes });
};

module.exports = {
    createClass,
    getClasses,
    getClassById,
    deleteClass,
    assignClassTeacher,
    assignStudentToClass,
    getStudentClass,
    updateClass,
    getTeacherClasses
};
