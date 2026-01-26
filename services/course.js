// Sample function for getting course data
const getCourseData = async (courseId) => {
  // Assume we have a database or external service to retrieve course data from
  const courseData = await dbService.getCourseData(courseId);
  return courseData;
};
module.exports = { getCourseData };