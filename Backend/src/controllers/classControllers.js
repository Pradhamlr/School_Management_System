const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const { PrismaClient } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = new PrismaClient();

const createClass = async (req, res) => {
    const { name, section } = req.body;

    const existingClass = await prisma.class.findUnique({ where: { name_section: { name, section } } });
    if (existingClass) {
        throw new BadRequestError('Class with this name and section already exists');
    }

    
}