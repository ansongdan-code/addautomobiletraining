const courseManagementService = require('../services/courseManagementService');
const logger = require('../utils/logger');

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

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

exports.getCourses = async (req, res) => {
  try {
    const data = await courseManagementService.getCourses({
      page: parseInteger(req.query.page, 1),
      limit: parseInteger(req.query.limit, 10),
      search: req.query.search || ''
    });

    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching courses');
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await courseManagementService.getCourseById(req.params.id);
    res.json({ success: true, data: course });
  } catch (error) {
    return handleError(res, error, 'Error fetching course');
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await courseManagementService.createCourse({
      ...req.body,
      instructor: req.user.id
    });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    return handleError(res, error, 'Error creating course');
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await courseManagementService.updateCourse(req.params.id, req.body);
    res.json({ success: true, data: course });
  } catch (error) {
    return handleError(res, error, 'Error updating course');
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const data = await courseManagementService.deleteCourse(req.params.id);
    res.json({ success: true, message: data.message });
  } catch (error) {
    return handleError(res, error, 'Error deleting course');
  }
};
