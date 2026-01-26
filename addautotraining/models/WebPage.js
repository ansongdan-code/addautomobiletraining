const mongoose = require('mongoose');

const webPageSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: function() {
      return this.name || 'Untitled Page';
    }
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
    default: '<p>Welcome to this page</p>'
  },
  description: {
    type: String,
    maxlength: [500, 'Page description cannot exceed 500 characters']
  },
  layout: {
    type: String,
    enum: ['standard', 'landing', 'blog', 'gallery'],
    default: 'standard'
  },
  icon: {
    type: String,
    default: '📄'
  },
  components: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
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
