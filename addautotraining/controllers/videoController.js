const videoService = require('../services/videoService');

exports.addVideo = async (req, res, next) => {
  try {
    const video = await videoService.addVideoToCourse({
      courseId: req.params.courseId,
      userId: req.user.id,
      userRole: req.user.role,
      videoData: req.body
    });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

exports.getVideosByCourse = async (req, res, next) => {
  try {
    const videos = await videoService.getVideosByCourse(req.params.courseId);
    res.json({ success: true, data: { videos } });
  } catch (error) {
    next(error);
  }
};

exports.getVideo = async (req, res, next) => {
  try {
    const video = await videoService.getVideoById(req.params.id);
    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

exports.updateVideo = async (req, res, next) => {
  try {
    const video = await videoService.updateVideo({
      videoId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role,
      updateData: req.body
    });
    res.json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const data = await videoService.deleteVideo({
      videoId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role
    });
    res.json({ success: true, message: data.message });
  } catch (error) {
    next(error);
  }
};

exports.searchVideos = async (req, res, next) => {
  try {
    const videos = await videoService.searchVideos(req.params.query);
    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};
