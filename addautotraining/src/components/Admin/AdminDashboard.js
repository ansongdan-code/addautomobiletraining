import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { showNotification } from '../../App';
import './AdminDashboard.css';

// Lazy load components for better performance
const WebsiteSettings = lazy(() => import('./WebsiteSettings'));
const BlogManager = lazy(() => import('./BlogManager'));
const UserManager = lazy(() => import('./UserManager'));
const CourseManager = lazy(() => import('./CourseManager'));
const VideoManager = lazy(() => import('./VideoManager'));
const Analytics = lazy(() => import('./Analytics'));
const WebsiteEditor = lazy(() => import('./WebsiteEditor'));

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Memoized API call function
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
      } else if (response.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        navigate('/');
      } else {
        showNotification('Failed to fetch dashboard stats', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      showNotification('Access denied. Admin privileges required.', 'error');
      navigate('/');
      return;
    }

    setUserRole(user.role);
    fetchDashboardStats();
  }, [fetchDashboardStats, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    navigate('/');
  }, [navigate]);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-number">{value || 0}</p>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => window.open('/', '_blank')}
              aria-label="View website"
            >
              <i className="fas fa-external-link-alt"></i>
              View Website
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="admin-nav">
        <ul className="nav-list">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="nav-link"
              aria-label="Dashboard"
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('settings')}
              className="nav-link"
              aria-label="Website Settings"
            >
              <i className="fas fa-cog"></i>
              Settings
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'blog' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('blog')}
              className="nav-link"
              aria-label="Blog Management"
            >
              <i className="fas fa-blog"></i>
              Blog
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('users')}
              className="nav-link"
              aria-label="User Management"
            >
              <i className="fas fa-users"></i>
              Users
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('courses')}
              className="nav-link"
              aria-label="Course Management"
            >
              <i className="fas fa-graduation-cap"></i>
              Courses
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('videos')}
              className="nav-link"
              aria-label="Video Management"
            >
              <i className="fas fa-video"></i>
              Videos
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="nav-link"
              aria-label="Analytics"
            >
              <i className="fas fa-chart-line"></i>
              Analytics
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'editor' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('editor')}
              className="nav-link"
              aria-label="Website Editor"
            >
              <i className="fas fa-edit"></i>
              Website Editor
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'theme' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('theme')}
              className="nav-link"
              aria-label="Theme & UI"
            >
              <i className="fas fa-palette"></i>
              Theme & UI
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="stats-grid">
                <StatCard 
                  title="Total Users" 
                  value={stats.totalUsers} 
                  icon={<i className="fas fa-users"></i>}
                  color="blue"
                />
                <StatCard 
                  title="Total Courses" 
                  value={stats.totalCourses} 
                  icon={<i className="fas fa-graduation-cap"></i>}
                  color="green"
                />
                <StatCard 
                  title="Total Videos" 
                  value={stats.totalVideos} 
                  icon={<i className="fas fa-video"></i>}
                  color="purple"
                />
                <StatCard 
                  title="Blog Posts" 
                  value={stats.totalBlogPosts} 
                  icon={<i className="fas fa-blog"></i>}
                  color="orange"
                />
                <StatCard 
                  title="Published Posts" 
                  value={stats.publishedPosts} 
                  icon={<i className="fas fa-newspaper"></i>}
                  color="teal"
                />
                <StatCard 
                  title="Total Enrollments" 
                  value={stats.totalEnrollments} 
                  icon={<i className="fas fa-user-graduate"></i>}
                  color="red"
                />
              </div>
            )}
          </div>
        )}

        {activeTab !== 'dashboard' && (
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/settings" element={<WebsiteSettings />} />
              <Route path="/blog" element={<BlogManager />} />
              <Route path="/users" element={<UserManager />} />
              <Route path="/courses" element={<CourseManager />} />
              <Route path="/videos" element={<VideoManager />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
            
            {/* Render components based on active tab */}
            {activeTab === 'settings' && <WebsiteSettings />}
            {activeTab === 'blog' && <BlogManager />}
            {activeTab === 'users' && <UserManager />}
            {activeTab === 'courses' && <CourseManager />}
            {activeTab === 'videos' && <VideoManager />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'editor' && userRole && <WebsiteEditor userRole={userRole} />}
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
