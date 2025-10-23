// Business logic: Auth
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/badRequest');
const UnauthenticatedError = require('../errors/unauthenticated');


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
    // If the user is a student, require there be a Student record linked to this user
    if (existingUser.role === 'STUDENT') {
        const studentRecord = await prisma.student.findUnique({ where: { userId: existingUser.id } });
        if (!studentRecord) {
            // do not reveal which part failed — return generic auth error
            throw new UnauthenticatedError('Invalid credentials');
        }
    }
    // If the user is a teacher, require there be a Teacher record linked to this user
    if (existingUser.role === 'TEACHER') {
        const teacherRecord = await prisma.teacher.findUnique({ where: { userId: existingUser.id } });
        if (!teacherRecord) {
            throw new UnauthenticatedError('Invalid credentials');
        }
    }

    res.status(StatusCodes.OK).json({ user: existingUser, token });
}

// Simple in-memory token store for password resets (development only)
const resetTokens = new Map(); // token -> userId

const crypto = require('crypto');

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) throw new BadRequestError('Email is required');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // To avoid leaking which emails exist, respond with success anyway
        return res.status(StatusCodes.OK).json({ message: 'If an account exists, a reset link has been sent' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    // store token for 1 hour (simple implementation)
    resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 3600 * 1000 });

    // In production you'd send an email containing a link with the token.
    // The flow would be: user clicks link in email -> frontend opens reset page with token param -> frontend posts { token, newPassword } to /api/auth/reset-password.
    // This dev implementation returns the token for easy testing and logs it to the server console.
    console.log(`Password reset token for user ${user.email}: ${token}`);
    res.status(StatusCodes.OK).json({ message: 'Reset token generated (development)', token });
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new BadRequestError('Token and newPassword are required');
    const entry = resetTokens.get(token);
    if (!entry) throw new BadRequestError('Invalid or expired token');
    if (entry.expiresAt < Date.now()) {
        resetTokens.delete(token);
        throw new BadRequestError('Token has expired');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: entry.userId }, data: { password: hashed } });
    resetTokens.delete(token);
    res.status(StatusCodes.OK).json({ message: 'Password reset successful' });
};

module.exports = { signUp, login, forgotPassword, resetPassword };
