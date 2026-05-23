const websiteEditorService = require('../services/websiteEditorService');
const logger = require('../utils/logger');
const { protect } = require('../middleware/auth');

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

exports.getPages = async (req, res) => {
  try {
    const pages = await websiteEditorService.getPages();
    res.json({ success: true, data: pages });
  } catch (error) {
    return handleError(res, error, 'Error fetching pages');
  }
};

exports.getPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const isPreview = req.query.preview === 'true';

    if (isPreview) {
      return protect(req, res, async () => {
        try {
          const page = await websiteEditorService.getPageBySlug(slug, true, req.user);
          res.json({ success: true, data: page });
        } catch (err) {
          return handleError(res, err, 'Error fetching page (preview)');
        }
      });
    }

    const page = await websiteEditorService.getPageBySlug(slug);
    res.json({ success: true, data: page });
  } catch (error) {
    return handleError(res, error, 'Error fetching page');
  }
};

exports.getEditorPages = async (req, res) => {
  try {
    const pages = await websiteEditorService.getEditorPages();
    res.json({ success: true, data: pages });
  } catch (error) {
    return handleError(res, error, 'Error fetching editor pages');
  }
};

exports.createPage = async (req, res) => {
  try {
    const page = await websiteEditorService.createPage(req.body, req.user.id);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    return handleError(res, error, 'Error creating page');
  }
};

exports.updatePage = async (req, res) => {
  try {
    const page = await websiteEditorService.updatePage(req.params.id, req.body);
    res.json({ success: true, data: page });
  } catch (error) {
    return handleError(res, error, 'Error updating page');
  }
};

exports.deletePage = async (req, res) => {
  try {
    const data = await websiteEditorService.deletePage(req.params.id);
    res.json({ success: true, message: data.message });
  } catch (error) {
    return handleError(res, error, 'Error deleting page');
  }
};
