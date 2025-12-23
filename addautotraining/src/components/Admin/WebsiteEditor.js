import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WebsiteEditor.css';

const WebsiteEditor = ({ userRole }) => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    description: '',
    isPublished: false,
    customCSS: '',
    customJavaScript: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  });

  // Fetch pages on mount
  useEffect(() => {
    fetchPages();
  }, []);

  // Check authorization
  if (userRole !== 'super_admin') {
    return (
      <div className="editor-container">
        <div className="error-box">
          <h2>Access Denied</h2>
          <p>Only super admins can access the website editor.</p>
        </div>
      </div>
    );
  }

  const fetchPages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/website/editor/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      description: page.description || '',
      isPublished: page.isPublished,
      customCSS: page.customCSS || '',
      customJavaScript: page.customJavaScript || '',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      seoKeywords: page.seoKeywords || []
    });
    setIsEditing(true);
    setIsCreating(false);
    setError('');
    setSuccess('');
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '<p>Start editing your page content here...</p>',
      description: '',
      isPublished: false,
      customCSS: '',
      customJavaScript: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: []
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'seoKeywords') {
      // Handle keywords as comma-separated string
      const keywordsArray = value.split(',').map(k => k.trim()).filter(k => k);
      setFormData({
        ...formData,
        [name]: keywordsArray
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (isCreating) {
        const response = await axios.post('/api/website/editor/pages', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPages([response.data.data, ...pages]);
        setSuccess('Page created successfully!');
      } else {
        const response = await axios.put(`/api/website/editor/pages/${selectedPage._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPages(pages.map(p => p._id === selectedPage._id ? response.data.data : p));
        setSelectedPage(response.data.data);
        setSuccess('Page updated successfully!');
      }
      
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/website/editor/pages/${selectedPage._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(pages.filter(p => p._id !== selectedPage._id));
      setSelectedPage(null);
      setIsEditing(false);
      setSuccess('Page deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="website-editor-container">
      <h1>🌐 Website Editor</h1>
      <p className="editor-subtitle">For Super Admins Only - Edit website pages and content</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="editor-layout">
        {/* Pages List */}
        <div className="pages-sidebar">
          <div className="sidebar-header">
            <h2>Pages</h2>
            <button className="btn btn-primary btn-small" onClick={handleNewPage}>
              + New Page
            </button>
          </div>

          {loading && pages.length === 0 ? (
            <p className="loading">Loading pages...</p>
          ) : (
            <div className="pages-list">
              {pages.length === 0 ? (
                <p className="empty-state">No pages yet. Create one to get started!</p>
              ) : (
                pages.map(page => (
                  <div
                    key={page._id}
                    className={`page-item ${selectedPage?._id === page._id ? 'active' : ''}`}
                    onClick={() => handlePageSelect(page)}
                  >
                    <div className="page-item-header">
                      <h3>{page.title}</h3>
                      <span className={`badge ${page.isPublished ? 'published' : 'draft'}`}>
                        {page.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="page-slug">/{page.slug}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Editor Panel */}
        <div className="editor-panel">
          {isEditing || isCreating ? (
            <>
              <div className="editor-header">
                <h2>{isCreating ? 'Create New Page' : 'Edit Page'}</h2>
                <button className="btn btn-secondary" onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setSelectedPage(null);
                }}>
                  ← Back
                </button>
              </div>

              <form className="editor-form">
                {/* Basic Info */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-group">
                    <label>Page Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Home, About Us, Services"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Page Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="e.g., home, about-us, services"
                      required
                    />
                    <small>URL-friendly unique identifier</small>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief page description"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="form-section">
                  <h3>Page Content</h3>
                  <div className="form-group">
                    <label>Content *</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter HTML or plain text content"
                      rows="12"
                      className="content-editor"
                      required
                    />
                    <small>Supports HTML markup</small>
                  </div>
                </div>

                {/* SEO */}
                <div className="form-section">
                  <h3>SEO Settings</h3>
                  <div className="form-group">
                    <label>SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="Page title for search engines"
                    />
                  </div>

                  <div className="form-group">
                    <label>SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      placeholder="Meta description for search engines"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>SEO Keywords</label>
                    <input
                      type="text"
                      name="seoKeywords"
                      value={Array.isArray(formData.seoKeywords) ? formData.seoKeywords.join(', ') : ''}
                      onChange={handleInputChange}
                      placeholder="Comma-separated keywords"
                    />
                    <small>Separate keywords with commas</small>
                  </div>
                </div>

                {/* Advanced */}
                <div className="form-section">
                  <h3>Advanced</h3>
                  <div className="form-group">
                    <label>Custom CSS</label>
                    <textarea
                      name="customCSS"
                      value={formData.customCSS}
                      onChange={handleInputChange}
                      placeholder="Add custom CSS for this page"
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>Custom JavaScript</label>
                    <textarea
                      name="customJavaScript"
                      value={formData.customJavaScript}
                      onChange={handleInputChange}
                      placeholder="Add custom JavaScript for this page"
                      rows="4"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="form-section">
                  <h3>Status</h3>
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      name="isPublished"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="isPublished">Publish this page</label>
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading || !formData.title || !formData.slug || !formData.content}
                  >
                    {loading ? 'Saving...' : 'Save Page'}
                  </button>
                  {selectedPage && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Delete Page
                    </button>
                  )}
                </div>
              </form>
            </>
          ) : (
            <div className="empty-editor">
              <h2>Select a page to edit or create a new one</h2>
              <button className="btn btn-primary" onClick={handleNewPage}>
                Create First Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteEditor;
