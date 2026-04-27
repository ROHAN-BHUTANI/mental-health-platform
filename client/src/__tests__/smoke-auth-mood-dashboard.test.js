import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import * as apiModule from '../api';

const { auth: authApi, mood: moodApi, user: userApi } = apiModule;

jest.mock('../api', () => ({
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

const dashboardState = {
  streak: 1,
};

jest.mock('../pages/Login', () => function MockLogin() {
  const React = require('react');
  const { AuthContext } = require('../context/AuthContext');
  const { useContext, useState } = React;
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
  const { user, mood } = require('../api');

  React.useEffect(() => {
    user.getAnalytics();
  }, [user]);

  return (
    <div>
      <div>Dashboard Ready</div>
      <div>Current streak: {dashboardState.streak}</div>
      <button
        type="button"
        onClick={async () => {
          await mood.logMood({
            mood: 8,
            stress: 3,
            sleep: 7,
            text: 'Feeling good',
          });
          await user.getAnalytics();
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

    authApi.login.mockImplementation((email, password) => {
      return Promise.resolve({
        token: 'token-123',
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      });
    });

    moodApi.logMood.mockImplementation(() => {
      dashboardState.streak = 2;
      return Promise.resolve({
        success: true,
        data: { id: 'mood-1', mood: 8, stress: 3, sleep: 7 },
      });
    });

    userApi.getAnalytics.mockImplementation(() => {
      return Promise.resolve({
        streak_count: dashboardState.streak,
        avgMood: 7.2,
        riskLevel: 'low',
      });
    });
    
    userApi.getSubscription.mockResolvedValue({ subscription: { plan: 'free' } });
  });

  test('completes a basic authenticated mood logging flow', async () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: /launch dashboard/i }));

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    expect(await screen.findByText(/dashboard ready/i)).toBeInTheDocument();

    expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123');

    await userEvent.click(screen.getByRole('button', { name: /log mood/i }));

    await waitFor(() => {
      expect(moodApi.logMood).toHaveBeenCalledWith(expect.objectContaining({
        mood: 8,
        stress: 3,
        sleep: 7,
      }));
    });

    expect(userApi.getAnalytics).toHaveBeenCalled();
  });
});