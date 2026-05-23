const blogService = require('../services/blogService');
const logger = require('../utils/logger');

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const handleError = (res, error, context) => {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    logger.error(`${context}: ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${context}: ${error.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Server error' : error.message
  });
};

exports.getPosts = async (req, res) => {
  try {
    const data = await blogService.getPublishedPosts({
      page: parseInteger(req.query.page, 1),
      limit: parseInteger(req.query.limit, 10),
      category: req.query.category || '',
      search: req.query.search || ''
    });

    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching blog posts');
  }
};

exports.getPostBySlug = async (req, res) => {
  try {
    const data = await blogService.getPostBySlug(req.params.slug);
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching blog post');
  }
};

exports.getFeaturedPosts = async (req, res) => {
  try {
    const data = await blogService.getFeaturedPosts();
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching featured posts');
  }
};

exports.getCategories = async (req, res) => {
  try {
    const data = await blogService.getCategories();
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching blog categories');
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const data = await blogService.searchPosts(req.params.query);
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error searching blog posts');
  }
};

exports.getRecentPosts = async (req, res) => {
  try {
    const limit = parseInteger(req.query.limit, 5);
    const data = await blogService.getRecentPosts(limit);
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching recent posts');
  }
};

exports.addComment = async (req, res) => {
  try {
    await blogService.addComment(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Comment submitted successfully and is awaiting approval'
    });
  } catch (error) {
    return handleError(res, error, 'Error adding comment');
  }
};

exports.getSettings = async (req, res) => {
  try {
    const data = await blogService.getBlogSettings();
    res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error, 'Error fetching blog settings');
  }
};
