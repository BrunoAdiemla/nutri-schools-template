import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

// Mock the AuthService
jest.mock('../services/AuthService', () => ({
  AuthService: {
    signIn: jest.fn(),
    validateEmail: jest.fn(),
    validatePassword: jest.fn()
  }
}));

// Mock Lucide icons
Object.defineProperty(window, 'lucide', {
  value: {
    createIcons: jest.fn()
  },
  writable: true
});

const MockedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    expect(screen.getByText('NutriSchools')).toBeInTheDocument();
    expect(screen.getByText('Acesse sua conta')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email deve ter um formato válido')).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const passwordInput = screen.getByLabelText('Senha') as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector('button');

    expect(passwordInput.type).toBe('password');

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    }
  });

  it('clears field errors when user starts typing', async () => {
    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    // Trigger validation error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test@' } });

    await waitFor(() => {
      expect(screen.queryByText('Email é obrigatório')).not.toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    const { AuthService } = require('../services/AuthService');
    AuthService.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Entrando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on login failure', async () => {
    const { AuthService } = require('../services/AuthService');
    AuthService.signIn.mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    render(
      <MockedAuthProvider>
        <LoginPage />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});