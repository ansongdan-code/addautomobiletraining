const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const websiteEditorController = require('../controllers/websiteEditorController');

// Get all pages (public)
router.get('/pages', websiteEditorController.getPages);

// Get single page by slug (public)
router.get('/pages/:slug', websiteEditorController.getPage);

// Get all pages for editor (admin or super admin)
router.get('/editor/pages', [protect, isAdmin], websiteEditorController.getEditorPages);

// Create new page (admin or super admin)
router.post('/editor/pages', [protect, isAdmin], websiteEditorController.createPage);

// Update page (admin or super admin)
router.put('/editor/pages/:id', [protect, isAdmin], websiteEditorController.updatePage);

// Delete page (admin or super admin)
router.delete('/editor/pages/:id', [protect, isAdmin], websiteEditorController.deletePage);

module.exports = router;


module.exports = router;
