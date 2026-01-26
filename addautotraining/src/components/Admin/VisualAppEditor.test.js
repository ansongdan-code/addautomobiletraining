import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import VisualAppEditor from './VisualAppEditor';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

const mockUser = {
    role: 'super_admin'
};

const mockPages = [
    { _id: '1', name: 'Home', slug: 'home', components: [] },
    { _id: '2', name: 'About', slug: 'about', components: [] }
];

const mockStyles = {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
};

describe('VisualAppEditor', () => {
    beforeEach(() => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/editor/app/pages')) {
                return Promise.resolve({ data: { data: mockPages } });
            }
            if (url.includes('/api/editor/app/styles')) {
                return Promise.resolve({ data: { data: mockStyles } });
            }
            return Promise.reject(new Error('not found'));
        });
        axios.post.mockResolvedValue({ data: { data: { _id: '3', name: 'New Page', slug: 'new-page' } } });
        axios.put.mockResolvedValue({ data: { data: { ...mockPages[0], name: 'Updated Home' } } });
        axios.delete.mockResolvedValue({ data: { success: true } });
        window.localStorage.setItem('token', 'test-token');
    });

    test('renders without crashing for super_admin', async () => {
        render(<VisualAppEditor userRole={mockUser.role} />);
        await waitFor(() => {
            expect(screen.getByText('🎨 Visual App Editor')).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText('Home')).toBeInTheDocument();
        });
    });

    test('shows access denied for non-admin users', () => {
        const nonAdminUser = { role: 'student' };
        render(<VisualAppEditor userRole={nonAdminUser.role} />);
        expect(screen.getByText('❌ Access Denied')).toBeInTheDocument();
        expect(screen.getByText('Only admin users can access the Visual App Editor.')).toBeInTheDocument();
    });

    test('switches between modes', async () => {
        render(<VisualAppEditor userRole={mockUser.role} />);
        
        const editorControls = screen.getByTestId('editor-controls');
        fireEvent.click(within(editorControls).getByRole('button', { name: /Styles/i }));
        await waitFor(() => {
            expect(screen.getByText('🎨 Global Styles')).toBeInTheDocument();
        });
        
        fireEvent.click(within(editorControls).getByRole('button', { name: /Settings/i }));
        await waitFor(() => {
            expect(screen.getByText('⚙️ Editor Settings')).toBeInTheDocument();
        });

        fireEvent.click(within(editorControls).getByRole('button', { name: /Pages/i }));
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: '📄 Pages' })).toBeInTheDocument();
        });
    });

    test('allows creating a page', async () => {
        render(<VisualAppEditor userRole={mockUser.role} />);
        fireEvent.change(screen.getByPlaceholderText('Page Name'), { target: { value: 'New Page' } });
        fireEvent.change(screen.getByPlaceholderText('Page Slug (e.g., about-us)'), { target: { value: 'new-page' } });
        fireEvent.click(screen.getByText('✨ Create Page'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/editor/app/pages', expect.objectContaining({ name: 'New Page', slug: 'new-page' }), expect.any(Object));
        });
    });

    test('allows updating styles', async () => {
        render(<VisualAppEditor userRole={mockUser.role} />);
        fireEvent.click(screen.getByText('🎨 Styles'));

        await screen.findByText('🎨 Global Styles');

        // This is a simplified interaction, a real color picker would be more complex
        const primaryColorInput = screen.getByLabelText('Primary Color');
        fireEvent.input(primaryColorInput, { target: { value: '#ff0000' } });

        fireEvent.click(screen.getByText('💾 Save Styles'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/editor/app/styles', expect.objectContaining({
                primaryColor: '#ff0000'
            }), expect.any(Object));
        });
    });

    test('allows selecting a page to edit components', async () => {
        render(<VisualAppEditor userRole={mockUser.role} />);
        await waitFor(() => {
            expect(screen.getByText('Home')).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText('Home'));
        await waitFor(() => {
            expect(screen.getByText('Home - Components')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: '➕ Add Component' })).toBeInTheDocument();
    });
});
