const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for dev
  if (process.env.NODE_ENV !== 'test') {
    if (err.statusCode >= 500 || !err.statusCode) {
      logger.error(`Error: ${err.message}`, { stack: err.stack });
    } else {
      logger.warn(`Warn: ${err.message}`);
    }
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Server Error'
      : error.message || 'Server Error'
  });
};

module.exports = errorHandler;
