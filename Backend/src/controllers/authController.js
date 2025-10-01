// Business logic: Auth
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
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
        data: { name, email, password: hashedPassword, role: role || 'STUDENT'}
    });

    res.status(StatusCodes.CREATED).json({ user: newUser });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const token = jwt.sign({ userId: existingUser.id, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
    res.status(StatusCodes.OK).json({ user: existingUser, token });
}

module.exports = { signUp, login };
