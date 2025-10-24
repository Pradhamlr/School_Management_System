const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
const NotFoundError = require('../errors/notFound');

const getClassrooms = async (req, res) => {
  const rooms = await prisma.classroom.findMany();
  res.status(StatusCodes.OK).json({ data: rooms });
};

const getClassroomById = async (req, res) => {
  const id = Number(req.params.id);
  const room = await prisma.classroom.findUnique({ where: { id } });
  if (!room) throw new NotFoundError('Classroom not found');
  res.status(StatusCodes.OK).json({ data: room });
};

module.exports = { getClassrooms, getClassroomById };
