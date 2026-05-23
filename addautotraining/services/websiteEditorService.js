const WebPage = require('../models/WebPage');
const HttpError = require('../utils/httpError');

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
  let sanitized = css
    .replace(/<\/(style)>/gi, '')
    .replace(/<style[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/import\s+/gi, '')
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(')
    .replace(/url\s*\(\s*["']?\s*vbscript:/gi, 'url(')
    .replace(/url\s*\(\s*["']?\s*data:\s*text\/html/gi, 'url(');

  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  return sanitized;
};

class WebsiteEditorService {
  async getPages() {
    return WebPage.find({ isPublished: true })
      .select('-customCSS -customJavaScript')
      .populate('author', 'name email');
  }

  async getPageBySlug(slug, isPreview = false, user = null) {
    const query = isPreview ? { slug } : { slug, isPublished: true };
    const page = await WebPage.findOne(query).populate('author', 'name email');

    if (!page) {
      throw new HttpError(404, 'Page not found');
    }

    if (isPreview && !page.isPublished && !(user?.role === 'super_admin' || user?.role === 'admin')) {
      throw new HttpError(403, 'Not allowed to preview this page');
    }

    page.content = sanitizeHTML(page.content);
    page.customCSS = sanitizeCSS(page.customCSS);
    page.customJavaScript = ''; // Disabled for security

    return page;
  }

  async getEditorPages() {
    return WebPage.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
  }

  async createPage(pageData, userId) {
    const normalizedSlug = pageData.slug.toLowerCase().trim();
    const existingPage = await WebPage.findOne({ slug: normalizedSlug });

    if (existingPage) {
      throw new HttpError(400, 'Slug already exists');
    }

    const newPage = new WebPage({
      ...pageData,
      title: String(pageData.title).replace(/[<>]/g, ''),
      slug: normalizedSlug,
      content: sanitizeHTML(pageData.content),
      description: String(pageData.description || '').replace(/[<>]/g, ''),
      customCSS: sanitizeCSS(pageData.customCSS) || '',
      customJavaScript: '',
      author: userId
    });

    await newPage.save();
    return newPage;
  }

  async updatePage(id, pageData) {
    const page = await WebPage.findById(id);
    if (!page) {
      throw new HttpError(404, 'Page not found');
    }

    if (pageData.slug && pageData.slug !== page.slug) {
      const existingPage = await WebPage.findOne({ slug: pageData.slug.toLowerCase().trim() });
      if (existingPage) {
        throw new HttpError(400, 'Slug already in use');
      }
    }

    Object.assign(page, {
      ...pageData,
      title: pageData.title ? String(pageData.title).replace(/[<>]/g, '') : page.title,
      slug: pageData.slug ? pageData.slug.toLowerCase().trim() : page.slug,
      content: pageData.content ? sanitizeHTML(pageData.content) : page.content,
      customCSS: pageData.customCSS !== undefined ? sanitizeCSS(pageData.customCSS) : page.customCSS,
      customJavaScript: ''
    });

    await page.save();
    return page;
  }

  async deletePage(id) {
    const page = await WebPage.findByIdAndDelete(id);
    if (!page) {
      throw new HttpError(404, 'Page not found');
    }
    return { message: 'Page deleted successfully' };
  }
}

module.exports = new WebsiteEditorService();
