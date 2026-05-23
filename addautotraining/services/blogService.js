const BlogPost = require('../models/BlogPost');
const WebsiteSettings = require('../models/WebsiteSettings');
const HttpError = require('../utils/httpError');

class BlogService {
  async getPublishedPosts({ page = 1, limit = 10, category = '', search = '' }) {
    const query = { status: 'published' };

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

    const skip = (page - 1) * limit;
    const posts = await BlogPost.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content');

    const total = await BlogPost.countDocuments(query);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPostBySlug(slug) {
    const post = await BlogPost.findOne({ slug, status: 'published' })
      .populate('author', 'name');

    if (!post) {
      throw new HttpError(404, 'Blog post not found');
    }

    await post.incrementViews();
    return post;
  }

  async getFeaturedPosts() {
    return BlogPost.find({ status: 'published', featured: true })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('-content');
  }

  async getCategories() {
    return BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }

  async searchPosts(searchQuery) {
    if (!searchQuery) {
      throw new HttpError(400, 'Search query is required');
    }

    return BlogPost.find({
      $text: { $search: searchQuery },
      status: 'published'
    })
      .populate('author', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .select('-content');
  }

  async getRecentPosts(limit = 5) {
    return BlogPost.find({ status: 'published' })
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('title slug excerpt publishedAt author readTime');
  }

  async addComment(postId, comment) {
    const { name, email, website, content } = comment;
    if (!name || !email || !content) {
      throw new HttpError(400, 'Name, email, and content are required');
    }

    const post = await BlogPost.findById(postId);
    if (!post) {
      throw new HttpError(404, 'Blog post not found');
    }

    await post.addComment({
      author: { name, email, website },
      content,
      approved: false
    });
  }

  async getBlogSettings() {
    const settings = await WebsiteSettings.getSettings();
    return {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      socialMedia: settings.socialMedia
    };
  }
}

module.exports = new BlogService();
