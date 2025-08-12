import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Auth0
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
  useAuth0: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Setup crypto mock for Node.js environment
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn(),
  },
  writable: true,
});

test('renders application', () => {
  render(<App />);
  // Test that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
