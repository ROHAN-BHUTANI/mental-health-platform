import '@testing-library/jest-dom';

const originalWarn = console.warn;

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (firstArg.includes('React Router Future Flag Warning')) {
      return;
    }
    originalWarn(...args);
  });
});

afterAll(() => {
  if (console.warn.mockRestore) {
    console.warn.mockRestore();
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});