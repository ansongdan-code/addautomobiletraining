import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WebsiteSettings from './WebsiteSettings';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the showNotification function from App.js
jest.mock('../../App', () => ({
  showNotification: jest.fn(),
}));

const mockSettings = {
  siteName: 'Test Site',
  siteDescription: 'A description',
  logo: '/path/to/logo.png',
  favicon: '/path/to/favicon.ico',
  primaryColor: '#2196F3',
  secondaryColor: '#FFC107',
  footerText: 'Footer text',
  contactInfo: {
    email: 'test@example.com',
    phone: '123-456-7890',
    address: '123 Test St',
  },
  socialMedia: {
    facebook: 'https://facebook.com/test',
    twitter: 'https://twitter.com/test',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: ''
  },
  hero: {
    title: 'Hero Title',
    subtitle: 'Hero Subtitle',
    backgroundImage: '/path/to/bg.jpg',
    ctaText: 'Click Me',
    secondaryCtaText: 'Learn More'
  },
  seo: {
    metaTitle: 'Meta Title',
    metaDescription: 'Meta Description',
    keywords: ['keyword1', 'keyword2'],
    googleAnalytics: 'GA-123',
    facebookPixel: 'FP-123'
  },
  paymentMethods: {
    paypal: { enabled: true, clientId: 'paypal-id', clientSecret: 'paypal-secret' },
    paystack: { enabled: false, publicKey: '', secretKey: '' },
  },
  theme: {
    fontFamily: 'Arial, sans-serif',
    primaryColor: '#2196F3',
    secondaryColor: '#FFC107',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
  },
};

describe('WebsiteSettings Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('token', 'test-token');
    fetch.mockImplementation((url, options) => {
      if (url === '/api/admin/settings') {
        if (!options || options.method === 'GET' || options.method === undefined) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: mockSettings }),
          });
        }
        if (options.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Settings updated successfully!' }),
          });
        }
      }
      return Promise.reject(new Error(`Unhandled request: ${url} ${options ? options.method : 'GET'}`));
    });
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  test('renders loading state initially', () => {
    render(<WebsiteSettings />);
    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
  });

  test('fetches and displays settings', async () => {
    render(<WebsiteSettings />);
    await waitFor(() => {
      expect(screen.getByLabelText('Site Name *')).toHaveValue(mockSettings.siteName);
      expect(screen.getByLabelText('Site Description')).toHaveValue(mockSettings.siteDescription);
    });
  });

  test('handles input change in general settings', async () => {
    render(<WebsiteSettings />);
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Site Name *'), { target: { value: 'New Site Name' } });
      expect(screen.getByLabelText('Site Name *')).toHaveValue('New Site Name');
    });
  });

  test('switches between settings sections', async () => {
    render(<WebsiteSettings />);
    await waitFor(() => screen.getByText('General'));

    fireEvent.click(screen.getByText('Contact'));
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Social Media'));
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
  });

  test('submits updated settings', async () => {
    const { showNotification } = require('../../App');
    render(<WebsiteSettings />);
    
    await waitFor(() => {
        expect(screen.getByLabelText('Site Name *')).toHaveValue(mockSettings.siteName);
    });

    fireEvent.change(screen.getByLabelText('Site Name *'), { target: { value: 'Updated Site Name' } });
    fireEvent.click(screen.getByText('Save Settings'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/settings', expect.objectContaining({
        method: 'PUT',
      }));
      expect(showNotification).toHaveBeenCalledWith('Settings updated successfully!', 'success');
    });
  });
});
