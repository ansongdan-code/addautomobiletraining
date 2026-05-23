const express = require('express');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const WebPage = require('../models/WebPage');
const WebsiteSettings = require('../models/WebsiteSettings');

const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"][\s\S]*?['"])/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
};

const sanitizeCSS = (css) => {
  if (!css || typeof css !== 'string') return '';
  return css
    .replace(/<\/(style)>/gi, '')
    .replace(/<style[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/import\s+/gi, '')
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(')
    .replace(/url\s*\(\s*["']?\s*vbscript:/gi, 'url(')
    .replace(/url\s*\(\s*["']?\s*data:\s*text\/html/gi, 'url(');
};

// ============= PREVIEW ENDPOINT =============

// Get page for preview
router.get('/page/:slug', async (req, res) => {
    try {
        const page = await WebPage.findOne({ slug: req.params.slug });

        if (!page || !page.isPublished) {
            return res.status(404).json({ success: false, error: 'Page not found or not published' });
        }

        const settings = await WebsiteSettings.findOne();
        const fontFamily = settings && settings.theme ? String(settings.theme.fontFamily).replace(/["'<>]/g, '') : 'Arial, sans-serif';

        // This is a simplified HTML generation. In a real app, you'd use a templating engine.
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.title}</title>
        <style>
          body {
            font-family: ${fontFamily};
          }
        </style>
        <style>${sanitizeCSS(page.customCSS)}</style>
      </head>
      <body>
        ${sanitizeHTML(page.content)}
      </body>
      </html>
    `;
        res.send(html);
    } catch (error) {
        res.status(500).send('<h1>Error loading page</h1>');
    }
});

// Middleware: Only admin and super_admin can access
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// ============= PAGE ENDPOINTS =============

// Get all pages
router.get('/app/pages', async (req, res) => {
  try {
    // For super_admin, show all pages. For admin, show only their pages
    const query = req.user.role === 'super_admin' 
      ? {} 
      : { author: req.user.id };
    const appPages = await WebPage.find(query).populate('author', 'name email');
    res.json({
      success: true,
      data: appPages,
      total: appPages.length
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pages'
    });
  }
});

// Get single page
router.get('/app/pages/:id', async (req, res) => {
  try {
    const page = await WebPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    // Ensure the user is authorized to view this page
    if (page.author.toString() !== req.user.id && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Not authorized to view this page' });
    }
    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page'
    });
  }
});

// Create new page
router.post('/app/pages', async (req, res) => {
  try {
    const { name, slug, title, description, layout, icon, isPublished } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Name and slug are required'
      });
    }

    // Check for duplicate slug
    const existingPage = await WebPage.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    const newPage = new WebPage({
      name: name || title || 'Untitled Page',
      slug,
      title: title || name || 'Untitled Page',
      description: description || '',
      layout: layout || 'standard',
      icon: icon || '📄',
      isPublished: isPublished || false,
      author: req.user.id,
      components: [],
      content: '<p>Welcome to this page</p>'
    });

    await newPage.save();

    res.status(201).json({
      success: true,
      data: newPage,
      message: 'Page created successfully'
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create page'
    });
  }
});

// Update page
router.put('/app/pages/:id', async (req, res) => {
  try {
    let page = await WebPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    // Ensure the user is authorized to edit this page
    if (page.author.toString() !== req.user.id && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Not authorized to edit this page' });
    }

    page = await WebPage.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.json({
      success: true,
      data: page,
      message: 'Page updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update page'
    });
  }
});

// Delete page
router.delete('/app/pages/:id', authorize('super_admin'), async (req, res) => {
  try {
    const page = await WebPage.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    await WebPage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete page'
    });
  }
});

// ============= STYLES ENDPOINTS =============

// Get global styles
router.get('/app/styles', async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new WebsiteSettings();
      await settings.save();
    }
    
    // Ensure theme object exists with defaults
    if (!settings.theme || typeof settings.theme !== 'object') {
      settings.theme = {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        primaryColor: '#2196F3',
        secondaryColor: '#FFC107',
        accentColor: '#f093fb',
        backgroundColor: '#FFFFFF',
        textColor: '#333333',
        borderRadius: '8px'
      };
    }

    // Ensure all theme fields have values
    const theme = {
      fontFamily: settings.theme.fontFamily || 'Arial, sans-serif',
      fontSize: settings.theme.fontSize || '16px',
      primaryColor: settings.theme.primaryColor || '#2196F3',
      secondaryColor: settings.theme.secondaryColor || '#FFC107',
      accentColor: settings.theme.accentColor || '#f093fb',
      backgroundColor: settings.theme.backgroundColor || '#FFFFFF',
      textColor: settings.theme.textColor || '#333333',
      borderRadius: settings.theme.borderRadius || '8px'
    };

    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    console.error('[App Editor] Error fetching styles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch styles'
    });
  }
});

// Update global styles
router.put('/app/styles', async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
        settings = new WebsiteSettings();
    }
    
    // Update all theme fields from request body, with defaults as fallback
    const themeUpdate = {
      fontFamily: req.body.fontFamily !== undefined ? req.body.fontFamily : (settings.theme?.fontFamily || 'Arial, sans-serif'),
      fontSize: req.body.fontSize !== undefined ? req.body.fontSize : (settings.theme?.fontSize || '16px'),
      primaryColor: req.body.primaryColor !== undefined ? req.body.primaryColor : (settings.theme?.primaryColor || '#2196F3'),
      secondaryColor: req.body.secondaryColor !== undefined ? req.body.secondaryColor : (settings.theme?.secondaryColor || '#FFC107'),
      accentColor: req.body.accentColor !== undefined ? req.body.accentColor : (settings.theme?.accentColor || '#f093fb'),
      backgroundColor: req.body.backgroundColor !== undefined ? req.body.backgroundColor : (settings.theme?.backgroundColor || '#FFFFFF'),
      textColor: req.body.textColor !== undefined ? req.body.textColor : (settings.theme?.textColor || '#333333'),
      borderRadius: req.body.borderRadius !== undefined ? req.body.borderRadius : (settings.theme?.borderRadius || '8px')
    };
    
    // If settings.theme doesn't exist, initialize it
    if (!settings.theme || typeof settings.theme !== 'object') {
      settings.theme = {};
    }
    
    // Merge the update
    settings.theme = { ...settings.theme, ...themeUpdate };
    
    // Ensure stats is an array, not a string
    if (!settings.stats || !Array.isArray(settings.stats)) {
      settings.stats = [];
    }
    
    const updatedSettings = await settings.save();

    res.json({
      success: true,
      data: updatedSettings.theme,
      message: 'Styles updated successfully'
    });
  } catch (error) {
    console.error('[App Editor] Error saving styles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update styles',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ============= COMPONENT ENDPOINTS =============

// Add component to page
router.post('/app/pages/:pageId/components', async (req, res) => {
    try {
        const page = await WebPage.findById(req.params.pageId);
        if (!page) {
            return res.status(404).json({ success: false, error: 'Page not found' });
        }

        if (page.author.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to edit this page' });
        }

        const component = {
            _id: new mongoose.Types.ObjectId(),
            ...req.body,
        };

        // Use components array if it exists, otherwise initialize it
        const components = Array.isArray(page.components) ? page.components : [];
        // Ensure component has an id field that matches _id for frontend compatibility
        if (!component.id && component._id) {
          component.id = component._id.toString();
        }
        components.push(component);
        page.components = components;

        await page.save();

        res.status(201).json({
            success: true,
            data: component,
            message: 'Component added successfully'
        });
    } catch (error) {
        console.error('Error adding component:', error);
        res.status(500).json({ success: false, error: 'Failed to add component' });
    }
});

// Delete component from page
router.delete('/app/pages/:pageId/components/:componentId', async (req, res) => {
    try {
        const page = await WebPage.findById(req.params.pageId);
        if (!page) {
            return res.status(404).json({ success: false, error: 'Page not found' });
        }

        if (page.author.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to edit this page' });
        }

        // Use components array if it exists
        const components = page.components || [];
        page.components = components.filter(c => {
            const compId = c._id ? c._id.toString() : (c.id || '');
            return compId !== req.params.componentId;
        });

        await page.save();

        res.json({
            success: true,
            message: 'Component deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting component:', error);
        res.status(500).json({ success: false, error: 'Failed to delete component' });
    }
});

module.exports = router;
