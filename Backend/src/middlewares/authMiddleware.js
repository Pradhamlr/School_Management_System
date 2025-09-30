// JWT/OAuth verification
const jwt = require('jsonwebtoken');
const UnauthenticatedError = require('../errors/unauthenticated');

const authMiddleware = async (req, res, next) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 

    if (!token) {
        throw new UnauthenticatedError('No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Invalid token');
    }
}

module.exports = authMiddleware;
