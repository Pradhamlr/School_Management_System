const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const UnauthenticatedError = require('../errors/unauthenticated');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthenticatedError('Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      throw new UnauthenticatedError('Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Invalid token');
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthenticatedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new UnauthenticatedError('Insufficient permissions');
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };