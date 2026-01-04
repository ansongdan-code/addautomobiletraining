import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WebsiteEditor.css';

const PublishToggle = ({ isPublished, onChange }) => (
  <div className="publish-toggle">
    <span className={`status ${isPublished ? 'published' : 'draft'}`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
    <label className="switch">
      <input type="checkbox" checked={isPublished} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  </div>
);

const WebsiteEditor = ({ userRole, onMount }) => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  
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

  // Fetch pages function
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

  // Fetch pages on mount
  useEffect(() => {
    console.log('[WebsiteEditor] checking userRole=', userRole);
    // Notify parent that editor rendered (helpful for debugging)
    if (typeof onMount === 'function') {
      try { onMount(); } catch (e) { /* noop */ }
    }
    // Allow both 'admin' and 'super_admin' to load pages.
    if (userRole === 'super_admin' || userRole === 'admin') {
      fetchPages();
    }
  }, [userRole, onMount]);

  // Check authorization - allow admin and super_admin
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    return (
      <div className="editor-container">
        <div className="error-box">
          <h2>Access Denied</h2>
          <p>Only admin or super admin users can access the website editor.</p>
        </div>
      </div>
    );
  }

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
    setPreview(false);
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
    setPreview(false);
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

  const handlePublishToggle = () => {
    setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));
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

  const handlePublishNow = async () => {
    if (!selectedPage && !isCreating) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let id = selectedPage ? selectedPage._id : null;
      // If creating, persist first and get id
      if (isCreating && !id) {
        const createResp = await axios.post('/api/website/editor/pages', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // prepend to pages list
        setPages(prev => [createResp.data.data, ...prev]);
        id = createResp.data.data._id;
        setSelectedPage(createResp.data.data);
        setIsCreating(false);
        setIsEditing(true);
      }

      if (!id) {
        setError('Could not publish: missing page id');
        return;
      }

      const resp = await axios.put(`/api/website/editor/pages/${id}/publish`, { isPublished: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setPages(pages.map(p => p._id === resp.data.data._id ? resp.data.data : p));
      setSelectedPage(resp.data.data);
      setSuccess('Page published successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish page');
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
      <div className="editor-main-header">
        <h1>🌐 Website Editor</h1>
        <p className="editor-subtitle">For Super Admins Only - Edit website pages and content</p>
        <p className="editor-guidance">Tip: use <strong>Preview</strong> to check styling, then click <strong>Publish Now</strong> to make changes live.</p>
      </div>

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
                <div className="editor-header-actions">
                  <PublishToggle isPublished={formData.isPublished} onChange={handlePublishToggle} />
                  <button className="btn btn-secondary" onClick={() => setPreview(!preview)}>
                    {preview ? 'Edit' : 'Preview'}
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button className="btn btn-success" onClick={handlePublishNow} disabled={loading} title="Save & publish immediately">
                    {loading ? 'Publishing...' : 'Publish Now'}
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={loading || !selectedPage} title="Delete this page">
                    Delete
                  </button>
                </div>
              </div>

              {preview ? (
                <div className="preview-panel">
                  <iframe
                    srcDoc={`
                      <html>
                        <head>
                          <style>${formData.customCSS}</style>
                        </head>
                        <body>
                          ${formData.content}
                          <script>${formData.customJavaScript}</script>
                        </body>
                      </html>
                    `}
                    title="Page Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <form className="editor-form">
                  <div className="form-grid">
                    <div className="form-section main-content">
                      <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Content</label>
                        <textarea name="content" value={formData.content} onChange={handleInputChange} rows="20" />
                      </div>
                    </div>
                    <div className="form-section side-content">
                      <div className="form-group">
                        <label>Slug</label>
                        <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" />
                      </div>
                      <div className="form-group">
                        <label>SEO Title</label>
                        <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>SEO Description</label>
                        <textarea name="seoDescription" value={formData.seoDescription} onChange={handleInputChange} rows="3" />
                      </div>
                      <div className="form-group">
                        <label>SEO Keywords</label>
                        <input type="text" name="seoKeywords" value={Array.isArray(formData.seoKeywords) ? formData.seoKeywords.join(', ') : ''} onChange={handleInputChange} />
                      </div>
                      <div className="form-group">
                        <label>Custom CSS</label>
                        <textarea name="customCSS" value={formData.customCSS} onChange={handleInputChange} rows="5" />
                      </div>
                      <div className="form-group">
                        <label>Custom JavaScript</label>
                        <textarea name="customJavaScript" value={formData.customJavaScript} onChange={handleInputChange} rows="5" />
                      </div>
                    </div>
                  </div>
                </form>
              )}
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
