class CourseManagementServiceInterface {
  async getCourses() {
    throw new Error('getCourses must be implemented');
  }

  async updateCourse() {
    throw new Error('updateCourse must be implemented');
  }

  async deleteCourse() {
    throw new Error('deleteCourse must be implemented');
  }
}

module.exports = CourseManagementServiceInterface;
