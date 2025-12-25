import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './components/Admin/AdminDashboard'; // Import the full AdminDashboard component
import './Admin.css';

const Admin = ({ showNotification }) => {
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      showNotification('Access denied. Admin privileges required.', 'error');
      navigate('/');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const isAdminUser = user.role === 'admin' || user.role === 'super_admin';

      if (!isAdminUser) {
        showNotification('Access denied. Admin privileges required.', 'error');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      showNotification('Authentication error. Please log in again.', 'error');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate, showNotification]);

  return (
    <AdminDashboard showNotification={showNotification} />
  );
};

export default Admin; 