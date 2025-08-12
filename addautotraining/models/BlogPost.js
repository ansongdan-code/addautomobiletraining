const mongoose = require('mongoose');
const slugify = require('slugify');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Blog post excerpt is required'],
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog post content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['maintenance', 'technology', 'safety', 'tips', 'news', 'tutorial', 'review', 'industry'],
    default: 'maintenance'
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    default: null
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    author: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      website: String
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    approved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      author: {
        name: String,
        email: String
      },
      content: {
        type: String,
        required: true,
        maxlength: [500, 'Reply cannot be more than 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    focusKeyword: String,
    keywords: [String]
  },
  publishedAt: {
    type: Date,
    default: null
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  }],
  readingProgress: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  socialShares: {
    facebook: {
      type: Number,
      default: 0
    },
    twitter: {
      type: Number,
      default: 0
    },
    linkedin: {
      type: Number,
      default: 0
    },
    whatsapp: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment count
blogPostSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.approved).length;
});

// Virtual for total social shares
blogPostSchema.virtual('totalShares').get(function() {
  return this.socialShares.facebook + this.socialShares.twitter + 
         this.socialShares.linkedin + this.socialShares.whatsapp;
});

// Indexes for performance and search
blogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

blogPostSchema.index({ category: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ featured: -1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ views: -1 });
blogPostSchema.index({ author: 1 });

// Pre-save middleware to generate slug
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  if (this.isModified('content')) {
    // Calculate reading time (average 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.lastModified = new Date();
  next();
});

// Method to increment view count
blogPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add comment
blogPostSchema.methods.addComment = function(commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to approve comment
blogPostSchema.methods.approveComment = function(commentId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.approved = true;
    return this.save();
  }
  return false;
};

// Static method to get published posts
blogPostSchema.statics.getPublished = function() {
  return this.find({ status: 'published' })
    .populate('author', 'name')
    .sort({ publishedAt: -1 });
};

// Static method to get featured posts
blogPostSchema.statics.getFeatured = function() {
  return this.find({ status: 'published', featured: true })
    .populate('author', 'name')
    .sort({ publishedAt: -1 });
};

// Static method to search posts
blogPostSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  })
    .populate('author', 'name')
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('BlogPost', blogPostSchema);
