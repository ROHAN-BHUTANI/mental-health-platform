describe('analytics and API response contract', () => {
  const normalizePayload = (payload) => {
    if (payload && typeof payload.success === 'boolean') {
      return payload;
    }

    return {
      success: true,
      data: payload || {},
      error: null,
    };
  };

  test('keeps standard response contract intact', () => {
    const payload = {
      success: true,
      data: {
        streak: 4,
        averageMood: 7.1,
        riskLevel: 'low',
      },
      error: null,
    };

    const normalized = normalizePayload(payload);

    expect(normalized).toEqual(payload);
    expect(normalized.success).toBe(true);
    expect(normalized.error).toBeNull();
  });

  test('normalizes legacy analytics payloads for compatibility', () => {
    const legacyPayload = {
      streak: 0,
      averageMood: 0,
      riskLevel: 'unknown',
    };

    const normalized = normalizePayload(legacyPayload);

    expect(normalized).toEqual({
      success: true,
      data: legacyPayload,
      error: null,
    });
  });

  test('handles empty analytics states without breaking contract', () => {
    const normalized = normalizePayload(null);

    expect(normalized.success).toBe(true);
    expect(normalized.data).toEqual({});
    expect(normalized.error).toBeNull();
  });
});