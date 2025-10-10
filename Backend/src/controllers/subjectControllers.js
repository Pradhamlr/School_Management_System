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

module.exports = {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject
};
