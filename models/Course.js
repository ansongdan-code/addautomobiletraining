const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a video title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a video description'],
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL'],
  },
  thumbnailUrl: {
    type: String,
    default: 'default-thumbnail.jpg',
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  fileSize: {
    type: Number, // in bytes
    default: 0,
  },
  videoType: {
    type: String,
    enum: ['lecture', 'demonstration', 'tutorial', 'review', 'assessment'],
    default: 'lecture',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  tags: [String],
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  image: {
    type: String,
    default: 'no-photo.jpg',
  },
  videos: [VideoSchema],
  totalDuration: {
    type: Number, // total duration of all videos in seconds
    default: 0,
  },
  videoCount: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['engine', 'diagnostic', 'electrical', 'transmission', 'brakes', 'suspension', 'general'],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total duration and video count
  if (this.videos && this.videos.length > 0) {
    this.totalDuration = this.videos.reduce((total, video) => total + (video.duration || 0), 0);
    this.videoCount = this.videos.length;
  }
  
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
