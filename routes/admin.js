const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getAnalytics
} = require('../controllers/admin');

// All routes require authentication
router.use(protect);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);

// Course management
router.get('/courses', getAllCourses);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

module.exports = router; 