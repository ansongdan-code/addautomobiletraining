const express = require('express');
const {
  addYouTubeVideo,
  getCourseVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  getVideoStats
} = require('../controllers/video');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// YouTube video routes
router.post('/youtube/:courseId', addYouTubeVideo);

// Video management routes
router.get('/course/:courseId', getCourseVideos);
router.get('/:videoId', getVideo);
router.put('/:videoId', updateVideo);
router.delete('/:videoId', deleteVideo);

// Statistics
router.get('/stats', getVideoStats);

module.exports = router; 