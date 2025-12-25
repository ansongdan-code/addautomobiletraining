const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const WebPage = require('../models/WebPage');

// Middleware to ensure only super_admin can edit website
const isSuperAdmin = (req, res, next) => {
  console.log('[SuperAdmin Check] User role:', req.user?.role, 'Check result:', req.user?.role === 'super_admin');
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Only super admin can edit website pages'
    });
  }
  next();
};

// Get all pages (public)
router.get('/pages', async (req, res) => {
  try {
    const pages = await WebPage.find({ isPublished: true })
      .select('-customCSS -customJavaScript')
      .populate('author', 'name email');
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get single page by slug (public)
router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await WebPage.findOne({ slug: req.params.slug })
      .populate('author', 'name email');
    
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all pages for editor (super admin only)
router.get('/editor/pages', [protect, isSuperAdmin], async (req, res) => {
  try {
    const pages = await WebPage.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Create new page (super admin only)
router.post('/editor/pages', [protect, isSuperAdmin], async (req, res) => {
  try {
    const { title, slug, content, description, customCSS, customJavaScript, seoTitle, seoDescription, seoKeywords } = req.body;

    // Validate required fields
    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title, slug, and content are required'
      });
    }

    // Check if slug already exists
    const existingPage = await WebPage.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    const newPage = new WebPage({
      title,
      slug: slug.toLowerCase().trim(),
      content,
      description,
      customCSS: customCSS || '',
      customJavaScript: customJavaScript || '',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || description,
      seoKeywords: seoKeywords || [],
      author: req.user.id
    });

    await newPage.save();

    res.status(201).json({
      success: true,
      data: newPage
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// Update page (super admin only)
router.put('/editor/pages/:id', [protect, isSuperAdmin], async (req, res) => {
  try {
    const { title, slug, content, description, isPublished, customCSS, customJavaScript, seoTitle, seoDescription, seoKeywords, headerImage } = req.body;

    let page = await WebPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    // Check if new slug conflicts with existing page (but allow same page)
    if (slug && slug !== page.slug) {
      const existingPage = await WebPage.findOne({ slug: slug.toLowerCase().trim() });
      if (existingPage) {
        return res.status(400).json({
          success: false,
          error: 'Slug already in use'
        });
      }
    }

    page.title = title || page.title;
    page.slug = slug ? slug.toLowerCase().trim() : page.slug;
    page.content = content || page.content;
    page.description = description || page.description;
    page.isPublished = isPublished !== undefined ? isPublished : page.isPublished;
    page.customCSS = customCSS !== undefined ? customCSS : page.customCSS;
    page.customJavaScript = customJavaScript !== undefined ? customJavaScript : page.customJavaScript;
    page.seoTitle = seoTitle || page.seoTitle;
    page.seoDescription = seoDescription || page.seoDescription;
    page.seoKeywords = seoKeywords || page.seoKeywords;
    page.headerImage = headerImage !== undefined ? headerImage : page.headerImage;

    await page.save();

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

// Delete page (super admin only)
router.delete('/editor/pages/:id', [protect, isSuperAdmin], async (req, res) => {
  try {
    const page = await WebPage.findByIdAndDelete(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Publish/Unpublish page (super admin only)
router.put('/editor/pages/:id/publish', [protect, isSuperAdmin], async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    const page = await WebPage.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error updating page status:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
