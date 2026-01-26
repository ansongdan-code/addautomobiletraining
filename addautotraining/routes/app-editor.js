const express = require('express');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();
const WebPage = require('../models/WebPage');
const WebsiteSettings = require('../models/WebsiteSettings');

// ============= PREVIEW ENDPOINT =============

// Get page for preview
router.get('/page/:slug', async (req, res) => {
    try {
        const page = await WebPage.findOne({ slug: req.params.slug });

        if (!page || !page.isPublished) {
            return res.status(404).json({ success: false, error: 'Page not found or not published' });
        }

        const settings = await WebsiteSettings.findOne();

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
            font-family: ${settings && settings.theme ? settings.theme.fontFamily : 'Arial, sans-serif'};
          }
        </style>
        <style>${page.customCSS}</style>
      </head>
      <body>
        ${page.content}
        <script>${page.customJavaScript}</script>
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
        primaryColor: '#2196F3',
        secondaryColor: '#FFC107',
        backgroundColor: '#FFFFFF',
        textColor: '#333333'
      };
    }
    
    res.json({
      success: true,
      data: settings.theme
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
    console.log('[App Editor] Saving styles:', req.body);
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
        console.log('[App Editor] Creating new WebsiteSettings document');
        settings = new WebsiteSettings();
    }
    
    // Only update theme fields that exist in the model
    const themeUpdate = {
      fontFamily: req.body.fontFamily || settings.theme?.fontFamily || 'Arial, sans-serif',
      primaryColor: req.body.primaryColor || settings.theme?.primaryColor || '#2196F3',
      secondaryColor: req.body.secondaryColor || settings.theme?.secondaryColor || '#FFC107',
      backgroundColor: req.body.backgroundColor || settings.theme?.backgroundColor || '#FFFFFF',
      textColor: req.body.textColor || settings.theme?.textColor || '#333333'
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
    
    console.log('[App Editor] Updated theme:', settings.theme);
    await settings.save();
    console.log('[App Editor] Settings saved successfully');

    res.json({
      success: true,
      data: settings.theme,
      message: 'Styles updated successfully'
    });
  } catch (error) {
    console.error('[App Editor] Error saving styles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update styles'
    });
  }
});

// ============= COMPONENT ENDPOINTS =============

// Add component to page
router.post('/app/pages/:pageId/components', async (req, res) => {
    try {
        console.log('Adding component to page:', req.params.pageId);
        const page = await WebPage.findById(req.params.pageId);
        if (!page) {
            console.log('Page not found');
            return res.status(404).json({ success: false, error: 'Page not found' });
        }
        console.log('Page found:', page.name || page.title);

        if (page.author.toString() !== req.user.id && req.user.role !== 'super_admin') {
            console.log('User not authorized');
            return res.status(403).json({ success: false, error: 'Not authorized to edit this page' });
        }

        const component = {
            _id: new mongoose.Types.ObjectId(),
            ...req.body,
        };
        console.log('New component:', component);

        // Use components array if it exists, otherwise initialize it
        const components = Array.isArray(page.components) ? page.components : [];
        // Ensure component has an id field that matches _id for frontend compatibility
        if (!component.id && component._id) {
          component.id = component._id.toString();
        }
        components.push(component);
        page.components = components;
        console.log('Updated components:', page.components.length);

        await page.save();
        console.log('Page saved');

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

// ============= PREVIEW ENDPOINT =============

// Get page for preview
router.get('/page/:slug', async (req, res) => {
    try {
        const page = await WebPage.findOne({ slug: req.params.slug });

        if (!page || !page.isPublished) {
            return res.status(404).json({ success: false, error: 'Page not found or not published' });
        }

        const settings = await WebsiteSettings.findOne();

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
            font-family: ${settings && settings.theme ? settings.theme.fontFamily : 'Arial, sans-serif'};
          }
        </style>
        <style>${page.customCSS}</style>
      </head>
      <body>
        ${page.content}
        <script>${page.customJavaScript}</script>
      </body>
      </html>
    `;
        res.send(html);
    } catch (error) {
        res.status(500).send('<h1>Error loading page</h1>');
    }
});

module.exports = router;
