import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserManager.css';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'user').length,
    admins: users.filter(u => u.role === 'admin').length,
    superAdmins: users.filter(u => u.role === 'super_admin').length
  };

  return (
    <div className="user-manager">
      <div className="user-header">
        <div className="user-title-section">
          <h1>👥 Student Manager</h1>
          <p>Manage and monitor all registered students and users</p>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-number">{userStats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userStats.students}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userStats.admins}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{userStats.superAdmins}</div>
          <div className="stat-label">Super Admins</div>
        </div>
      </div>

      <div className="users-section">
        <div className="controls-bar">
          <div className="search-group">
            <input
              type="text"
              placeholder="🔍 Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">Students</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="col-email">Email</div>
              <div className="col-role">Role</div>
              <div className="col-joined">Joined</div>
              <div className="col-actions">Actions</div>
            </div>
            {filteredUsers.map(user => (
              <div key={user._id} className="table-row">
                <div className="col-email">
                  <div className="user-info">
                    <div className="avatar">{user.email?.charAt(0).toUpperCase()}</div>
                    <div className="user-details">
                      <div className="user-name">{user.name || user.email}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className="col-role">
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Student'}
                  </span>
                </div>
                <div className="col-joined">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="col-actions">
                  <button 
                    className="btn-action delete"
                    onClick={() => handleDeleteUser(user._id)}
                    title="Delete user"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;