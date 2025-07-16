const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const WebsiteSettings = require('../models/WebsiteSettings');

// Get all published blog posts with pagination
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content for list view

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

// Get single blog post by slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get featured blog posts
router.get('/featured', async (req, res) => {
  try {
    const posts = await BlogPost.find({ 
      status: 'published', 
      featured: true 
    })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('-content');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get blog categories with post counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Search blog posts
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const posts = await BlogPost.find({
      $text: { $search: query },
      status: 'published'
    })
      .populate('author', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .select('-content');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error searching blog posts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get recent blog posts
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const posts = await BlogPost.find({ status: 'published' })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug excerpt publishedAt author readTime');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Add comment to blog post
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { name, email, website, content } = req.body;
    
    if (!name || !email || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and content are required'
      });
    }

    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    const commentData = {
      author: { name, email, website },
      content,
      approved: false // Comments need approval
    };

    await post.addComment(commentData);

    res.json({
      success: true,
      message: 'Comment submitted successfully and is awaiting approval'
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get blog settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await WebsiteSettings.getSettings();
    res.json({
      success: true,
      data: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        logo: settings.logo,
        socialMedia: settings.socialMedia
      }
    });
  } catch (error) {
    console.error('Error fetching blog settings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
