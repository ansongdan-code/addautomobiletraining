const courseManagementService = require('../services/courseManagementService');
const { sendSuccess } = require('../utils/response');

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

exports.getCourses = async (req, res, next) => {
  try {
    const data = await courseManagementService.getCourses({
      page: parseInteger(req.query.page, 1),
      limit: parseInteger(req.query.limit, 10),
      search: req.query.search || ''
    });

    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  try {
    const course = await courseManagementService.getCourseById(req.params.id);
    return sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const course = await courseManagementService.createCourse({
      ...req.body,
      instructor: req.user.id
    });
    return sendSuccess(res, course, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await courseManagementService.updateCourse(req.params.id, req.body);
    return sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const data = await courseManagementService.deleteCourse(req.params.id);
    return sendSuccess(res, null, 200, data.message);
  } catch (error) {
    next(error);
  }
};
