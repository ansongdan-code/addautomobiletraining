import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import WebsiteEditor from './WebsiteEditor';

// Mock axios
jest.mock('axios');

const mockPages = [
  {
    _id: '1',
    title: 'Home Page',
    slug: 'home',
    content: '<p>Welcome to the home page!</p>',
    isPublished: true,
  },
  {
    _id: '2',
    title: 'About Us',
    slug: 'about',
    content: '<p>This is the about page.</p>',
    isPublished: false,
  },
];

describe('WebsiteEditor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    axios.get.mockResolvedValue({ data: { data: mockPages } });
    axios.put.mockResolvedValue({ data: { data: { ...mockPages[0], title: 'Updated Home Page' } } });
    axios.post.mockResolvedValue({ data: { data: { _id: '3', title: 'New Page', slug: 'new-page', content: '' } } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  test('renders access denied for non-super-admin users', () => {
    render(<WebsiteEditor userRole="admin" />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  test('fetches and displays pages for super-admin users', async () => {
    render(<WebsiteEditor userRole="super_admin" />);
    
    expect(screen.getByText('Loading pages...')).toBeInTheDocument();

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  test('allows creating a new page', async () => {
    render(<WebsiteEditor userRole="super_admin" />);

    const newPageButton = await screen.findByText('+ New Page');
    fireEvent.click(newPageButton);

    expect(screen.getByText('Create New Page')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Page' } });
    fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'new-page' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: '<p>New content</p>' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/website/editor/pages', expect.any(Object), expect.any(Object));
    });
    expect(await screen.findByText('Page created successfully!')).toBeInTheDocument();
  });

  test('allows editing an existing page', async () => {
    render(<WebsiteEditor userRole="super_admin" />);

    const homePage = await screen.findByText('Home Page');
    fireEvent.click(homePage);

    expect(screen.getByText('Edit Page')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Home Page' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/website/editor/pages/1', expect.any(Object), expect.any(Object));
    });
    expect(await screen.findByText('Page updated successfully!')).toBeInTheDocument();
  });

  test('allows deleting a page', async () => {
    window.confirm = jest.fn(() => true);
    render(<WebsiteEditor userRole="super_admin" />);

    const homePage = await screen.findByText('Home Page');
    fireEvent.click(homePage);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/website/editor/pages/1', expect.any(Object));
    });
    expect(await screen.findByText('Page deleted successfully!')).toBeInTheDocument();
  });

  test('toggles preview mode', async () => {
    render(<WebsiteEditor userRole="super_admin" />);
    
    const homePage = await screen.findByText('Home Page');
    fireEvent.click(homePage);

    fireEvent.click(screen.getByRole('button', { name: /preview/i }));
    expect(screen.getByTitle('Page Preview')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.queryByTitle('Page Preview')).not.toBeInTheDocument();
  });
});
