import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { user as userApi } from '../api';
import { AuthContext } from '../context/AuthContext';

jest.mock('../api', () => ({
  __esModule: true,
  user: {
    getAnalytics: jest.fn(),
    getSubscription: jest.fn(),
  },
  mood: {
    logMood: jest.fn(),
  },
  auth: {
    login: jest.fn(),
    register: jest.fn(),
  }
}));

jest.mock('../components/features/ChatWindow', () => function ChatMock() {
  return <div>Chat mock</div>;
});

jest.mock('../components/features/AnalyticsCharts', () => function ChartsMock() {
  return <div>Charts mock</div>;
});

describe('Dashboard analytics contract handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const mockAnalytics = {
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
    summary: { 
      sleepMoodCorrelation: 0.5, 
      stressVolatility: 0.4, 
      weeklyInsights: { current: { avgMood: 7, avgStress: 3, avgSleep: 8 }, deltaMood: 0.1 }, 
      monthlyInsights: { current: { avgMood: 7, avgStress: 3, avgSleep: 8 }, deltaMood: 0.2 } 
    },
    recentEntries: []
  };

  test('renders analytics values from the standard success/data contract', async () => {
    userApi.getAnalytics.mockResolvedValue(mockAnalytics);
    userApi.getSubscription.mockResolvedValue({ subscription: { plan: 'free' } });

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
    userApi.getAnalytics.mockResolvedValue({
      ...mockAnalytics,
      totalEntries: 2,
      status: 'Moderate',
      riskLevel: 'moderate'
    });
    userApi.getSubscription.mockResolvedValue({ subscription: { plan: 'free' } });

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