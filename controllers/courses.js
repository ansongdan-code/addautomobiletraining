const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private
exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
