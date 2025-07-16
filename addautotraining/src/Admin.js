import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = ({ showNotification }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.isAdmin) {
      showNotification('Access denied. Admin privileges required.', 'error');
      navigate('/');
    }
  }, [navigate, showNotification]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
      } else {
        showNotification('Failed to fetch dashboard stats', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showNotification('Error fetching dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/users?page=${currentPage}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
      } else {
        showNotification('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, showNotification]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/courses?page=${currentPage}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses);
      } else {
        showNotification('Failed to fetch courses', 'error');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Error fetching courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, showNotification]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      } else {
        showNotification('Failed to fetch analytics', 'error');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showNotification('Error fetching analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Update user
  const updateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        showNotification('User updated successfully', 'success');
        fetchUsers();
      } else {
        showNotification('Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error updating user', 'error');
    }
  };

  // Update course
  const updateCourse = async (courseId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        showNotification('Course updated successfully', 'success');
        fetchCourses();
      } else {
        showNotification('Failed to update course', 'error');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      showNotification('Error updating course', 'error');
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('Course deleted successfully', 'success');
        fetchCourses();
      } else {
        showNotification('Failed to delete course', 'error');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showNotification('Error deleting course', 'error');
    }
  };

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        fetchDashboardStats();
        break;
      case 'users':
        fetchUsers();
        break;
      case 'courses':
        fetchCourses();
        break;
      case 'analytics':
        fetchAnalytics();
        break;
      default:
        break;
    }
  }, [activeTab, currentPage, searchTerm, fetchAnalytics, fetchCourses, fetchDashboardStats, fetchUsers]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    navigate('/');
  };

  const DashboardTab = () => (
    <div className="admin-dashboard">
      <h2>Dashboard Overview</h2>
      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p className="stat-number">{stats.totalCourses || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Enrollments</h3>
            <p className="stat-number">{stats.totalEnrollments || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">${stats.totalRevenue || 0}</p>
          </div>
        </div>
      )}
    </div>
  );

  const UsersTab = () => (
    <div className="admin-users">
      <div className="tab-header">
        <h2>User Management</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateUser(user._id, { role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => updateUser(user._id, { isActive: !user.isActive })}
                      className="btn-toggle"
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const CoursesTab = () => (
    <div className="admin-courses">
      <div className="tab-header">
        <h2>Course Management</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>Price: ${course.price}</span>
                <span>Status: {course.status}</span>
              </div>
              <div className="course-actions">
                <button
                  onClick={() => updateCourse(course._id, { status: course.status === 'published' ? 'draft' : 'published' })}
                  className="btn-toggle"
                >
                  {course.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => deleteCourse(course._id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AnalyticsTab = () => (
    <div className="admin-analytics">
      <h2>Analytics</h2>
      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <div className="analytics-content">
          <div className="analytics-section">
            <h3>Top Courses by Enrollment</h3>
            {analytics.topCourses && analytics.topCourses.length > 0 ? (
              <div className="top-courses">
                {analytics.topCourses.map((course, index) => (
                  <div key={index} className="course-stat">
                    <span>{course.courseTitle}</span>
                    <span>{course.enrollments} enrollments</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No enrollment data available</p>
            )}
          </div>
          
          <div className="analytics-section">
            <h3>Revenue Data (Last 30 Days)</h3>
            {analytics.revenueData && analytics.revenueData.length > 0 ? (
              <div className="revenue-chart">
                {analytics.revenueData.map((item, index) => (
                  <div key={index} className="revenue-item">
                    <span>{item._id}</span>
                    <span>${item.revenue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No revenue data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};

export default Admin; 