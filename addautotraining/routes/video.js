const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, isInstructor } = require('../middleware/auth');
const videoController = require('../controllers/videoController');

const validateVideo = [
  check('title', 'Video title is required').not().isEmpty(),
  check('youtubeUrl', 'YouTube URL is required').not().isEmpty(),
  check('order', 'Video order is required').isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

// Add YouTube video to course
router.post('/youtube/:courseId', [protect, isInstructor, ...validateVideo], videoController.addVideo);

// Get videos for a course
router.get('/course/:courseId', protect, videoController.getVideosByCourse);

// Update video
router.put('/:id', [protect, isInstructor], videoController.updateVideo);

// Delete video
router.delete('/:id', [protect, isInstructor], videoController.deleteVideo);

// Get single video
router.get('/:id', protect, videoController.getVideo);

// Search videos
router.get('/search/:query', videoController.searchVideos);

module.exports = router;
