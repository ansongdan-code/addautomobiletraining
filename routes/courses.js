const express = require('express');
const {
  getCourses,
  createCourse,
} = require('../controllers/courses');

const router = express.Router();

router.route('/').get(getCourses).post(createCourse);

module.exports = router;
