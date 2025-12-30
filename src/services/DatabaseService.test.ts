/**
 * Database Service Tests
 * Tests DatabaseService CRUD operations and user profile management
 * Requirements: 2.2, 2.11, 2.12
 */

// Mock the supabase import
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn()
  }
}));

import { DatabaseService } from './DatabaseService';
import { supabase } from '../lib/supabase';

// Cast supabase to jest mock
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Profile Management', () => {
    it('should create user profile successfully', async () => {
      const mockUser = { id: 'test-user-id' };
      const mockProfileData = {
        nome: 'Test User',
        email: 'test@example.com',
        cidade: 'Test City',
        estado: 'Test State',
        nome_escola: 'Test School'
      };

      const mockResult = { id: 'test-user-id', ...mockProfileData };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockResult,
              error: null
            })
          })
        })
      });

      const result = await DatabaseService.createUserProfile(mockUser as any, mockProfileData);
      
      expect(result).toEqual(mockResult);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should handle user profile creation errors', async () => {
      const mockUser = { id: 'test-user-id' };
      const mockProfileData = {
        nome: 'Test User',
        email: 'test@example.com',
        cidade: 'Test City',
        estado: 'Test State',
        nome_escola: 'Test School'
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' }
            })
          })
        })
      });

      const result = await DatabaseService.createUserProfile(mockUser as any, mockProfileData);
      expect(result).toBeNull();
    });

    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: 'test-user-id',
        nome: 'Test User',
        email: 'test@example.com',
        cidade: 'Test City',
        estado: 'Test State',
        nome_escola: 'Test School'
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      const result = await DatabaseService.getUserProfile('test-user-id');
      
      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should update user profile successfully', async () => {
      const mockUpdates = { nome: 'Updated Name' };
      const mockResult = { id: 'test-user-id', ...mockUpdates };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockResult,
                error: null
              })
            })
          })
        })
      });

      const result = await DatabaseService.updateUserProfile('test-user-id', mockUpdates);
      
      expect(result).toEqual(mockResult);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });
  });

  describe('Dashboard Statistics', () => {
    it('should fetch dashboard stats successfully', async () => {
      // Mock Promise.all to return successful counts
      const mockCounts = [
        { count: 5, error: null },
        { count: 3, error: null },
        { count: 2, error: null },
        { count: 1, error: null }
      ];

      jest.spyOn(Promise, 'all').mockResolvedValue(mockCounts);

      // Mock individual table queries
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 5, error: null })
        })
      });

      const result = await DatabaseService.getDashboardStats('test-user-id');
      
      expect(result).toEqual({
        ingredientes: 5,
        preparacoes: 3,
        cardapios: 2,
        listas_compras: 1
      });
    });

    it('should handle dashboard stats errors', async () => {
      const mockCounts = [
        { count: null, error: { message: 'Error' } },
        { count: 3, error: null },
        { count: 2, error: null },
        { count: 1, error: null }
      ];

      jest.spyOn(Promise, 'all').mockResolvedValue(mockCounts);

      const result = await DatabaseService.getDashboardStats('test-user-id');
      expect(result).toBeNull();
    });
  });

  describe('Generic CRUD Operations', () => {
    it('should create record successfully', async () => {
      const mockData = { name: 'Test Item' };
      const mockResult = { id: 'test-id', ...mockData };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockResult,
              error: null
            })
          })
        })
      });

      const result = await DatabaseService.create('test_table', mockData);
      
      expect(result).toEqual(mockResult);
      expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
    });

    it('should read records with filters', async () => {
      const mockData = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
      const filters = { created_by: 'user-id' };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockData,
            error: null
          })
        })
      });

      const result = await DatabaseService.read('test_table', filters);
      
      expect(result).toEqual(mockData);
      expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
    });

    it('should update record successfully', async () => {
      const mockUpdates = { name: 'Updated Item' };
      const mockResult = { id: 'test-id', ...mockUpdates };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockResult,
                error: null
              })
            })
          })
        })
      });

      const result = await DatabaseService.update('test_table', 'test-id', mockUpdates);
      
      expect(result).toEqual(mockResult);
      expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
    });

    it('should delete record successfully', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null
          })
        })
      });

      const result = await DatabaseService.delete('test_table', 'test-id');
      
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('test_table');
    });

    it('should handle delete errors', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Delete failed' }
          })
        })
      });

      const result = await DatabaseService.delete('test_table', 'test-id');
      
      expect(result).toBe(false);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should set up real-time subscriptions', () => {
      const mockCallback = jest.fn();
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn()
      };

      (mockSupabase.channel as jest.Mock).mockReturnValue(mockChannel);

      const unsubscribe = DatabaseService.subscribeToUserData('test-user-id', mockCallback);
      
      expect(mockSupabase.channel).toHaveBeenCalledTimes(4); // 4 tables
      expect(mockChannel.on).toHaveBeenCalledTimes(4);
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(4);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});