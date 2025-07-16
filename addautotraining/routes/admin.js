const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { protect, isAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadFields, getFileUrl, handleUploadError } = require('../middleware/upload');

const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const BlogPost = require('../models/BlogPost');
const WebsiteSettings = require('../models/WebsiteSettings');

// Dashboard stats
router.get('/dashboard', [protect, isAdmin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalBlogPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    const totalEnrollments = await Course.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$enrolledStudents' } } } }
    ]);
    
    const stats = {
      totalUsers,
      totalCourses,
      totalVideos,
      totalBlogPosts,
      publishedPosts,
      totalEnrollments: totalEnrollments[0]?.total || 0,
      totalRevenue: 0
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all users with pagination
router.get('/users', [protect, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update user
router.put('/users/:id', [protect, isAdmin], async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all courses with pagination
router.get('/courses', [protect, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update course
router.put('/courses/:id', [protect, isAdmin], async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete course
router.delete('/courses/:id', [protect, isAdmin], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    await course.deleteOne();
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Blog management routes
router.get('/blog/posts', [protect, isAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create blog post
router.post('/blog/posts', [
  protect,
  isAdmin,
  uploadSingle('featuredImage'),
  [
    check('title', 'Post title is required').not().isEmpty(),
    check('excerpt', 'Post excerpt is required').not().isEmpty(),
    check('content', 'Post content is required').not().isEmpty(),
    check('category', 'Post category is required').not().isEmpty()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const postData = {
      ...req.body,
      author: req.user.id,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    };

    if (req.file) {
      postData.featuredImage = getFileUrl(req, req.file.filename);
    }

    const post = new BlogPost(postData);
    await post.save();

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update blog post
router.put('/blog/posts/:id', [protect, isAdmin], async (req, res) => {
  try {
    const postData = {
      ...req.body,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    };

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      postData,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete blog post
router.delete('/blog/posts/:id', [protect, isAdmin], async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    await post.deleteOne();
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Website settings routes
router.get('/settings', [protect, isAdmin], async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update website settings
router.put('/settings', [
  protect,
  isAdmin,
  uploadFields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'heroBackground', maxCount: 1 }
  ])
], async (req, res) => {
  try {
    const updateData = req.body;

    // Handle file uploads
    if (req.files) {
      if (req.files.logo) {
        updateData.logo = getFileUrl(req, req.files.logo[0].filename);
      }
      if (req.files.favicon) {
        updateData.favicon = getFileUrl(req, req.files.favicon[0].filename);
      }
      if (req.files.heroBackground) {
        updateData['hero.backgroundImage'] = getFileUrl(req, req.files.heroBackground[0].filename);
      }
    }

    const settings = await WebsiteSettings.updateSettings(updateData, req.user.id);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating website settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Analytics route
router.get('/analytics', [protect, isAdmin], async (req, res) => {
  try {
    const topCourses = await Course.aggregate([
      { $project: { 
          title: 1, 
          enrollments: { $size: '$enrolledStudents' } 
        } 
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 }
    ]);

    const revenueData = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.paymentStatus': 'paid' } },
      { $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$enrolledStudents.enrolledAt' }
          },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: {
        topCourses,
        revenueData
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Upload error handler
router.use(handleUploadError);

module.exports = router;
