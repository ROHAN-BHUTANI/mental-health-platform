import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import api from './services/api';

jest.mock('./services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  },
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
    api.get.mockResolvedValue({ data: { success: true, data: { user: null } } });
  });

  test('renders login by default for signed-out users', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/launch dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard when auth token exists', async () => {
    localStorage.setItem('mh_token', 'test-token');

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });
});