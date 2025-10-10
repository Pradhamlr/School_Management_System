const {PrismaClient} = require('@prisma/client');
const {StatusCodes} = require('http-status-codes');

const prisma = new PrismaClient();
const {BadRequestError, NotFoundError} = require("../errors");

const createSubject = async (req, res) => {
    const {name, code} = req.body;

    const existingSubject = await prisma.subject.findFirst({where: {code}});
    if (existingSubject) {
        throw new BadRequestError('Subject with this code already exists');
    }

    const newSubject = await prisma.subject.create({
        data: {name, code}
    });
    res.status(StatusCodes.CREATED).json({subject: newSubject});
};

const getSubjects = async (req, res) => {
    const subjects = await prisma.subject.findMany();
    res.status(StatusCodes.OK).json({subjects});
};

const updateSubject = async (req, res) => {
    const subjectId = Number(req.params.id);
    const {name, code} = req.body;

    const subject = await prisma.subject.findUnique({where: {id: subjectId}});
    if (!subject) {
        throw new NotFoundError('Subject not found');
    }

    const updatedSubject = await prisma.subject.update({
        where: {id: Number(id)},
        data: {name, code}
    });
    res.status(StatusCodes.OK).json({subject: updatedSubject});
};

const deleteSubject = async (req, res) => {
    const subjectId = Number(req.params.id);

    const subject = await prisma.subject.findUnique({where: {id: subjectId}});
    if (!subject) {
        throw new NotFoundError('Subject not found');
    }

    await prisma.subject.delete({where: {id: subjectId}});
    res.status(StatusCodes.NO_CONTENT).send();
};

const assignTeacherToSubject = async (req, res) => {
    const {teacherId, classId, subjectId} = req.body;

    const existing = await prisma.teacherClassSubject.findFirst({
        where: {
            teacherId, classId, subjectId
        }
    });

    if (existing) {
        throw new BadRequestError('This teacher is already assigned to this subject in this class');
    }

    const assignment = await prisma.teacherClassSubject.create({
        data: {
            teacherId, classId, subjectId
        },
        include: {teacher: {include: {user: true}}, class: true, subject: true}
    });

    res.status(StatusCodes.CREATED).json({assignment});
};

const getTeacherAssignments = async (req, res) => {
  const teacherId = req.user.userId;
  const assignments = await prisma.teacherClassSubject.findMany({
    where: { teacherId },
    include: { class: true, subject: true },
  });
  res.status(StatusCodes.OK).json(assignments);
};

const getClassSubjects = async (req, res) => {
  const classId = Number(req.params.classId);
  const subjects = await prisma.teacherClassSubject.findMany({
    where: { classId },
    include: { subject: true, teacher: { include: { user: true } } },
  });
  res.status(StatusCodes.OK).json(subjects);
}




module.exports = {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject,
    assignTeacherToSubject,
    getTeacherAssignments,
    getClassSubjects
};
