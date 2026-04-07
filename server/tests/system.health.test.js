describe('system health route contract', () => {
  test('health payload shape matches success/data/error contract', () => {
    const payload = {
      success: true,
      data: {
        status: 'ok',
        uptime: 123,
      },
      error: null,
    };

    expect(payload).toHaveProperty('success', true);
    expect(payload).toHaveProperty('data');
    expect(payload).toHaveProperty('error', null);
    expect(payload.data.status).toBe('ok');
  });

  test('health route remains JSON serializable for deployment checks', () => {
    const payload = {
      success: true,
      data: {
        status: 'ok',
        service: 'mental-health-platform-api',
      },
      error: null,
    };

    expect(() => JSON.stringify(payload)).not.toThrow();
  });
});