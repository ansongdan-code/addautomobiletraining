const User = require('../models/User');
const Course = require('../models/Course');
const Video = require('../models/Video');
const BlogPost = require('../models/BlogPost');
const WebsiteSettings = require('../models/WebsiteSettings');
const HttpError = require('../utils/httpError');
const courseManagementService = require('./courseManagementService');

const normalizeTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

class AdminService {
  async getDashboardStats() {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalBlogPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    const totalEnrollments = await Course.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$enrolledStudents' } } } }
    ]);

    return {
      totalUsers,
      totalCourses,
      totalVideos,
      totalBlogPosts,
      publishedPosts,
      totalEnrollments: totalEnrollments[0]?.total || 0,
      totalRevenue: 0
    };
  }

  async getUsers({ page = 1, limit = 10, search = '' }) {
    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
      : {};

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateUser(userId, updates) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: updates.role, isActive: updates.isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  }

  async getCourses(params) {
    return courseManagementService.getCourses(params);
  }

  async updateCourse(courseId, updates) {
    return courseManagementService.updateCourse(courseId, updates);
  }

  async deleteCourse(courseId) {
    return courseManagementService.deleteCourse(courseId);
  }

  async getBlogPosts({ page = 1, limit = 10, search = '', status = '' }) {
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const posts = await BlogPost.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

  async createBlogPost({ payload, userId, featuredImage }) {
    const postData = {
      ...payload,
      author: userId,
      tags: normalizeTags(payload.tags)
    };

    if (featuredImage) {
      postData.featuredImage = featuredImage;
    }

    const post = new BlogPost(postData);
    await post.save();
    return post;
  }

  async updateBlogPost(postId, payload) {
    const updateData = {
      ...payload,
      tags: normalizeTags(payload.tags)
    };

    const post = await BlogPost.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true
    });

    if (!post) {
      throw new HttpError(404, 'Blog post not found');
    }

    return post;
  }

  async deleteBlogPost(postId) {
    const post = await BlogPost.findById(postId);
    if (!post) {
      throw new HttpError(404, 'Blog post not found');
    }

    await post.deleteOne();
    return { message: 'Blog post deleted successfully' };
  }

  async getSettings() {
    return WebsiteSettings.getSettings();
  }

  async updateSettings(updateData, userId) {
    return WebsiteSettings.updateSettings(updateData, userId);
  }

  async getAnalytics() {
    const topCourses = await Course.aggregate([
      {
        $project: {
          title: 1,
          enrollments: { $size: '$enrolledStudents' }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 }
    ]);

    const revenueData = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.paymentStatus': 'paid' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$enrolledStudents.enrolledAt' }
          },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    return {
      topCourses,
      revenueData
    };
  }
}

module.exports = new AdminService();
