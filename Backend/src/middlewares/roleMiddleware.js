const UnauthenticatedError = require('../errors/unauthenticated');

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new UnauthenticatedError('Access denied: Admins only');
    }
    next();
}

module.exports = {
    authorizeAdmin
}