const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found',
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
};

module.exports = notFoundMiddleware;