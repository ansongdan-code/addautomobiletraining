const mongoose = require('mongoose');

const webPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Page title is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Page slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Page content is required'],
    default: '<p>Welcome to this page</p>'
  },
  description: {
    type: String,
    maxlength: [500, 'Page description cannot exceed 500 characters']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isHomePage: {
    type: Boolean,
    default: false
  },
  customCSS: {
    type: String,
    default: ''
  },
  customJavaScript: {
    type: String,
    default: ''
  },
  seoTitle: {
    type: String,
    default: ''
  },
  seoDescription: {
    type: String,
    default: ''
  },
  seoKeywords: [{
    type: String
  }],
  headerImage: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
webPageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WebPage', webPageSchema);
