// Generic 404 handler
const notFound = (_req, res, _next) => {
  res.status(404).json({ message: 'Resource not found' });
};

// Centralized error handler to avoid leaking stack traces
const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
