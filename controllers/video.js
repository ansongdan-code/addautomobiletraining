const Course = require('../models/Course');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept video files only
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  }
});

// @desc    Upload video to course
// @route   POST /api/v1/videos/upload/:courseId
// @access  Private (Instructor/Admin only)
exports.uploadVideo = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, videoType, tags, isPublic } = req.body;

    // Check if course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to upload videos to this course'
      });
    }

    // Handle file upload
    upload.single('video')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No video file uploaded'
        });
      }

      // Create video object
      const videoData = {
        title: title || req.file.originalname,
        description: description || '',
        videoUrl: `/uploads/videos/${req.file.filename}`,
        thumbnailUrl: req.body.thumbnailUrl || 'default-thumbnail.jpg',
        duration: req.body.duration || 0,
        fileSize: req.file.size,
        videoType: videoType || 'lecture',
        isPublic: isPublic === 'true',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        uploadDate: new Date()
      };

      // Add video to course
      course.videos.push(videoData);
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          videoId: course.videos[course.videos.length - 1]._id,
          title: videoData.title,
          videoUrl: videoData.videoUrl,
          fileSize: videoData.fileSize
        }
      });
    });

  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Video upload failed'
    });
  }
};

// @desc    Add YouTube video to course
// @route   POST /api/v1/videos/youtube/:courseId
// @access  Private (Instructor/Admin only)
exports.addYouTubeVideo = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, youtubeUrl, videoType, tags, isPublic } = req.body;

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid YouTube URL'
      });
    }

    // Extract video ID from YouTube URL
    const getYouTubeVideoId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract video ID from YouTube URL'
      });
    }

    // Check if course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add videos to this course'
      });
    }

    // Create video object
    const videoData = {
      title: title || 'Untitled Video',
      description: description || '',
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      youtubeUrl: youtubeUrl,
      youtubeVideoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoType: videoType || 'lecture',
      isPublic: isPublic === 'true',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadDate: new Date(),
      duration: 0, // YouTube doesn't provide duration in embed
      fileSize: 0, // Not applicable for YouTube
      viewCount: 0
    };

    // Add video to course
    course.videos.push(videoData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'YouTube video added successfully',
      data: {
        videoId: course.videos[course.videos.length - 1]._id,
        title: videoData.title,
        videoUrl: videoData.videoUrl,
        thumbnailUrl: videoData.thumbnailUrl,
        youtubeVideoId: videoData.youtubeVideoId
      }
    });

  } catch (error) {
    console.error('YouTube video addition error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add YouTube video'
    });
  }
};

// @desc    Get all videos for a course
// @route   GET /api/v1/videos/course/:courseId
// @access  Private (Enrolled students or instructor)
exports.getCourseVideos = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('instructor', 'name email')
      .select('videos title instructor');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is enrolled or instructor
    const isInstructor = course.instructor._id.toString() === req.user.id;
    const isEnrolled = await require('../models/Enrollment').findOne({
      user: req.user.id,
      course: courseId,
      enrollmentStatus: 'active'
    });

    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view course videos'
      });
    }

    // Filter videos based on user permissions
    let videos = course.videos;
    if (!isInstructor && req.user.role !== 'admin') {
      videos = videos.filter(video => video.isPublic || isEnrolled);
    }

    res.status(200).json({
      success: true,
      data: {
        courseTitle: course.title,
        instructor: course.instructor,
        videos: videos,
        totalVideos: videos.length,
        totalDuration: course.totalDuration
      }
    });

  } catch (error) {
    console.error('Get course videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve course videos'
    });
  }
};

// @desc    Get single video
// @route   GET /api/v1/videos/:videoId
// @access  Private (Enrolled students or instructor)
exports.getVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const course = await Course.findOne({
      'videos._id': videoId
    }).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Check permissions
    const isInstructor = course.instructor._id.toString() === req.user.id;
    const isEnrolled = await require('../models/Enrollment').findOne({
      user: req.user.id,
      course: course._id,
      enrollmentStatus: 'active'
    });

    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this video'
      });
    }

    // Increment view count
    video.viewCount += 1;
    await course.save();

    res.status(200).json({
      success: true,
      data: {
        video: video,
        courseTitle: course.title,
        instructor: course.instructor
      }
    });

  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve video'
    });
  }
};

// @desc    Update video
// @route   PUT /api/v1/videos/:videoId
// @access  Private (Instructor/Admin only)
exports.updateVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { title, description, videoType, tags, isPublic } = req.body;

    const course = await Course.findOne({
      'videos._id': videoId
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Check permissions
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this video'
      });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Update video fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (videoType) video.videoType = videoType;
    if (tags) video.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) video.isPublic = isPublic === 'true';

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });

  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update video'
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/v1/videos/:videoId
// @access  Private (Instructor/Admin only)
exports.deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    const course = await Course.findOne({
      'videos._id': videoId
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Check permissions
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this video'
      });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Delete video file from server
    const videoPath = path.join(__dirname, '..', video.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Remove video from course
    course.videos.pull(videoId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete video'
    });
  }
};

// @desc    Get video statistics
// @route   GET /api/v1/videos/stats
// @access  Private (Admin/Instructor only)
exports.getVideoStats = async (req, res, next) => {
  try {
    const stats = await Course.aggregate([
      {
        $unwind: '$videos'
      },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: '$videos.viewCount' },
          totalDuration: { $sum: '$videos.duration' },
          youtubeVideos: {
            $sum: {
              $cond: [{ $ifNull: ['$videos.youtubeVideoId', false] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalVideos: 0,
        totalViews: 0,
        totalDuration: 0,
        youtubeVideos: 0
      }
    });

  } catch (error) {
    console.error('Get video stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve video statistics'
    });
  }
}; 