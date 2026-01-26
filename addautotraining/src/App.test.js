import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock fetch API
global.fetch = jest.fn((url) => {
  if (url.startsWith('/api/website/pages/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { customCSS: '' } }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

test('renders homepage title', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const titleElement = screen.getByText(/welcome to auto training academy/i);
  expect(titleElement).toBeInTheDocument();
});
