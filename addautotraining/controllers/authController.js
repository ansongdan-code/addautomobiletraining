const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return sendSuccess(res, {
      token: data.token,
      user: data.user
    }, 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return sendSuccess(res, {
      token: data.token,
      user: data.user
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};
