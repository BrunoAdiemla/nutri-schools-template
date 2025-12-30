import '@testing-library/jest-dom';

// Mock Lucide icons
Object.defineProperty(window, 'lucide', {
  value: {
    createIcons: jest.fn(),
  },
  writable: true,
});

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
process.env.VITE_APP_ENV = 'test';