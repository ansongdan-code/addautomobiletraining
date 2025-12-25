import React, { useState, useEffect, useCallback } from 'react';
import { showNotification } from '../../App';
import './WebsiteSettings.css';

const WebsiteSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    primaryColor: '#2196F3',
    secondaryColor: '#FFC107',
    footerText: '',
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    },
    hero: {
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: '',
      secondaryCtaText: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      googleAnalytics: '',
      facebookPixel: ''
    },
    paymentMethods: {
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: ''
      },
      paystack: {
        enabled: false,
        publicKey: '',
        secretKey: ''
      }
    },
    theme: {
      fontFamily: 'Arial, sans-serif',
      primaryColor: '#2196F3',
      secondaryColor: '#FFC107',
      backgroundColor: '#FFFFFF',
      textColor: '#333333'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [files, setFiles] = useState({
    logo: null,
    favicon: null,
    heroBackground: null
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        showNotification('Failed to fetch settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileChange = (field, file) => {
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Append settings data
      Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'object' && settings[key] !== null) {
          formData.append(key, JSON.stringify(settings[key]));
        } else {
          formData.append(key, settings[key]);
        }
      });

      // Append files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        showNotification('Settings updated successfully!', 'success');
        fetchSettings(); // Refresh settings
      } else {
        showNotification('Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>General Settings</h3>
      <div className="form-group">
        <label htmlFor="siteName">Site Name *</label>
        <input
          type="text"
          id="siteName"
          value={settings.siteName}
          onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
          placeholder="Enter site name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="siteDescription">Site Description</label>
        <textarea
          id="siteDescription"
          value={settings.siteDescription}
          onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
          placeholder="Enter site description"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="logo">Logo</label>
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={(e) => handleFileChange('logo', e.target.files[0])}
          />
          {settings.logo && (
            <img src={settings.logo} alt="Current logo" className="current-image" />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="favicon">Favicon</label>
          <input
            type="file"
            id="favicon"
            accept="image/*"
            onChange={(e) => handleFileChange('favicon', e.target.files[0])}
          />
          {settings.favicon && (
            <img src={settings.favicon} alt="Current favicon" className="current-image small" />
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="primaryColor">Primary Color</label>
          <input
            type="color"
            id="primaryColor"
            value={settings.primaryColor}
            onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="secondaryColor">Secondary Color</label>
          <input
            type="color"
            id="secondaryColor"
            value={settings.secondaryColor}
            onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="settings-section">
      <h3>Contact Information</h3>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={settings.contactInfo.email}
          onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
          placeholder="Enter email address"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          value={settings.contactInfo.phone}
          onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
          placeholder="Enter phone number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          value={settings.contactInfo.address}
          onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value)}
          placeholder="Enter address"
          rows="3"
        />
      </div>
    </div>
  );

  const renderSocialMediaSettings = () => (
    <div className="settings-section">
      <h3>Social Media</h3>
      {Object.keys(settings.socialMedia).map(platform => (
        <div key={platform} className="form-group">
          <label htmlFor={platform}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
          <input
            type="url"
            id={platform}
            value={settings.socialMedia[platform]}
            onChange={(e) => handleInputChange('socialMedia', platform, e.target.value)}
            placeholder={`Enter ${platform} URL`}
          />
        </div>
      ))}
    </div>
  );

  const renderHeroSettings = () => (
    <div className="settings-section">
      <h3>Hero Section</h3>
      <div className="form-group">
        <label htmlFor="heroTitle">Hero Title</label>
        <input
          type="text"
          id="heroTitle"
          value={settings.hero.title}
          onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
          placeholder="Enter hero title"
        />
      </div>

      <div className="form-group">
        <label htmlFor="heroSubtitle">Hero Subtitle</label>
        <input
          type="text"
          id="heroSubtitle"
          value={settings.hero.subtitle}
          onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
          placeholder="Enter hero subtitle"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ctaText">CTA Button Text</label>
          <input
            type="text"
            id="ctaText"
            value={settings.hero.ctaText}
            onChange={(e) => handleInputChange('hero', 'ctaText', e.target.value)}
            placeholder="Enter CTA button text"
          />
        </div>

        <div className="form-group">
          <label htmlFor="secondaryCtaText">Secondary CTA Text</label>
          <input
            type="text"
            id="secondaryCtaText"
            value={settings.hero.secondaryCtaText}
            onChange={(e) => handleInputChange('hero', 'secondaryCtaText', e.target.value)}
            placeholder="Enter secondary CTA text"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="heroBackground">Hero Background Image</label>
        <input
          type="file"
          id="heroBackground"
          accept="image/*"
          onChange={(e) => handleFileChange('heroBackground', e.target.files[0])}
        />
        {settings.hero.backgroundImage && (
          <img src={settings.hero.backgroundImage} alt="Hero background" className="current-image" />
        )}
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="settings-section">
      <h3>SEO Settings</h3>
      <div className="form-group">
        <label htmlFor="metaTitle">Meta Title</label>
        <input
          type="text"
          id="metaTitle"
          value={settings.seo.metaTitle}
          onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
          placeholder="Enter meta title"
          maxLength="60"
        />
        <small>{settings.seo.metaTitle.length}/60 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="metaDescription">Meta Description</label>
        <textarea
          id="metaDescription"
          value={settings.seo.metaDescription}
          onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
          placeholder="Enter meta description"
          rows="3"
          maxLength="160"
        />
        <small>{settings.seo.metaDescription.length}/160 characters</small>
      </div>

      <div className="form-group">
        <label htmlFor="keywords">Keywords (comma-separated)</label>
        <input
          type="text"
          id="keywords"
          value={settings.seo.keywords.join(', ')}
          onChange={(e) => handleInputChange('seo', 'keywords', e.target.value.split(', '))}
          placeholder="Enter keywords separated by commas"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="googleAnalytics">Google Analytics ID</label>
          <input
            type="text"
            id="googleAnalytics"
            value={settings.seo.googleAnalytics}
            onChange={(e) => handleInputChange('seo', 'googleAnalytics', e.target.value)}
            placeholder="GA-XXXXXXXXX"
          />
        </div>

        <div className="form-group">
          <label htmlFor="facebookPixel">Facebook Pixel ID</label>
          <input
            type="text"
            id="facebookPixel"
            value={settings.seo.facebookPixel}
            onChange={(e) => handleInputChange('seo', 'facebookPixel', e.target.value)}
            placeholder="Enter Facebook Pixel ID"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="settings-section">
      <h3>Payment Methods</h3>
      
      {/* PayPal Settings */}
      <div className="payment-method">
        <h4>PayPal</h4>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.paymentMethods.paypal.enabled}
              onChange={(e) => handleInputChange('paymentMethods', 'paypal', {
                ...settings.paymentMethods.paypal,
                enabled: e.target.checked
              })}
            />
            Enable PayPal
          </label>
        </div>
        
        {settings.paymentMethods.paypal.enabled && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paypalClientId">Client ID</label>
              <input
                type="text"
                id="paypalClientId"
                value={settings.paymentMethods.paypal.clientId}
                onChange={(e) => handleInputChange('paymentMethods', 'paypal', {
                  ...settings.paymentMethods.paypal,
                  clientId: e.target.value
                })}
                placeholder="PayPal Client ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paypalClientSecret">Client Secret</label>
              <input
                type="password"
                id="paypalClientSecret"
                value={settings.paymentMethods.paypal.clientSecret}
                onChange={(e) => handleInputChange('paymentMethods', 'paypal', {
                  ...settings.paymentMethods.paypal,
                  clientSecret: e.target.value
                })}
                placeholder="PayPal Client Secret"
              />
            </div>
          </div>
        )}
      </div>

      {/* Paystack Settings */}
      <div className="payment-method">
        <h4>Paystack</h4>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={settings.paymentMethods.paystack.enabled}
              onChange={(e) => handleInputChange('paymentMethods', 'paystack', {
                ...settings.paymentMethods.paystack,
                enabled: e.target.checked
              })}
            />
            Enable Paystack
          </label>
        </div>
        
        {settings.paymentMethods.paystack.enabled && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paystackPublicKey">Public Key</label>
              <input
                type="text"
                id="paystackPublicKey"
                value={settings.paymentMethods.paystack.publicKey}
                onChange={(e) => handleInputChange('paymentMethods', 'paystack', {
                  ...settings.paymentMethods.paystack,
                  publicKey: e.target.value
                })}
                placeholder="Paystack Public Key"
              />
            </div>
            <div className="form-group">
              <label htmlFor="paystackSecretKey">Secret Key</label>
              <input
                type="password"
                id="paystackSecretKey"
                value={settings.paymentMethods.paystack.secretKey}
                onChange={(e) => handleInputChange('paymentMethods', 'paystack', {
                  ...settings.paymentMethods.paystack,
                  secretKey: e.target.value
                })}
                placeholder="Paystack Secret Key"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="settings-section">
      <h3>Theme & UI Settings</h3>
      <div className="form-group">
        <label htmlFor="fontFamily">Font Family</label>
        <input
          type="text"
          id="fontFamily"
          value={settings.theme.fontFamily}
          onChange={(e) => handleInputChange('theme', 'fontFamily', e.target.value)}
          placeholder="e.g., Arial, sans-serif"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="themePrimaryColor">Primary Color</label>
          <input
            type="color"
            id="themePrimaryColor"
            value={settings.theme.primaryColor}
            onChange={(e) => handleInputChange('theme', 'primaryColor', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="themeSecondaryColor">Secondary Color</label>
          <input
            type="color"
            id="themeSecondaryColor"
            value={settings.theme.secondaryColor}
            onChange={(e) => handleInputChange('theme', 'secondaryColor', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="backgroundColor">Background Color</label>
          <input
            type="color"
            id="backgroundColor"
            value={settings.theme.backgroundColor}
            onChange={(e) => handleInputChange('theme', 'backgroundColor', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="textColor">Text Color</label>
          <input
            type="color"
            id="textColor"
            value={settings.theme.textColor}
            onChange={(e) => handleInputChange('theme', 'textColor', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="website-settings">
      <div className="settings-header">
        <h2>Website Settings</h2>
        <p>Configure your website's appearance and functionality</p>
      </div>

      <div className="settings-content">
        <nav className="settings-nav">
          <button
            className={`nav-item ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            General
          </button>
          <button
            className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveSection('contact')}
          >
            Contact
          </button>
          <button
            className={`nav-item ${activeSection === 'social' ? 'active' : ''}`}
            onClick={() => setActiveSection('social')}
          >
            Social Media
          </button>
          <button
            className={`nav-item ${activeSection === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveSection('hero')}
          >
            Hero Section
          </button>
          <button
            className={`nav-item ${activeSection === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveSection('seo')}
          >
            SEO
          </button>
          <button
            className={`nav-item ${activeSection === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveSection('payment')}
          >
            Payment
          </button>
          <button
            className={`nav-item ${activeSection === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveSection('theme')}
          >
            Theme & UI
          </button>
        </nav>

        <form onSubmit={handleSubmit} className="settings-form">
          {activeSection === 'general' && renderGeneralSettings()}
          {activeSection === 'contact' && renderContactSettings()}
          {activeSection === 'social' && renderSocialMediaSettings()}
          {activeSection === 'hero' && renderHeroSettings()}
          {activeSection === 'seo' && renderSEOSettings()}
          {activeSection === 'payment' && renderPaymentSettings()}
          {activeSection === 'theme' && renderThemeSettings()}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteSettings;
