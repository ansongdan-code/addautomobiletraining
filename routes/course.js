// Sample API endpoint for courses
exports.getCourse = async (req, res) => {
  const courseId = req.params.id;
  // Get course data from database or external service
  const courseData = await getCourseData(courseId);
  res.json(courseData);
};