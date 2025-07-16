import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { showNotification } from './App';
import VideoManager from './VideoManager';

// Constants for better maintainability
const SECTIONS = {
  PROGRESS: 'progress',
  CERTIFICATES: 'certificates',
  COURSES: 'courses',
  VIDEOS: 'videos',
  SETTINGS: 'settings'
};

const SIDEBAR_MENU_ITEMS = [
  { id: SECTIONS.PROGRESS, label: 'My Progress', href: '#progress' },
  { id: SECTIONS.CERTIFICATES, label: 'Certificates', href: '#certificates' },
  { id: SECTIONS.COURSES, label: 'My Courses', href: '#courses' },
  { id: SECTIONS.VIDEOS, label: 'Video Manager', href: '#videos' },
  { id: SECTIONS.SETTINGS, label: 'Settings', href: '#settings' }
];

function Dashboard() {
  // State management
  const [activeSection, setActiveSection] = useState(SECTIONS.PROGRESS);
  const [userProfile] = useState({
    name: 'Demo User',
    email: 'demo@example.com'
  });
  const [progressData, setProgressData] = useState([]);
  const [certificatesData, setCertificatesData] = useState([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Event handlers
  const handleSidebarClick = useCallback((section) => {
    setActiveSection(section);
    clearError();
  }, [clearError]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    showNotification('Logged out successfully!', 'success');
    navigate('/');
  }, [navigate]);

  const handleDownloadCertificate = useCallback((certId) => {
    showNotification('Downloading certificate...', 'info');
    
    // Simulate download process
    setTimeout(() => {
      showNotification('Certificate downloaded successfully!', 'success');
    }, 2000);
  }, []);

  // Initialize dashboard with mock data
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showNotification('Please log in to view the dashboard.', 'error');
      navigate('/');
      return;
    }

    // Mock data for demo
    const mockProgressData = [
      {
        id: 1,
        course: 'Basic Car Maintenance',
        progress: 75,
        completedModules: '7/10',
        totalModules: 10
      },
      {
        id: 2,
        course: 'Engine Diagnostics',
        progress: 45,
        completedModules: '4/10',
        totalModules: 10
      },
      {
        id: 3,
        course: 'Advanced Electronics',
        progress: 20,
        completedModules: '2/10',
        totalModules: 10
      }
    ];

    const mockCertificatesData = [
      {
        id: 1,
        name: 'Basic Car Maintenance',
        issued: 'January 15, 2024',
        status: 'completed',
        image: 'https://via.placeholder.com/300x200'
      },
      {
        id: 2,
        name: 'Engine Diagnostics',
        issued: 'February 3, 2024',
        status: 'completed',
        image: 'https://via.placeholder.com/300x200'
      },
      {
        id: 3,
        name: 'Advanced Electronics',
        issued: 'March 10, 2024',
        status: 'locked',
        image: 'https://via.placeholder.com/300x200'
      }
    ];

    setProgressData(mockProgressData);
    setCertificatesData(mockCertificatesData);
  }, [navigate]);

  // Render functions
  const renderSidebar = () => (
    <div className="sidebar">
      <div className="student-profile">
        <img 
          src="https://via.placeholder.com/150" 
          alt="Student Profile" 
          className="profile-img" 
        />
        <h3>{userProfile.name}</h3>
        <p>{userProfile.email}</p>
      </div>
      
      <ul className="sidebar-menu">
        {SIDEBAR_MENU_ITEMS.map(({ id, label, href }) => (
          <li key={id} className={activeSection === id ? 'active' : ''}>
            <a href={href} onClick={() => handleSidebarClick(id)}>
              {label}
            </a>
          </li>
        ))}
      </ul>
      
      <button 
        className="logout-btn" 
        onClick={handleLogout}
        style={{ marginTop: 'auto', marginBottom: '20px' }}
      >
        Logout
      </button>
    </div>
  );

  const renderProgressSection = () => (
    <section id="progress" className="dashboard-section">
      <h2>My Progress</h2>
      {isLoading ? (
        <p>Loading progress data...</p>
      ) : progressData.length > 0 ? (
        <div className="progress-cards">
          {progressData.map((course) => (
            <div className="progress-card" key={course.id}>
              <h3>{course.course}</h3>
              <div className="progress-bar">
                <div 
                  className="progress" 
                  style={{ width: `${course.progress}%` }}
                >
                  {course.progress}%
                </div>
              </div>
              <p>Completed Modules: {course.completedModules}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No progress data available.</p>
      )}
    </section>
  );

  const renderCertificatesSection = () => (
    <section id="certificates" className="dashboard-section">
      <h2>My Certificates</h2>
      {isLoading ? (
        <p>Loading certificates...</p>
      ) : certificatesData.length > 0 ? (
        <div className="certificate-grid">
          {certificatesData.map((cert) => (
            <div className={`certificate-card ${cert.status}`} key={cert.id}>
              <img src={cert.image} alt={`${cert.name} Certificate`} />
              <h3>{cert.name}</h3>
              {cert.status === 'completed' ? (
                <>
                  <p>Issued: {cert.issued}</p>
                  <button 
                    className="download-btn" 
                    onClick={() => handleDownloadCertificate(cert.id)}
                  >
                    Download PDF
                  </button>
                </>
              ) : (
                <>
                  <p>Complete the course to unlock</p>
                  <button className="download-btn" disabled>
                    Locked
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No certificates available.</p>
      )}
    </section>
  );

  const renderCoursesSection = () => (
    <section id="courses" className="dashboard-section">
      <h2>My Courses</h2>
      {isLoading ? (
        <p>Loading courses...</p>
      ) : progressData.length > 0 ? (
        <div className="progress-cards">
          {progressData.map((course) => (
            <div className="progress-card" key={course.id}>
              <h3>{course.course}</h3>
              <p>Current Progress: {course.progress}%</p>
              <p>Modules: {course.completedModules}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No courses available.</p>
      )}
    </section>
  );

  const renderSettingsSection = () => (
    <section id="settings" className="dashboard-section">
      <h2>Settings</h2>
      <div className="settings-content">
        <p>Settings functionality will be implemented here.</p>
        <p>Features may include:</p>
        <ul>
          <li>Profile management</li>
          <li>Notification preferences</li>
          <li>Privacy settings</li>
          <li>Account security</li>
        </ul>
      </div>
    </section>
  );

  const renderMainContent = () => {
    if (error) {
      return (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={clearError}>Try Again</button>
        </div>
      );
    }

    switch (activeSection) {
      case SECTIONS.PROGRESS:
        return renderProgressSection();
      case SECTIONS.CERTIFICATES:
        return renderCertificatesSection();
      case SECTIONS.COURSES:
        return renderCoursesSection();
      case SECTIONS.VIDEOS:
        return <VideoManager />;
      case SECTIONS.SETTINGS:
        return renderSettingsSection();
      default:
        return renderProgressSection();
    }
  };

  return (
    <div className="dashboard-container">
      {renderSidebar()}
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
}

export default Dashboard; 