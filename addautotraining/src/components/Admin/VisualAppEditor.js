import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VisualAppEditor.css';

const VisualAppEditor = ({ userRole, onMount }) => {
  const [editorMode, setEditorMode] = useState('pages'); // pages, styles, components, settings
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const [pageForm, setPageForm] = useState({
    name: '',
    slug: '',
    title: '',
    description: '',
    layout: 'standard', // standard, landing, blog, gallery
    icon: '📄',
    isPublished: false,
    components: []
  });

  const [componentForm, setComponentForm] = useState({
    id: '',
    type: 'section', // section, header, hero, cta, feature, testimonial, footer
    title: '',
    content: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    alignment: 'center'
  });

  const [styleForm, setStyleForm] = useState({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#f093fb',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    borderRadius: '8px'
  });

  // Fetch app configuration on mount
  useEffect(() => {
    if (typeof onMount === 'function') {
      try { onMount(); } catch (e) { /* noop */ }
    }

    if (userRole === 'super_admin' || userRole === 'admin') {
      fetchAppConfig();
    }
  }, [userRole, onMount]);

  const fetchAppConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch pages
      const pagesRes = await axios.get('/api/editor/app/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(pagesRes.data.data || []);

      // Fetch global styles
      const stylesRes = await axios.get('/api/editor/app/styles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedStyles = stylesRes.data.data || {};
      setStyleForm({
        primaryColor: fetchedStyles.primaryColor || '#667eea',
        secondaryColor: fetchedStyles.secondaryColor || '#764ba2',
        accentColor: fetchedStyles.accentColor || '#f093fb',
        fontFamily: fetchedStyles.fontFamily || 'Arial, sans-serif',
        fontSize: fetchedStyles.fontSize || '16px',
        borderRadius: fetchedStyles.borderRadius || '8px'
      });

      setError('');
    } catch (err) {
      console.error('Failed to load app config:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load editor. Please try again.';
      setError(errorMsg);
      // Log more details for debugging
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to access the editor.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Wait for userRole to be loaded
  if (!userRole) {
    return (
      <div className="editor-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  // Authorization check
  if (userRole !== 'super_admin' && userRole !== 'admin') {
    return (
      <div className="editor-container">
        <div className="error-box">
          <h2>❌ Access Denied</h2>
          <p>Only admin users can access the Visual App Editor.</p>
        </div>
      </div>
    );
  }

  const handleAddPage = async () => {
    if (!pageForm.name || !pageForm.slug) {
      setError('Page name and slug are required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/editor/app/pages', pageForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPages([...pages, response.data.data]);
      setPageForm({
        name: '',
        slug: '',
        title: '',
        description: '',
        layout: 'standard',
        icon: '📄',
        isPublished: false,
        components: []
      });
      setSuccess('Page created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create page');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComponent = async (pageId) => {
    if (!componentForm.type) {
      setError('Component type is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const componentData = {
        type: componentForm.type,
        title: componentForm.title,
        content: componentForm.content,
        backgroundColor: componentForm.backgroundColor,
        textColor: componentForm.textColor,
        alignment: componentForm.alignment
      };

      await axios.post(`/api/editor/app/pages/${pageId}/components`, componentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the page to get updated components
      const updatedPages = await axios.get('/api/editor/app/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(updatedPages.data.data || []);

      // Update selected page if it's the one we just modified
      if (selectedPage && selectedPage._id === pageId) {
        const updatedPage = updatedPages.data.data.find(p => p._id === pageId);
        if (updatedPage) setSelectedPage(updatedPage);
      }

      setComponentForm({
        id: '',
        type: 'section',
        title: '',
        content: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        alignment: 'center'
      });
      
      setSuccess('Component added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add component');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveComponent = async (pageId, componentId) => {
    if (!window.confirm('Are you sure you want to delete this component?')) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/editor/app/pages/${pageId}/components/${componentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the page to get updated components
      const updatedPages = await axios.get('/api/editor/app/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(updatedPages.data.data || []);

      // Update selected page if it's the one we just modified
      if (selectedPage && selectedPage._id === pageId) {
        const updatedPage = updatedPages.data.data.find(p => p._id === pageId);
        if (updatedPage) setSelectedPage(updatedPage);
      }

      setSuccess('Component deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete component');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStyles = async () => {
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
      
      console.log('Saving styles:', styleForm);
      const response = await axios.put('/api/editor/app/styles', styleForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccess('Styles updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Failed to save styles');
      }
    } catch (err) {
      console.error('Error saving styles:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save styles';
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPage = async (pageId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const page = pages.find(p => p._id === pageId);
      
      await axios.put(`/api/editor/app/pages/${pageId}`, 
        { ...page, isPublished: !page.isPublished },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPages(pages.map(p => 
        p._id === pageId ? { ...p, isPublished: !p.isPublished } : p
      ));
      
      setSuccess(`Page ${!page.isPublished ? 'published' : 'unpublished'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish page');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.delete(`/api/editor/app/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPages(pages.filter(p => p._id !== pageId));
      setSelectedPage(null);
      setSuccess('Page deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPage = (page) => {
    setSelectedPage(page);
    setPreview(true);
    setPreviewUrl(`/page/${page.slug}`);
  };

  return (
    <div className="visual-app-editor">
      {/* Header */}
      <header className="editor-header">
        <h1>🎨 Visual App Editor</h1>
        <div className="editor-controls" data-testid="editor-controls">
          <button 
            className={`mode-btn ${editorMode === 'pages' ? 'active' : ''}`}
            onClick={() => setEditorMode('pages')}
          >
            📄 Pages
          </button>
          <button 
            className={`mode-btn ${editorMode === 'styles' ? 'active' : ''}`}
            onClick={() => setEditorMode('styles')}
          >
            🎨 Styles
          </button>
          <button 
            className={`mode-btn ${editorMode === 'components' ? 'active' : ''}`}
            onClick={() => setEditorMode('components')}
          >
            🧩 Components
          </button>
          <button 
            className={`mode-btn ${editorMode === 'settings' ? 'active' : ''}`}
            onClick={() => setEditorMode('settings')}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* Notifications */}
      {error && <div className="notification error">{error}</div>}
      {success && <div className="notification success">{success}</div>}

      {/* Loading State */}
      {loading && <div className="loading-spinner">Loading...</div>}

      {/* Main Content */}
      <div className="editor-content">
        {/* PAGE EDITOR MODE */}
        {editorMode === 'pages' && (
          <div className="editor-section pages-editor">
            <div className="editor-panel">
              <h2>📄 Pages</h2>
              
              {/* Add New Page Form */}
              <div className="form-group new-page-form">
                <h3>Create New Page</h3>
                <input
                  type="text"
                  placeholder="Page Name"
                  value={pageForm.name}
                  onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Page Slug (e.g., about-us)"
                  value={pageForm.slug}
                  onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Page Title"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  className="form-input"
                />
                <textarea
                  placeholder="Page Description"
                  value={pageForm.description}
                  onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                  className="form-textarea"
                  rows="2"
                />
                <select
                  value={pageForm.layout}
                  onChange={(e) => setPageForm({ ...pageForm, layout: e.target.value })}
                  className="form-select"
                >
                  <option value="standard">Standard</option>
                  <option value="landing">Landing Page</option>
                  <option value="blog">Blog</option>
                  <option value="gallery">Gallery</option>
                </select>
                <button 
                  onClick={handleAddPage} 
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Creating...' : '✨ Create Page'}
                </button>
              </div>

              {/* Pages List */}
              <div className="pages-list">
                <h3>All Pages ({pages.length})</h3>
                {pages.length === 0 ? (
                  <p className="empty-state">No pages yet. Create your first page!</p>
                ) : (
                  pages.map(page => (
                    <div 
                      key={page._id}
                      className={`page-item ${selectedPage?._id === page._id ? 'selected' : ''}`}
                      onClick={() => setSelectedPage(page)}
                    >
                      <div className="page-info">
                        <span className="page-icon">{page.icon}</span>
                        <div>
                          <h4>{page.name}</h4>
                          <p>/{page.slug}</p>
                        </div>
                      </div>
                      <div className="page-actions">
                        <button
                          title="Preview"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewPage(page);
                          }}
                          className="icon-btn"
                        >
                          👁️
                        </button>
                        <button
                          title={page.isPublished ? 'Unpublish' : 'Publish'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishPage(page._id);
                          }}
                          className={`icon-btn ${page.isPublished ? 'published' : ''}`}
                        >
                          {page.isPublished ? '✅' : '⭕'}
                        </button>
                        <button
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page._id);
                          }}
                          className="icon-btn delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected Page Details */}
            {selectedPage && (
              <div className="editor-panel selected-page">
                <h2>{selectedPage.name} - Components</h2>
                <div className="page-details">
                  <p><strong>Slug:</strong> /{selectedPage.slug}</p>
                  <p><strong>Layout:</strong> {selectedPage.layout}</p>
                  <p><strong>Status:</strong> {selectedPage.isPublished ? '✅ Published' : '⭕ Draft'}</p>
                </div>

                {/* Add Component Form */}
                <div className="form-group">
                  <h3>➕ Add Component</h3>
                  <select
                    value={componentForm.type}
                    onChange={(e) => setComponentForm({ ...componentForm, type: e.target.value })}
                    className="form-select"
                  >
                    <option value="section">Section</option>
                    <option value="header">Header</option>
                    <option value="hero">Hero</option>
                    <option value="cta">Call-to-Action</option>
                    <option value="feature">Feature</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="footer">Footer</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Component Title"
                    value={componentForm.title}
                    onChange={(e) => setComponentForm({ ...componentForm, title: e.target.value })}
                    className="form-input"
                  />
                  <textarea
                    placeholder="Component Content"
                    value={componentForm.content}
                    onChange={(e) => setComponentForm({ ...componentForm, content: e.target.value })}
                    className="form-textarea"
                    rows="3"
                  />
                  <div className="color-inputs">
                    <div>
                      <label>Background Color</label>
                      <input
                        type="color"
                        value={componentForm.backgroundColor}
                        onChange={(e) => setComponentForm({ ...componentForm, backgroundColor: e.target.value })}
                        className="color-picker"
                      />
                    </div>
                    <div>
                      <label>Text Color</label>
                      <input
                        type="color"
                        value={componentForm.textColor}
                        onChange={(e) => setComponentForm({ ...componentForm, textColor: e.target.value })}
                        className="color-picker"
                      />
                    </div>
                  </div>
                  <select
                    value={componentForm.alignment}
                    onChange={(e) => setComponentForm({ ...componentForm, alignment: e.target.value })}
                    className="form-select"
                  >
                    <option value="left">Left Align</option>
                    <option value="center">Center Align</option>
                    <option value="right">Right Align</option>
                  </select>
                  <button 
                    onClick={() => handleAddComponent(selectedPage._id)}
                    className="btn-primary"
                  >
                    ➕ Add Component
                  </button>
                </div>

                {/* Components List */}
                <div className="components-list">
                  <h3>Page Components ({(selectedPage.components || []).length})</h3>
                  {(selectedPage.components || []).length === 0 ? (
                    <p className="empty-state">No components yet. Add your first component!</p>
                  ) : (
                    (selectedPage.components || []).map((comp, idx) => {
                      const compId = comp._id ? comp._id.toString() : (comp.id || `comp_${idx}`);
                      return (
                        <div key={compId} className="component-item">
                          <div
                            className="component-preview"
                            style={{
                              backgroundColor: comp.backgroundColor || '#ffffff',
                              color: comp.textColor || '#000000',
                              textAlign: comp.alignment || 'center'
                            }}
                          >
                            <h4>{comp.title || 'Untitled'}</h4>
                            <p>{comp.content || ''}</p>
                            <span className="component-type">{comp.type || 'section'}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveComponent(selectedPage._id, compId)}
                            className="btn-danger"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STYLES EDITOR MODE */}
        {editorMode === 'styles' && (
          <div className="editor-section styles-editor">
            <h2>🎨 Global Styles</h2>
            <div className="styles-form">
              <div className="style-group">
                <label htmlFor="primaryColor">Primary Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="primaryColor"
                    value={styleForm.primaryColor}
                    onChange={(e) => setStyleForm({ ...styleForm, primaryColor: e.target.value })}
                    className="color-picker"
                  />
                  <span className="color-value">{styleForm.primaryColor}</span>
                </div>
              </div>

              <div className="style-group">
                <label htmlFor="secondaryColor">Secondary Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="secondaryColor"
                    value={styleForm.secondaryColor}
                    onChange={(e) => setStyleForm({ ...styleForm, secondaryColor: e.target.value })}
                    className="color-picker"
                  />
                  <span className="color-value">{styleForm.secondaryColor}</span>
                </div>
              </div>

              <div className="style-group">
                <label htmlFor="accentColor">Accent Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="accentColor"
                    value={styleForm.accentColor}
                    onChange={(e) => setStyleForm({ ...styleForm, accentColor: e.target.value })}
                    className="color-picker"
                  />
                  <span className="color-value">{styleForm.accentColor}</span>
                </div>
              </div>

              <div className="style-group">
                <label htmlFor="fontFamily">Font Family</label>
                <select
                  id="fontFamily"
                  value={styleForm.fontFamily}
                  onChange={(e) => setStyleForm({ ...styleForm, fontFamily: e.target.value })}
                  className="form-select"
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Verdana, sans-serif">Verdana</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              <div className="style-group">
                <label htmlFor="fontSize">Base Font Size</label>
                <input
                  type="text"
                  id="fontSize"
                  value={styleForm.fontSize}
                  onChange={(e) => setStyleForm({ ...styleForm, fontSize: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 16px"
                />
              </div>

              <div className="style-group">
                <label htmlFor="borderRadius">Border Radius</label>
                <input
                  type="text"
                  id="borderRadius"
                  value={styleForm.borderRadius}
                  onChange={(e) => setStyleForm({ ...styleForm, borderRadius: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 8px"
                />
              </div>

              <div className="style-preview">
                <h4>Preview</h4>
                <div
                  style={{
                    backgroundColor: styleForm.primaryColor,
                    color: '#fff',
                    padding: '20px',
                    borderRadius: styleForm.borderRadius,
                    fontFamily: styleForm.fontFamily,
                    fontSize: styleForm.fontSize,
                    marginBottom: '10px'
                  }}
                >
                  Primary Color Sample
                </div>
                <div
                  style={{
                    backgroundColor: styleForm.secondaryColor,
                    color: '#fff',
                    padding: '20px',
                    borderRadius: styleForm.borderRadius,
                    fontFamily: styleForm.fontFamily,
                    fontSize: styleForm.fontSize,
                    marginBottom: '10px'
                  }}
                >
                  Secondary Color Sample
                </div>
                <div
                  style={{
                    backgroundColor: styleForm.accentColor,
                    color: '#fff',
                    padding: '20px',
                    borderRadius: styleForm.borderRadius,
                    fontFamily: styleForm.fontFamily,
                    fontSize: styleForm.fontSize
                  }}
                >
                  Accent Color Sample
                </div>
              </div>

              <button 
                onClick={handleSaveStyles}
                disabled={saving}
                className="btn-primary btn-large"
              >
                {saving ? '💾 Saving...' : '💾 Save Styles'}
              </button>
            </div>
          </div>
        )}

        {/* COMPONENTS LIBRARY MODE */}
        {editorMode === 'components' && (
          <div className="editor-section components-library">
            <h2>🧩 Component Library</h2>
            <div className="library-grid">
              <div className="library-component">
                <div className="comp-preview hero"></div>
                <h4>Hero Section</h4>
                <p>Full-width hero with title and CTA</p>
              </div>
              <div className="library-component">
                <div className="comp-preview features"></div>
                <h4>Features</h4>
                <p>3-column feature showcase</p>
              </div>
              <div className="library-component">
                <div className="comp-preview testimonial"></div>
                <h4>Testimonials</h4>
                <p>Customer reviews carousel</p>
              </div>
              <div className="library-component">
                <div className="comp-preview cta"></div>
                <h4>Call to Action</h4>
                <p>Attention-grabbing CTA section</p>
              </div>
              <div className="library-component">
                <div className="comp-preview pricing"></div>
                <h4>Pricing Table</h4>
                <p>Product pricing comparison</p>
              </div>
              <div className="library-component">
                <div className="comp-preview faq"></div>
                <h4>FAQ Section</h4>
                <p>Frequently asked questions</p>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS MODE */}
        {editorMode === 'settings' && (
          <div className="editor-section settings-editor">
            <h2>⚙️ Editor Settings</h2>
            <div className="settings-group">
              <h3>Quick Actions</h3>
              <button className="btn-secondary" onClick={fetchAppConfig}>
                🔄 Reload Configuration
              </button>
              <button className="btn-secondary" onClick={() => setPages([])}>
                📋 Clear All Pages
              </button>
            </div>
            <div className="settings-group">
              <h3>Export & Import</h3>
              <button className="btn-secondary">
                📥 Export Configuration
              </button>
              <button className="btn-secondary">
                📤 Import Configuration
              </button>
            </div>
            <div className="settings-group">
              <h3>About</h3>
              <p>Visual App Editor v1.0</p>
              <p>Manage your app pages, styles, and components from one place.</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && selectedPage && (
        <div className="preview-modal" onClick={() => setPreview(false)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-preview" onClick={() => setPreview(false)}>✕</button>
            <h2>Preview: {selectedPage.name}</h2>
            <iframe
              src={previewUrl}
              title="Page Preview"
              className="preview-iframe"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualAppEditor;
