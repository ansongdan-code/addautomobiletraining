const Course = require('../models/Course');
const HttpError = require('../utils/httpError');
const CourseManagementServiceInterface = require('./interfaces/courseManagementServiceInterface');

class CourseManagementService extends CourseManagementServiceInterface {
  async getCourses({ page = 1, limit = 10, search = '' }) {
    const query = search
      ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
      : {};

    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getCourseById(courseId) {
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email');

    if (!course) {
      throw new HttpError(404, 'Course not found');
    }

    return course;
  }

  async createCourse(courseData) {
    const course = new Course(courseData);
    await course.save();
    return course;
  }

  async updateCourse(courseId, updates) {

    const course = await Course.findByIdAndUpdate(courseId, updates, {
      new: true,
      runValidators: true
    });

    if (!course) {
      throw new HttpError(404, 'Course not found');
    }

    return course;
  }

  async deleteCourse(courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new HttpError(404, 'Course not found');
    }

    await course.deleteOne();
    return { message: 'Course deleted successfully' };
  }
}

module.exports = new CourseManagementService();
