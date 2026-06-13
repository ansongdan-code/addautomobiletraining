const adminService = require('../services/adminService');
const { getFileUrl } = require('../middleware/upload');

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parsePotentialJsonFields = (payload) => {
  const updateData = { ...payload };
  for (const key of Object.keys(updateData)) {
    if (typeof updateData[key] !== 'string') continue;
    try {
      updateData[key] = JSON.parse(updateData[key]);
    } catch (error) {
      // Keep original non-JSON string value
    }
  }
  return updateData;
};

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const data = await adminService.getUsers({
      page: parseInteger(req.query.page, 1),
      limit: parseInteger(req.query.limit, 10),
      search: req.query.search || ''
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const data = await adminService.updateUser(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const data = await adminService.getCourses({
      page: parseInteger(req.query.page, 1),
      limit: parseInteger(req.query.limit, 10),
      search: req.query.search || ''
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const data = await adminService.updateCourse(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const data = await adminService.deleteCourse(req.params.id);
    res.json({
      success: true,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

exports.getBlogPosts = async (req, res, next) => {
  try {
    const data = await adminService.getBlogPosts({
      page: parseInteger(req.query.page, 1),
      limit: parseInteger(req.query.limit, 10),
      search: req.query.search || '',
      status: req.query.status || ''
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.createBlogPost = async (req, res, next) => {
  try {
    const featuredImage = req.file ? getFileUrl(req, req.file.filename) : null;
    const data = await adminService.createBlogPost({
      payload: req.body,
      userId: req.user.id,
      featuredImage
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateBlogPost = async (req, res, next) => {
  try {
    const data = await adminService.updateBlogPost(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.deleteBlogPost = async (req, res, next) => {
  try {
    const data = await adminService.deleteBlogPost(req.params.id);
    res.json({
      success: true,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const data = await adminService.getSettings();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const updateData = parsePotentialJsonFields(req.body);

    if (req.files) {
      if (req.files.logo) {
        updateData.logo = getFileUrl(req, req.files.logo[0].filename);
      }
      if (req.files.favicon) {
        updateData.favicon = getFileUrl(req, req.files.favicon[0].filename);
      }
      if (req.files.heroBackground) {
        if (!updateData.hero) {
          updateData.hero = {};
        }
        updateData.hero.backgroundImage = getFileUrl(req, req.files.heroBackground[0].filename);
      }
    }

    const data = await adminService.updateSettings(updateData, req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
