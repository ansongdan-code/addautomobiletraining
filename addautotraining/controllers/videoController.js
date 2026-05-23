const videoService = require('../services/videoService');
const logger = require('../utils/logger');

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

exports.addVideo = async (req, res) => {
  try {
    const video = await videoService.addVideoToCourse({
      courseId: req.params.courseId,
      userId: req.user.id,
      userRole: req.user.role,
      videoData: req.body
    });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    return handleError(res, error, 'Error adding video');
  }
};

exports.getVideosByCourse = async (req, res) => {
  try {
    const videos = await videoService.getVideosByCourse(req.params.courseId);
    res.json({ success: true, data: { videos } });
  } catch (error) {
    return handleError(res, error, 'Error fetching course videos');
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await videoService.getVideoById(req.params.id);
    res.json({ success: true, data: video });
  } catch (error) {
    return handleError(res, error, 'Error fetching video');
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await videoService.updateVideo({
      videoId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role,
      updateData: req.body
    });
    res.json({ success: true, data: video });
  } catch (error) {
    return handleError(res, error, 'Error updating video');
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const data = await videoService.deleteVideo({
      videoId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role
    });
    res.json({ success: true, message: data.message });
  } catch (error) {
    return handleError(res, error, 'Error deleting video');
  }
};

exports.searchVideos = async (req, res) => {
  try {
    const videos = await videoService.searchVideos(req.params.query);
    res.json({ success: true, data: videos });
  } catch (error) {
    return handleError(res, error, 'Error searching videos');
  }
};
