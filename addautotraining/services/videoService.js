const Video = require('../models/Video');
const Course = require('../models/Course');
const HttpError = require('../utils/httpError');
const VideoServiceInterface = require('./interfaces/videoServiceInterface');

class VideoService extends VideoServiceInterface {
  async addVideoToCourse({ courseId, userId, userRole, videoData }) {

    const course = await Course.findById(courseId);
    if (!course) {
      throw new HttpError(404, 'Course not found');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && course.instructor.toString() !== userId) {
      throw new HttpError(403, 'Not authorized to add videos to this course');
    }

    const video = new Video({
      ...videoData,
      course: courseId,
      instructor: userId,
      tags: videoData.tags ? videoData.tags.split(',').map(tag => tag.trim()) : []
    });

    await video.save();
    return video;
  }

  async getVideosByCourse(courseId) {
    return Video.find({ course: courseId })
      .sort({ order: 1 })
      .populate('instructor', 'name');
  }

  async getVideoById(videoId) {
    const video = await Video.findById(videoId)
      .populate('instructor', 'name')
      .populate('course', 'title');

    if (!video) {
      throw new HttpError(404, 'Video not found');
    }

    return video;
  }

  async updateVideo({ videoId, userId, userRole, updateData }) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new HttpError(404, 'Video not found');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && video.instructor.toString() !== userId) {
      throw new HttpError(403, 'Not authorized to update this video');
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      updateData,
      { new: true, runValidators: true }
    );

    return updatedVideo;
  }

  async deleteVideo({ videoId, userId, userRole }) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new HttpError(404, 'Video not found');
    }

    if (userRole !== 'admin' && userRole !== 'super_admin' && video.instructor.toString() !== userId) {
      throw new HttpError(403, 'Not authorized to delete this video');
    }

    await video.deleteOne();
    return { message: 'Video deleted successfully' };
  }

  async searchVideos(query) {
    return Video.find({
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
  }
}

module.exports = new VideoService();
