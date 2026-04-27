import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as apiModule from './api';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

jest.mock('./api', () => ({
  __esModule: true,
  auth: {
    login: jest.fn(),
    logout: jest.fn(),
  },
  mood: {
    logMood: jest.fn(),
  },
  user: {
    getAnalytics: jest.fn(),
    getSubscription: jest.fn(),
  }
}));

jest.mock('./pages/Dashboard', () => function MockDashboard() {
  return <div data-testid="dashboard-page">Dashboard Page</div>;
});

jest.mock('./pages/Login', () => function MockLogin() {
  return <div data-testid="login-page">Login Page</div>;
});

describe('App routing smoke test', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders login by default for signed-out users', async () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/launch dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard when auth token exists', async () => {
    localStorage.setItem('mh_token', 'test-token');

    render(
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });
});