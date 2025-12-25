import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CourseManager.css';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner',
    price: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewCourse = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Beginner',
      price: '',
      category: '',
      image: ''
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedCourse(null);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormData(course);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (isCreating) {
        await axios.post('/api/courses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else if (isEditing && selectedCourse) {
        await axios.put(`/api/courses/${selectedCourse._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsCreating(false);
      setIsEditing(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      console.error('Error saving course:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="course-manager">
      <div className="course-header">
        <div className="course-title-section">
          <h1>📚 Course Manager</h1>
          <p>Create, edit, and manage your training courses</p>
        </div>
        <button className="btn-create-course" onClick={handleNewCourse}>
          + Create New Course
        </button>
      </div>

      {!isEditing && !isCreating ? (
        <div className="courses-list-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading">Loading courses...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="empty-state">
              <p>No courses found. Create one to get started!</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <div key={course._id} className="course-card">
                  <div className="course-header-card">
                    <h3>{course.title}</h3>
                    <span className={`level-badge ${course.level?.toLowerCase()}`}>
                      {course.level}
                    </span>
                  </div>
                  <p className="course-description">{course.description || 'No description'}</p>
                  <div className="course-meta">
                    <span>👨‍🏫 {course.instructor || 'Unknown'}</span>
                    <span>⏱️ {course.duration || 'N/A'}</span>
                    <span className="price">${course.price || '0'}</span>
                  </div>
                  <div className="course-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditCourse(course)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(course._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="course-form-section">
          <h2>{isCreating ? 'Create New Course' : 'Edit Course'}</h2>
          <form className="course-form">
            <div className="form-row">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div className="form-group">
                <label>Level</label>
                <select name="level" value={formData.level} onChange={handleInputChange}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Instructor</label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Instructor name"
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 8 weeks"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Automotive"
                />
              </div>
            </div>

            <div className="form-group full">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Course description"
                rows="6"
              />
            </div>

            <div className="form-group full">
              <label>Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-save"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Course'}
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setSelectedCourse(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CourseManager;