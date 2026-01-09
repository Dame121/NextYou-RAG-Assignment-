/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Not found handler
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFound
};
