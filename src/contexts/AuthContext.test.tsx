import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthService } from '../services/AuthService';
import type { UserProfile } from '../services/DatabaseService';

// Mock supabase module completely
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn()
    }
  }
}));

// Mock AuthService
jest.mock('../services/AuthService');

// Import mocked supabase after mocking
import { supabase } from '../lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthContext - fetchProfileWithCache', () => {
  const mockUserId = 'test-user-123';
  const mockProfile: UserProfile = {
    id: 'profile-123',
    auth_user_id: mockUserId,
    full_name: 'Test User',
    role: 'nutritionist',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default mock setup
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSupabase.auth.onAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Cache Hit Behavior', () => {
    it('should return cached data when cache is valid', async () => {
      // Setup: Mock successful profile fetch
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
        error: null
      });

      // Setup: Mock authenticated session
      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      // Render hook
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First call should fetch from database
      expect(mockAuthService.getUserProfile).toHaveBeenCalledTimes(1);
      expect(result.current.profile).toEqual(mockProfile);

      // Clear mock to verify cache is used
      mockAuthService.getUserProfile.mockClear();

      // Trigger another auth state change with same user
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('TOKEN_REFRESHED', mockSession);

      // Should NOT call getUserProfile again (cache hit)
      expect(mockAuthService.getUserProfile).not.toHaveBeenCalled();
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  describe('Cache Miss Behavior', () => {
    it('should fetch from database when cache is empty', async () => {
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
        error: null
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fetch from database
      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(mockUserId);
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  describe('Cache Expiration Behavior', () => {
    it('should fetch fresh data when cache expires after 20 minutes', async () => {
      const updatedProfile: UserProfile = {
        ...mockProfile,
        full_name: 'Updated User'
      };

      // Setup: First call returns original profile, second call returns updated profile
      let callCount = 0;
      mockAuthService.getUserProfile = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ profile: mockProfile, error: null });
        } else {
          return Promise.resolve({ profile: updatedProfile, error: null });
        }
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profile).toEqual(mockProfile);
      expect(mockAuthService.getUserProfile).toHaveBeenCalledTimes(1);

      // Advance time by 21 minutes (past cache expiration)
      const futureTime = Date.now() + (21 * 60 * 1000);
      jest.setSystemTime(futureTime);

      // Trigger auth state change
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('SIGNED_IN', mockSession);

      // Should fetch fresh data and update profile
      await waitFor(() => {
        expect(mockAuthService.getUserProfile).toHaveBeenCalledTimes(2);
        expect(result.current.profile?.full_name).toBe('Updated User');
      }, { timeout: 5000 });

      expect(result.current.profile).toEqual(updatedProfile);
    });
  });

  describe('Null Profile Caching', () => {
    it('should cache null profiles correctly', async () => {
      // Mock profile not found
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: null,
        error: 'Profile not found'
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have null profile
      expect(result.current.profile).toBeNull();
      expect(result.current.needsProfileSetup).toBe(true);
      expect(mockAuthService.getUserProfile).toHaveBeenCalledTimes(1);

      // Clear mock
      mockAuthService.getUserProfile.mockClear();

      // Trigger another auth event
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('TOKEN_REFRESHED', mockSession);

      // Should use cached null (not call database again)
      expect(mockAuthService.getUserProfile).not.toHaveBeenCalled();
      expect(result.current.profile).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should return null gracefully on database error', async () => {
      // Mock database error
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: null,
        error: 'Database connection failed'
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should handle error gracefully
      expect(result.current.profile).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull(); // Error should not block auth
    });

    it('should cache null result on exception to avoid repeated failures', async () => {
      // Mock exception
      mockAuthService.getUserProfile = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have null profile
      expect(result.current.profile).toBeNull();
      expect(mockAuthService.getUserProfile).toHaveBeenCalledTimes(1);

      // Clear mock
      mockAuthService.getUserProfile.mockClear();

      // Trigger another auth event
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('TOKEN_REFRESHED', mockSession);

      // Should use cached null (not retry failed operation)
      expect(mockAuthService.getUserProfile).not.toHaveBeenCalled();
    });
  });
});

describe('AuthContext - handleAuthStateChange', () => {
  const mockUserId = 'test-user-456';
  const mockProfile: UserProfile = {
    id: 'profile-456',
    auth_user_id: mockUserId,
    full_name: 'Handler Test User',
    role: 'nutritionist',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSupabase.auth.onAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('SIGNED_OUT Event', () => {
    it('should clear all state on SIGNED_OUT', async () => {
      // Setup: Start with authenticated state
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
        error: null
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Wait for initial authenticated state
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Trigger SIGNED_OUT event
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('SIGNED_OUT', null);

      // Verify state is cleared
      await waitFor(() => {
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
        expect(result.current.profile).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('TOKEN_REFRESHED Event', () => {
    it('should update session silently without reloading profile', async () => {
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
        error: null
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        },
        access_token: 'old-token'
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = mockAuthService.getUserProfile.mock.calls.length;

      // Trigger TOKEN_REFRESHED with new token
      const refreshedSession = {
        ...mockSession,
        access_token: 'new-token'
      };

      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('TOKEN_REFRESHED', refreshedSession);

      // Verify profile was NOT reloaded
      expect(mockAuthService.getUserProfile).toHaveBeenCalledTimes(initialCallCount);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('SIGNED_IN with Unconfirmed Email', () => {
    it('should stay unauthenticated when email is not confirmed', async () => {
      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: null // Not confirmed
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger SIGNED_IN with unconfirmed email
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('SIGNED_IN', mockSession);

      // Verify user stays unauthenticated
      await waitFor(() => {
        expect(result.current.session).toBeNull();
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('SIGNED_IN with Confirmed Email', () => {
    it('should load profile and authenticate user', async () => {
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
        error: null
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger SIGNED_IN
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('SIGNED_IN', mockSession);

      // Verify authentication and profile loaded
      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Error During Profile Fetch', () => {
    it('should not block authentication when profile fetch fails', async () => {
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: null,
        error: 'Database error'
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger SIGNED_IN
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('SIGNED_IN', mockSession);

      // Verify authentication succeeds even with profile error
      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.user).toEqual(mockSession.user);
        expect(result.current.profile).toBeNull();
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.needsProfileSetup).toBe(true);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Loading State Always Resolves', () => {
    it('should always set loading to false after processing', async () => {
      mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
        profile: mockProfile,
        error: null
      });

      const mockSession = {
        user: {
          id: mockUserId,
          email: 'test@example.com',
          email_confirmed_at: new Date().toISOString()
        }
      };

      mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Initial loading should resolve
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger SIGNED_IN
      const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
      await authStateCallback('SIGNED_IN', mockSession);

      // Loading should resolve after sign in
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger SIGNED_OUT
      await authStateCallback('SIGNED_OUT', null);

      // Loading should resolve after sign out
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});


// Property-Based Tests using fast-check
import * as fc from 'fast-check';

describe('AuthContext - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    mockSupabase.auth.onAuthStateChange = jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Feature: auth-context-refactor, Property 1: Loading State Always Resolves
   * Validates: Requirements 4.1, 4.4, 9.2
   * 
   * Property: For any authentication event processed by the AuthContext,
   * the loading state SHALL be set to false before the event handler completes,
   * regardless of success or failure.
   */
  describe('Property 1: Loading State Always Resolves', () => {
    it('should always set loading to false after processing any auth event', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random auth events
          fc.constantFrom('SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'INITIAL_SESSION'),
          // Generate random user IDs
          fc.uuid(),
          // Generate random email confirmation status
          fc.boolean(),
          // Generate random profile fetch results (success, error, or exception)
          fc.constantFrom('success', 'error', 'exception'),
          async (event, userId, emailConfirmed, profileResult) => {
            // Setup mock based on profile result
            if (profileResult === 'success') {
              mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
                profile: {
                  id: 'profile-' + userId,
                  auth_user_id: userId,
                  full_name: 'Test User',
                  role: 'nutritionist',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                error: null
              });
            } else if (profileResult === 'error') {
              mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
                profile: null,
                error: 'Profile not found'
              });
            } else {
              mockAuthService.getUserProfile = jest.fn().mockRejectedValue(
                new Error('Network error')
              );
            }

            const mockSession = event === 'SIGNED_OUT' ? null : {
              user: {
                id: userId,
                email: 'test@example.com',
                email_confirmed_at: emailConfirmed ? new Date().toISOString() : null
              }
            };

            mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
              data: { session: null },
              error: null
            });

            const { result, unmount } = renderHook(() => useAuth(), {
              wrapper: AuthProvider
            });

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 3000 });

            // Trigger the auth event
            const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
            await authStateCallback(event, mockSession);

            // Property: Loading MUST be false after processing
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 3000 });

            unmount();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });
  });

  /**
   * Feature: auth-context-refactor, Property 4: State Atomicity
   * Validates: Requirements 1.2, 4.5
   * 
   * Property: For any authentication state update, all related fields
   * (session, user, profile, loading) SHALL be updated in a single setState call
   * to prevent partial state updates.
   */
  describe('Property 4: State Atomicity', () => {
    it('should update all state fields atomically', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.boolean(),
          async (userId, hasProfile) => {
            mockAuthService.getUserProfile = jest.fn().mockResolvedValue({
              profile: hasProfile ? {
                id: 'profile-' + userId,
                auth_user_id: userId,
                full_name: 'Test User',
                role: 'nutritionist',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } : null,
              error: hasProfile ? null : 'Profile not found'
            });

            const mockSession = {
              user: {
                id: userId,
                email: 'test@example.com',
                email_confirmed_at: new Date().toISOString()
              }
            };

            mockSupabase.auth.getSession = jest.fn().mockResolvedValue({
              data: { session: null },
              error: null
            });

            const { result, unmount } = renderHook(() => useAuth(), {
              wrapper: AuthProvider
            });

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Trigger SIGNED_IN
            const authStateCallback = (mockSupabase.auth.onAuthStateChange as jest.Mock).mock.calls[0][0];
            await authStateCallback('SIGNED_IN', mockSession);

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Property: All fields should be consistent
            // If session exists, user should exist
            if (result.current.session) {
              expect(result.current.user).toBeTruthy();
              expect(result.current.user?.id).toBe(userId);
            }

            // If user exists, session should exist
            if (result.current.user) {
              expect(result.current.session).toBeTruthy();
            }

            // isAuthenticated should match session && user
            expect(result.current.isAuthenticated).toBe(
              !!(result.current.session && result.current.user)
            );

            // needsProfileSetup should match session && user && !profile
            expect(result.current.needsProfileSetup).toBe(
              !!(result.current.session && result.current.user && !result.current.profile)
            );

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
