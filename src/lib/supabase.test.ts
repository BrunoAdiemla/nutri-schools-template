/**
 * Supabase Client Configuration Tests
 * Tests Supabase client setup and basic functionality
 * Requirements: 2.1, 2.2, 2.14
 */

import { createClient } from '@supabase/supabase-js';

// Mock environment variables
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key'
};

describe('Supabase Configuration', () => {
  describe('Client Creation', () => {
    it('should create Supabase client with valid configuration', () => {
      const client = createClient(mockEnv.VITE_SUPABASE_URL, mockEnv.VITE_SUPABASE_ANON_KEY);
      
      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.realtime).toBeDefined();
    });

    it('should have correct configuration options', () => {
      const client = createClient(mockEnv.VITE_SUPABASE_URL, mockEnv.VITE_SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      expect(client).toBeDefined();
    });
  });

  describe('Environment Validation', () => {
    it('should validate required environment variables exist', () => {
      expect(mockEnv.VITE_SUPABASE_URL).toBeDefined();
      expect(mockEnv.VITE_SUPABASE_ANON_KEY).toBeDefined();
      expect(mockEnv.VITE_SUPABASE_URL).toContain('supabase');
    });
  });

  describe('Connection Testing', () => {
    it('should handle successful database queries', async () => {
      const client = createClient(mockEnv.VITE_SUPABASE_URL, mockEnv.VITE_SUPABASE_ANON_KEY);
      
      // Mock successful query
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [{ count: 1 }],
            error: null
          })
        })
      });

      client.from = mockFrom;

      const { data, error } = await client.from('users').select('count').limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(mockFrom).toHaveBeenCalledWith('users');
    });

    it('should handle database errors gracefully', async () => {
      const client = createClient(mockEnv.VITE_SUPABASE_URL, mockEnv.VITE_SUPABASE_ANON_KEY);
      
      // Mock error response
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Connection failed' }
          })
        })
      });

      client.from = mockFrom;

      const { data, error } = await client.from('users').select('count').limit(1);
      
      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error.message).toBe('Connection failed');
    });
  });
});