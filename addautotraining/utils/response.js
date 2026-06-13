/**
 * Standardize API responses
 */
exports.sendSuccess = (res, data, statusCode = 200, message = null) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

exports.sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};
