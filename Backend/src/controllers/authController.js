// Business logic: Auth
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/badRequest');
const UnauthenticatedError = require('../errors/unauthenticated');

const prisma = new PrismaClient();

// Register a new user
const signUp = async (req, res) => {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new BadRequestError('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: role || 'student'}
    });

    res.status(StatusCodes.CREATED).json({ user: newUser });
}

module.exports = { signUp };
