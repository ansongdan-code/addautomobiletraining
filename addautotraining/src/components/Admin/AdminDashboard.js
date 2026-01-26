import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
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
const VisualAppEditor = lazy(() => import('./VisualAppEditor'));

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [editorMounted, setEditorMounted] = useState(false);
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
    console.log('[AdminDashboard] userRole set to', user.role);
    fetchDashboardStats();
  }, [fetchDashboardStats, navigate]);

  useEffect(() => {
    console.log('[AdminDashboard] activeTab changed:', activeTab);
  }, [activeTab]);

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
      <nav className="admin-nav" style={{display: 'block', visibility: 'visible'}}>
        <ul className="nav-list" style={{display: 'flex', listStyle: 'none', margin: 0, padding: 0}}>
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
          <li className={`nav-item ${activeTab === 'theme' ? 'active' : ''}`}>
            <button 
              onClick={() => setActiveTab('theme')}
              className="nav-link"
              aria-label="Visual Editor"
              title="Visual App Editor - Create and customize pages with visual components"
              style={{color: activeTab === 'theme' ? '#667eea' : '#333'}}
            >
              <i className="fas fa-palette"></i>
              Visual Editor
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
            {/* Render components based on active tab */}
            {activeTab === 'settings' && <WebsiteSettings />}
            {activeTab === 'blog' && <BlogManager />}
            {activeTab === 'users' && <UserManager />}
            {activeTab === 'courses' && <CourseManager />}
            {activeTab === 'videos' && <VideoManager />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'editor' && (
              <WebsiteEditor userRole={userRole} onMount={() => setEditorMounted(true)} />
            )}
            {activeTab === 'theme' && (
              <VisualAppEditor userRole={userRole} onMount={() => setEditorMounted(true)} />
            )}
          </Suspense>
        )}
      </main>

      {/* Debug overlay (temporary) */}
      <div style={{position: 'fixed', right: 12, bottom: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '8px 10px', borderRadius: 6, zIndex: 9999, fontSize: 12}}>
        <div style={{fontWeight: 600, marginBottom: 4}}>Debug</div>
        <div>role: {userRole || 'n/a'}</div>
        <div>tab: {activeTab}</div>
        <div>editorMounted: {String(editorMounted)}</div>
      </div>

      {/* Quick access buttons */}
      <button
        onClick={() => {
          setActiveTab('theme');
          setEditorMounted(false);
        }}
        style={{
          position: 'fixed',
          right: 12,
          bottom: 80,
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        title="Open Visual Editor"
      >
        <i className="fas fa-palette"></i>
        Visual Editor
      </button>
      <button
        onClick={() => {
          setActiveTab('editor');
          setEditorMounted(false);
        }}
        style={{
          position: 'fixed',
          right: 12,
          bottom: 140,
          padding: '10px 15px',
          background: '#667eea',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          zIndex: 9999
        }}
      >
        Go to Editor
      </button>
    </div>
  );
};

export default AdminDashboard;
