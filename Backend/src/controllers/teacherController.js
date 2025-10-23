const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
 

const createTeacher = async (req, res) => {
    const { userId, department, hireDate } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new BadRequestError('Invalid user ID');
    }

    // If the user exists but role is not TEACHER, promote them to TEACHER
    if (user.role !== 'TEACHER') {
        await prisma.user.update({ where: { id: userId }, data: { role: 'TEACHER' } });
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { userId } });
    if (existingTeacher) {
        throw new BadRequestError('Teacher profile already exists for this user');
    }

    const newTeacher = await prisma.teacher.create({
        data: { userId, department, hireDate: new Date(hireDate) },
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
    });

    res.status(StatusCodes.CREATED).json({ 
        success: true,
        message: 'Teacher created successfully',
        teacher: newTeacher
    });
}

const getAllTeachers = async (req, res) => {
    const teachers = await prisma.teacher.findMany({
        include: {
            user: { select: { id: true, name: true, email: true, role: true } },
            teachingAssignments: { include: { subject: true, class: true } },
            advisedClasses: true,
        }
    });

    // Shape response to include convenient fields expected by frontend
    const shaped = teachers.map((t) => {
        const subjects = (t.teachingAssignments || []).map((ta) => ta.subject).filter(Boolean);
        // collect unique classes from advisedClasses and teachingAssignments
        const classIds = new Set();
        (t.advisedClasses || []).forEach((c) => classIds.add(c.id));
        (t.teachingAssignments || []).forEach((ta) => { if (ta.class) classIds.add(ta.class.id); });

        return {
            id: t.id,
            department: t.department,
            hireDate: t.hireDate,
            user: t.user,
            subjects,
            classes: classIds.size,
            // preserve optional fields if present
            status: t.status || 'Active',
            experience: t.experience || null,
            teachingAssignments: t.teachingAssignments,
            advisedClasses: t.advisedClasses,
        };
    });

    res.status(StatusCodes.OK).json({
        success: true,
        teachers: shaped
    });
};

const getTeacherById = async (req, res) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: Number(req.params.id) },
        include: { user: { select: { id: true, name: true, email: true, role: true } }, teachingAssignments: { include: { subject: true, class: true } }, advisedClasses: true }
    });

    if (!teacher) {
        throw new NotFoundError('Teacher not found');
    }

    const subjects = (teacher.teachingAssignments || []).map(ta => ta.subject).filter(Boolean);
    const classIds = new Set();
    (teacher.advisedClasses || []).forEach(c => classIds.add(c.id));
    (teacher.teachingAssignments || []).forEach(ta => { if (ta.class) classIds.add(ta.class.id); });

    const shaped = {
        id: teacher.id,
        user: teacher.user,
        department: teacher.department,
        hireDate: teacher.hireDate,
        status: teacher.status || 'Active',
        subjects,
        classes: classIds.size,
        teachingAssignments: teacher.teachingAssignments,
        advisedClasses: teacher.advisedClasses,
    };

    res.status(StatusCodes.OK).json({
        success: true,
        teacher: shaped
    });
}

const getCurrentTeacher = async (req, res) => {
    const teacher = await prisma.teacher.findUnique({
        where: { userId: req.user.id },
        include: { user: { select: { id: true, name: true, email: true, role: true } }, teachingAssignments: { include: { subject: true, class: true } }, advisedClasses: true }
    });

    if (!teacher) {
        throw new NotFoundError('Teacher not found');
    }

    const subjects = (teacher.teachingAssignments || []).map(ta => ta.subject).filter(Boolean);
    const classIds = new Set();
    (teacher.advisedClasses || []).forEach(c => classIds.add(c.id));
    (teacher.teachingAssignments || []).forEach(ta => { if (ta.class) classIds.add(ta.class.id); });

    const shaped = {
        id: teacher.id,
        user: teacher.user,
        department: teacher.department,
        hireDate: teacher.hireDate,
        status: teacher.status || 'Active',
        subjects,
        classes: classIds.size,
        teachingAssignments: teacher.teachingAssignments,
        advisedClasses: teacher.advisedClasses,
    };

    // Also attempt to fetch teacherClassSubjects if model exists
    let teacherClassSubjects = [];
    try {
        teacherClassSubjects = await prisma.teacherClassSubject.findMany({
            where: { teacherId: teacher.id },
            include: { class: true, subject: true }
        });
    } catch (e) {
        // ignore if relation/model not present in schema
        teacherClassSubjects = [];
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            teacher: shaped,
            teacherClassSubjects
        }
    });
}

const updateTeacher = async (req, res) => {
    const { department, hireDate, status } = req.body;

    const existingTeacher = await prisma.teacher.findUnique({ where: { id: Number(req.params.id) } });
    if (!existingTeacher) {
        throw new NotFoundError('Teacher not found');
    }

    const updateData = {};
    if (department !== undefined) updateData.department = department;
    if (hireDate !== undefined) updateData.hireDate = new Date(hireDate);
    if (status !== undefined) updateData.status = status;

        let updatedTeacher;
        try {
            updatedTeacher = await prisma.teacher.update({
                    where: { id: Number(req.params.id) },
                    data: updateData,
                    include: { user: { select: { id: true, name: true, email: true, role: true } } }
            });
        } catch (err) {
            // Likely a schema mismatch (e.g., `status` field not present in DB). Return a clear error.
            console.error('Failed to update teacher:', err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to update teacher. Database schema may be out of date. Please run prisma migrate.' });
        }

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