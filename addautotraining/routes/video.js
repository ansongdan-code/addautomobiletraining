const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, isAdmin, isInstructor } = require('../middleware/auth');
const Video = require('../models/Video');
const Course = require('../models/Course');

// Add YouTube video to course
router.post('/youtube/:courseId', [
  protect,
  isInstructor,
  [
    check('title', 'Video title is required').not().isEmpty(),
    check('youtubeUrl', 'YouTube URL is required').not().isEmpty(),
    check('order', 'Video order is required').isInt({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { courseId } = req.params;
    const { title, description, youtubeUrl, videoType, tags, isPublic, order } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is admin or instructor of the course
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add videos to this course'
      });
    }

    // Create video
    const video = new Video({
      title,
      description,
      course: courseId,
      instructor: req.user.id,
      youtubeUrl,
      videoType,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic,
      order
    });

    await video.save();

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get videos for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const videos = await Video.find({ course: courseId })
      .sort({ order: 1 })
      .populate('instructor', 'name');

    res.json({
      success: true,
      data: { videos }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update video
router.put('/:id', [protect, isInstructor], async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Check if user is admin or instructor of the video
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && video.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this video'
      });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedVideo
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete video
router.delete('/:id', [protect, isInstructor], async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Check if user is admin or instructor of the video
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && video.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this video'
      });
    }

    await video.remove();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get single video
router.get('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('instructor', 'name')
      .populate('course', 'title');

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Search videos
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const videos = await Video.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      isPublic: true,
      isActive: true
    })
      .populate('instructor', 'name')
      .populate('course', 'title')
      .sort({ viewCount: -1 });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
