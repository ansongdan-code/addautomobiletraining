const authService = require('../services/authService');
const logger = require('../utils/logger');

const handleError = (res, error, context) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(`${context}: ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${context}: ${error.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Server error' : error.message
  });
};

exports.register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({
      success: true,
      token: data.token,
      data: data.user
    });
  } catch (error) {
    return handleError(res, error, 'Registration error');
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json({
      success: true,
      token: data.token,
      data: data.user
    });
  } catch (error) {
    return handleError(res, error, 'Login error');
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    return handleError(res, error, 'Error fetching current user');
  }
};
