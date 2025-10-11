const { StatusCodes } = require('http-status-codes');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: 'No user role found in token'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Authorization check failed',
        error: error.message
      });
    }
  };
};

module.exports = authorize;
