const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');

// @desc    Get admin dashboard statistics
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Check admin permissions
    if (!req.user.isAdmin()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    // Get statistics
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalPayments = await Payment.countDocuments({ paymentStatus: 'completed' });

    // Get revenue statistics
    const revenueStats = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent activities
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCourses = await Course.find()
      .select('title instructor status createdAt')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ paymentStatus: 'completed' })
      .select('amount user course createdAt')
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          totalPayments,
          totalRevenue: revenueStats[0]?.total || 0
        },
        recentActivities: {
          users: recentUsers,
          courses: recentCourses,
          payments: recentPayments
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    if (!req.user.hasPermission('manageUsers')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. User management permission required.'
      });
    }

    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalUsers: total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
};

// @desc    Update user role and permissions
// @route   PUT /api/v1/admin/users/:userId
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    if (!req.user.hasPermission('manageUsers')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. User management permission required.'
      });
    }

    const { userId } = req.params;
    const { role, permissions, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from modifying super_admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify super admin user'
      });
    }

    // Update user
    if (role) user.role = role;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// @desc    Get all courses (admin only)
// @route   GET /api/v1/admin/courses
// @access  Private (Admin only)
exports.getAllCourses = async (req, res, next) => {
  try {
    if (!req.user.hasPermission('manageCourses')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Course management permission required.'
      });
    }

    const { page = 1, limit = 10, status, category, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalCourses: total
        }
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve courses'
    });
  }
};

// @desc    Update course (admin only)
// @route   PUT /api/v1/admin/courses/:courseId
// @access  Private (Admin only)
exports.updateCourse = async (req, res, next) => {
  try {
    if (!req.user.hasPermission('manageCourses')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Course management permission required.'
      });
    }

    const { courseId } = req.params;
    const { title, description, price, status, category, difficulty } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Update course
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (status) course.status = status;
    if (category) course.category = category;
    if (difficulty) course.difficulty = difficulty;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update course'
    });
  }
};

// @desc    Delete course (admin only)
// @route   DELETE /api/v1/admin/courses/:courseId
// @access  Private (Admin only)
exports.deleteCourse = async (req, res, next) => {
  try {
    if (!req.user.hasPermission('manageCourses')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Course management permission required.'
      });
    }

    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Delete related enrollments and payments
    await Enrollment.deleteMany({ course: courseId });
    await Payment.deleteMany({ course: courseId });

    // Delete course
    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete course'
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/v1/admin/analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res, next) => {
  try {
    if (!req.user.hasPermission('viewAnalytics')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Analytics permission required.'
      });
    }

    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User registration analytics
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course enrollment analytics
    const courseEnrollments = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue analytics
    const revenueData = await Payment.aggregate([
      { 
        $match: { 
          paymentStatus: 'completed',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top courses by enrollment
    const topCourses = await Enrollment.aggregate([
      {
        $group: {
          _id: '$course',
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseTitle: '$course.title',
          enrollments: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        courseEnrollments,
        revenueData,
        topCourses,
        period: parseInt(period)
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
}; 