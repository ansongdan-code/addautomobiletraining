const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Video title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Video description cannot be more than 1000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  youtubeUrl: {
    type: String,
    required: [true, 'YouTube URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(v);
      },
      message: 'Please enter a valid YouTube URL'
    }
  },
  youtubeId: {
    type: String,
    required: [true, 'YouTube ID is required']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  videoType: {
    type: String,
    enum: ['lecture', 'demonstration', 'tutorial', 'review', 'assessment', 'introduction', 'conclusion'],
    default: 'lecture'
  },
  order: {
    type: Number,
    required: [true, 'Video order is required'],
    min: [1, 'Order must be at least 1']
  },
  module: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      reply: {
        type: String,
        required: [true, 'Reply is required'],
        maxlength: [300, 'Reply cannot be more than 300 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  quality: {
    type: String,
    enum: ['240p', '360p', '480p', '720p', '1080p', '1440p', '2160p'],
    default: '720p'
  },
  language: {
    type: String,
    default: 'en'
  },
  subtitles: [{
    language: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  resources: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'link', 'image', 'other'],
      required: true
    },
    size: {
      type: Number // in bytes
    }
  }],
  quiz: {
    enabled: {
      type: Boolean,
      default: false
    },
    questions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number,
        required: true
      },
      explanation: {
        type: String
      }
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  },
  analytics: {
    avgWatchTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    dropOffPoints: [Number],
    userInteractions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      watchTime: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      },
      lastWatched: {
        type: Date,
        default: Date.now
      },
      bookmarks: [{
        time: Number,
        note: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }]
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted duration
videoSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for comment count
videoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Indexes for performance
videoSchema.index({ course: 1, order: 1 });
videoSchema.index({ instructor: 1 });
videoSchema.index({ videoType: 1 });
videoSchema.index({ isPublic: 1 });
videoSchema.index({ isActive: 1 });
videoSchema.index({ uploadDate: -1 });
videoSchema.index({ viewCount: -1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Method to extract YouTube ID from URL
videoSchema.methods.extractYouTubeId = function() {
  const url = this.youtubeUrl;
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Pre-save middleware to set YouTube ID and thumbnail
videoSchema.pre('save', function(next) {
  if (this.isModified('youtubeUrl')) {
    this.youtubeId = this.extractYouTubeId();
    if (this.youtubeId) {
      this.thumbnailUrl = `https://img.youtube.com/vi/${this.youtubeId}/maxresdefault.jpg`;
    }
  }
  
  if (this.isModified('comments') || this.isModified('analytics.userInteractions')) {
    this.lastModified = new Date();
  }
  
  next();
});

// Method to increment view count
videoSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to add user interaction
videoSchema.methods.addUserInteraction = function(userId, watchTime, completed) {
  const existingInteraction = this.analytics.userInteractions.find(
    interaction => interaction.user.toString() === userId.toString()
  );
  
  if (existingInteraction) {
    existingInteraction.watchTime = Math.max(existingInteraction.watchTime, watchTime);
    existingInteraction.completed = completed;
    existingInteraction.lastWatched = new Date();
  } else {
    this.analytics.userInteractions.push({
      user: userId,
      watchTime,
      completed,
      lastWatched: new Date()
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Video', videoSchema);
