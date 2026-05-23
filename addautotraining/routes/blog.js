const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

// Get all published blog posts with pagination
router.get('/posts', blogController.getPosts);

// Get single blog post by slug
router.get('/posts/:slug', blogController.getPostBySlug);

// Get featured blog posts
router.get('/featured', blogController.getFeaturedPosts);

// Get blog categories with post counts
router.get('/categories', blogController.getCategories);

// Search blog posts
router.get('/search/:query', blogController.searchPosts);

// Get recent blog posts
router.get('/recent', blogController.getRecentPosts);

// Add comment to blog post
router.post('/posts/:id/comments', blogController.addComment);

// Get blog settings
router.get('/settings', blogController.getSettings);

module.exports = router;
