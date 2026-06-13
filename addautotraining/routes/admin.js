const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, isAdmin } = require('../middleware/auth');
const { uploadSingle, uploadFields, handleUploadError } = require('../middleware/upload');
const adminController = require('../controllers/adminController');

const validateBlogPostPayload = [
  check('title', 'Post title is required').not().isEmpty(),
  check('excerpt', 'Post excerpt is required').not().isEmpty(),
  check('content', 'Post content is required').not().isEmpty(),
  check('category', 'Post category is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    return next();
  }
];

const validateUserUpdate = [
  check('role', 'Valid role is required').optional().isIn(['student', 'instructor', 'admin', 'super_admin']),
  check('isActive', 'isActive must be boolean').optional().isBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// Dashboard stats
router.get('/dashboard', [protect, isAdmin], adminController.getDashboard);

// Get all users with pagination
router.get('/users', [protect, isAdmin], adminController.getUsers);

// Update user
router.put('/users/:id', [protect, isAdmin, ...validateUserUpdate], adminController.updateUser);

// Get all courses with pagination
router.get('/courses', [protect, isAdmin], adminController.getCourses);

// Update course
router.put('/courses/:id', [protect, isAdmin], adminController.updateCourse);

// Delete course
router.delete('/courses/:id', [protect, isAdmin], adminController.deleteCourse);

// Blog management routes
router.get('/blog/posts', [protect, isAdmin], adminController.getBlogPosts);

// Create blog post
router.post('/blog/posts', [
  protect,
  isAdmin,
  uploadSingle('featuredImage'),
  ...validateBlogPostPayload
], adminController.createBlogPost);

// Update blog post
router.put('/blog/posts/:id', [protect, isAdmin], adminController.updateBlogPost);

// Delete blog post
router.delete('/blog/posts/:id', [protect, isAdmin], adminController.deleteBlogPost);

// Website settings routes
router.get('/settings', [protect, isAdmin], adminController.getSettings);

// Update website settings
router.put('/settings', [
  protect,
  isAdmin,
  uploadFields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'heroBackground', maxCount: 1 }
  ])
], adminController.updateSettings);

// Analytics route
router.get('/analytics', [protect, isAdmin], adminController.getAnalytics);

// Upload error handler
router.use(handleUploadError);

module.exports = router;
