import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

const dashboardState = {
  streak: 1,
  averageMood: 6.5,
  riskLevel: 'low',
};

jest.mock('../pages/Login', () => function MockLogin() {
  const React = require('react');
  const { AuthContext } = require('../context/AuthContext');
  const { useContext } = React;
  const { login } = useContext(AuthContext);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await login({ email, password });
      }}
    >
      <label htmlFor="email">Email</label>
      <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label>
      <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <button type="submit">Sign In</button>
    </form>
  );
});

jest.mock('../pages/Dashboard', () => function MockDashboard() {
  const React = require('react');
  const mockApi = require('../services/api').default;

  React.useEffect(() => {
    mockApi.get('/user/analytics');
  }, []);

  return (
    <div>
      <div>Dashboard Ready</div>
      <div>Current streak: {dashboardState.streak}</div>
      <button
        type="button"
        onClick={async () => {
          await mockApi.post('/mood/log', {
            mood: 8,
            stress: 3,
            sleep: 7,
            text: 'Feeling good',
          });
          await mockApi.get('/user/analytics');
        }}
      >
        Log Mood
      </button>
    </div>
  );
});

describe('smoke flow: login -> mood log -> dashboard refresh', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    dashboardState.streak = 1;

    api.post.mockImplementation((url) => {
      if (url === '/auth/login') {
        return Promise.resolve({
          data: {
            token: 'token-123',
            user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
          },
        });
      }

      if (url === '/mood/log') {
        dashboardState.streak = 2;
        return Promise.resolve({
          data: {
            success: true,
            data: {
              id: 'mood-1',
              mood: 8,
              stress: 3,
              sleep: 7,
            },
          },
        });
      }

      return Promise.resolve({ data: { success: true, data: {} } });
    });

    api.get.mockImplementation((url) => {
      if (url === '/user/analytics') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              streak: dashboardState.streak,
              averageMood: 7.2,
              riskLevel: 'low',
            },
          },
        });
      }

      return Promise.resolve({ data: { success: true, data: {} } });
    });
  });

  test('completes a basic authenticated mood logging flow', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /launch dashboard/i }));

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    expect(await screen.findByText(/dashboard ready/i)).toBeInTheDocument();

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    await userEvent.click(screen.getByRole('button', { name: /log mood/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/mood/log', expect.objectContaining({
        mood: 8,
        stress: 3,
        sleep: 7,
      }));
    });

    expect(api.get).toHaveBeenCalledWith('/user/analytics');
  });
});