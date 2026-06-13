const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, isAdmin } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

const validateCourse = [
  check('title', 'Course title is required').not().isEmpty(),
  check('description', 'Course description is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// Create a new course
router.post('/', [protect, isAdmin, ...validateCourse], courseController.createCourse);

// Update an existing course
router.put('/:id', [protect, isAdmin], courseController.updateCourse);

// Delete a course
router.delete('/:id', [protect, isAdmin], courseController.deleteCourse);

// Get all courses
router.get('/', courseController.getCourses);

// Get a single course
router.get('/:id', courseController.getCourse);

module.exports = router;


