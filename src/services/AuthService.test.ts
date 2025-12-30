/**
 * AuthService Unit Tests
 * Tests authentication service functionality
 * Requirements: 3.6, 3.7, 3.8, 3.9, 3.11
 */

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      refreshSession: jest.fn()
    }
  }
}));

// Mock DatabaseService
jest.mock('./DatabaseService', () => ({
  DatabaseService: {
    createUserProfile: jest.fn(),
    getUserProfile: jest.fn()
  }
}));

import { AuthService, SignUpData, SignInData } from './AuthService';
import { supabase } from '../lib/supabase';
import { DatabaseService } from './DatabaseService';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign Up', () => {
    const mockSignUpData: SignUpData = {
      nome: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!',
      cidade: 'Test City',
      estado: 'Test State',
      nome_escola: 'Test School'
    };

    it('should sign up user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };
      const mockProfile = { id: 'user-123', nome: 'Test User' };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockDatabaseService.createUserProfile.mockResolvedValue(mockProfile as any);

      const result = await AuthService.signUp(mockSignUpData);

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: mockSignUpData.email,
        password: mockSignUpData.password,
        options: {
          data: {
            nome: mockSignUpData.nome,
            cidade: mockSignUpData.cidade,
            estado: mockSignUpData.estado,
            nome_escola: mockSignUpData.nome_escola
          }
        }
      });
      expect(mockDatabaseService.createUserProfile).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          nome: mockSignUpData.nome,
          email: mockSignUpData.email,
          cidade: mockSignUpData.cidade,
          estado: mockSignUpData.estado,
          nome_escola: mockSignUpData.nome_escola
        })
      );
    });

    it('should handle sign up auth errors', async () => {
      const authError = { message: 'Email already registered' };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: authError as any
      });

      const result = await AuthService.signUp(mockSignUpData);

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(authError);
    });

    it('should handle profile creation failure', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      mockDatabaseService.createUserProfile.mockResolvedValue(null);

      const result = await AuthService.signUp(mockSignUpData);

      // Should still return success even if profile creation fails
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });
  });

  describe('Sign In', () => {
    const mockSignInData: SignInData = {
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    it('should sign in user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123' };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      const result = await AuthService.signIn(mockSignInData);

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockSignInData.email,
        password: mockSignInData.password
      });
    });

    it('should handle sign in errors', async () => {
      const authError = { message: 'Invalid credentials' };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError as any
      });

      const result = await AuthService.signIn(mockSignInData);

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(authError);
    });
  });

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await AuthService.signOut();

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const authError = { message: 'Sign out failed' };

      mockSupabase.auth.signOut.mockResolvedValue({ error: authError as any });

      const result = await AuthService.signOut();

      expect(result.error).toEqual(authError);
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email successfully', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: `${window.location.origin}/reset-password` }
      );
    });

    it('should handle password reset errors', async () => {
      const authError = { message: 'Email not found' };

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: authError as any });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.error).toEqual(authError);
    });
  });

  describe('Password Update', () => {
    it('should update password successfully', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({ error: null });

      const result = await AuthService.updatePassword('NewPass123!');

      expect(result.error).toBeNull();
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPass123!'
      });
    });

    it('should handle password update errors', async () => {
      const authError = { message: 'Password update failed' };

      mockSupabase.auth.updateUser.mockResolvedValue({ error: authError as any });

      const result = await AuthService.updatePassword('NewPass123!');

      expect(result.error).toEqual(authError);
    });
  });

  describe('Session Management', () => {
    it('should get current session successfully', async () => {
      const mockSession = { access_token: 'token-123' };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await AuthService.getCurrentSession();

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should get current user successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await AuthService.getCurrentUser();

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should refresh session successfully', async () => {
      const mockSession = { access_token: 'new-token-123' };

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await AuthService.refreshSession();

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });
  });

  describe('User Profile', () => {
    it('should get user profile successfully', async () => {
      const mockProfile = { id: 'user-123', nome: 'Test User' };

      mockDatabaseService.getUserProfile.mockResolvedValue(mockProfile as any);

      const result = await AuthService.getUserProfile('user-123');

      expect(result.profile).toEqual(mockProfile);
      expect(result.error).toBeNull();
      expect(mockDatabaseService.getUserProfile).toHaveBeenCalledWith('user-123');
    });

    it('should handle profile not found', async () => {
      mockDatabaseService.getUserProfile.mockResolvedValue(null);

      const result = await AuthService.getUserProfile('user-123');

      expect(result.profile).toBeNull();
      expect(result.error).toBe('Profile not found');
    });
  });

  describe('Validation', () => {
    describe('Email Validation', () => {
      it('should validate correct email formats', () => {
        expect(AuthService.validateEmail('test@example.com')).toBe(true);
        expect(AuthService.validateEmail('user.name@domain.co.uk')).toBe(true);
        expect(AuthService.validateEmail('test+tag@example.org')).toBe(true);
      });

      it('should reject invalid email formats', () => {
        expect(AuthService.validateEmail('invalid-email')).toBe(false);
        expect(AuthService.validateEmail('test@')).toBe(false);
        expect(AuthService.validateEmail('@example.com')).toBe(false);
        expect(AuthService.validateEmail('test.example.com')).toBe(false);
      });
    });

    describe('Password Validation', () => {
      it('should validate strong passwords', () => {
        const result = AuthService.validatePassword('StrongPass123!');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject weak passwords', () => {
        const result = AuthService.validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters long');
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should validate individual password requirements', () => {
        // Too short
        let result = AuthService.validatePassword('Short1!');
        expect(result.errors).toContain('Password must be at least 8 characters long');

        // No uppercase
        result = AuthService.validatePassword('lowercase123!');
        expect(result.errors).toContain('Password must contain at least one uppercase letter');

        // No lowercase
        result = AuthService.validatePassword('UPPERCASE123!');
        expect(result.errors).toContain('Password must contain at least one lowercase letter');

        // No number
        result = AuthService.validatePassword('NoNumbers!');
        expect(result.errors).toContain('Password must contain at least one number');
      });
    });
  });

  describe('Authentication Status', () => {
    it('should return true when user is authenticated', async () => {
      const mockSession = { access_token: 'token-123' };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});