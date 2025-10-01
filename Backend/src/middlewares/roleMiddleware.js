const UnauthenticatedError = require('../errors/unauthenticated');

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        throw new UnauthenticatedError('Access denied: Admins only');
    }
    next();
}

const authorizeTeacher = (req, res, next) => {
    if (req.user.role !== 'TEACHER') {
        throw new UnauthenticatedError('Access denied: Teachers only');
    }
    next();
}

module.exports = {
    authorizeAdmin,
    authorizeTeacher
};
