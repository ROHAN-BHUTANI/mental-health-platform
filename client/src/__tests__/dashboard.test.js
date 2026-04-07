import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

jest.mock('../components/ChatWindow', () => function ChatMock() {
  return <div>Chat mock</div>;
});

jest.mock('../components/AnalyticsCharts', () => function ChartsMock() {
  return <div>Charts mock</div>;
});

describe('Dashboard analytics contract handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders analytics values from the standard success/data contract', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/user/analytics') {
        return Promise.resolve({
          data: {
            totalEntries: 5,
            avgMood: 7.4,
            avgStress: 3,
            avgSleep: 8,
            streak_count: 5,
            riskLevel: 'Low',
            confidence: 0.88,
            status: 'Stable',
            insights: 'Stable week ahead',
            recommendations: ['Keep your current routine'],
            charts: { moodTrend: [], stressTrend: [], emotionDistribution: [], activityImpact: [] },
            summary: { sleepMoodCorrelation: 0.5, stressVolatility: 0.4, weeklyInsights: { current: { avgMood: 7, avgStress: 3, avgSleep: 8 }, deltaMood: 0.1 }, monthlyInsights: { current: { avgMood: 7, avgStress: 3, avgSleep: 8 }, deltaMood: 0.2 } },
            recentEntries: []
          },
        });
      }

      return Promise.resolve({ data: { success: true, data: {} } });
    });

    render(
      <AuthContext.Provider value={{ token: 'token', user: { name: 'Test User' } }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Executive Overview/i)).toBeInTheDocument();
    });
  });

  test('tolerates legacy analytics payload shapes', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/user/analytics') {
        return Promise.resolve({
          data: {
            totalEntries: 2,
            avgMood: 6,
            avgStress: 5,
            avgSleep: 7,
            streak_count: 2,
            riskLevel: 'moderate',
            confidence: 0.4,
            status: 'Moderate',
            insights: 'Needs attention',
            recommendations: [],
            charts: { moodTrend: [], stressTrend: [], emotionDistribution: [], activityImpact: [] },
            summary: { sleepMoodCorrelation: 0, stressVolatility: 0, weeklyInsights: { current: { avgMood: 6, avgStress: 5, avgSleep: 7 }, deltaMood: 0 }, monthlyInsights: { current: { avgMood: 6, avgStress: 5, avgSleep: 7 }, deltaMood: 0 } },
            recentEntries: []
          },
        });
      }

      return Promise.resolve({ data: {} });
    });

    render(
      <AuthContext.Provider value={{ token: 'token', user: { name: 'Legacy User' } }}>
        <Dashboard />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Executive Overview/i)).toBeInTheDocument();
    });
  });
});