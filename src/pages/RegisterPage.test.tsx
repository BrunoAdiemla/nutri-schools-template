import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import RegisterPage from './RegisterPage';

// Mock the AuthService
jest.mock('../services/AuthService', () => ({
  AuthService: {
    signUp: jest.fn(),
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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form with all required fields', () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    expect(screen.getByText('NutriSchools')).toBeInTheDocument();
    expect(screen.getByText('Criar nova conta')).toBeInTheDocument();
    
    // Required fields
    expect(screen.getByLabelText('Nome Completo *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha *')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar Senha *')).toBeInTheDocument();
    expect(screen.getByLabelText('Cidade *')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado *')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da Escola *')).toBeInTheDocument();
    
    // Optional fields
    expect(screen.getByLabelText('Função')).toBeInTheDocument();
    expect(screen.getByLabelText('Rua')).toBeInTheDocument();
    expect(screen.getByLabelText('CEP')).toBeInTheDocument();
    expect(screen.getByLabelText('Bairro')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: 'Criar Conta' })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome completo é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Confirmação de senha é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Cidade é obrigatória')).toBeInTheDocument();
      expect(screen.getByText('Estado é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Nome da escola é obrigatório')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const emailInput = screen.getByLabelText('Email *');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email deve ter um formato válido')).toBeInTheDocument();
    });
  });

  it('shows validation error for weak password', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const passwordInput = screen.getByLabelText('Senha *');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 8 caracteres')).toBeInTheDocument();
    });
  });

  it('shows validation error for password complexity', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const passwordInput = screen.getByLabelText('Senha *');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número')).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const passwordInput = screen.getByLabelText('Senha *');
    const confirmPasswordInput = screen.getByLabelText('Confirmar Senha *');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid CEP format', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const cepInput = screen.getByLabelText('CEP');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Nome Completo *'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha *'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Senha *'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Cidade *'), { target: { value: 'Test City' } });
    fireEvent.change(screen.getByLabelText('Estado *'), { target: { value: 'Test State' } });
    fireEvent.change(screen.getByLabelText('Nome da Escola *'), { target: { value: 'Test School' } });
    
    fireEvent.change(cepInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('CEP deve ter o formato 00000-000')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const passwordInput = screen.getByLabelText('Senha *') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirmar Senha *') as HTMLInputElement;
    
    const passwordToggle = passwordInput.parentElement?.querySelector('button');
    const confirmPasswordToggle = confirmPasswordInput.parentElement?.querySelector('button');

    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    if (passwordToggle) {
      fireEvent.click(passwordToggle);
      expect(passwordInput.type).toBe('text');
    }

    if (confirmPasswordToggle) {
      fireEvent.click(confirmPasswordToggle);
      expect(confirmPasswordInput.type).toBe('text');
    }
  });

  it('clears field errors when user starts typing', async () => {
    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    const nameInput = screen.getByLabelText('Nome Completo *');
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });

    // Trigger validation error
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Nome completo é obrigatório')).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(nameInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.queryByText('Nome completo é obrigatório')).not.toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    const { AuthService } = require('../services/AuthService');
    AuthService.signUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    // Fill all required fields
    fireEvent.change(screen.getByLabelText('Nome Completo *'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha *'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Senha *'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Cidade *'), { target: { value: 'Test City' } });
    fireEvent.change(screen.getByLabelText('Estado *'), { target: { value: 'Test State' } });
    fireEvent.change(screen.getByLabelText('Nome da Escola *'), { target: { value: 'Test School' } });

    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    fireEvent.click(submitButton);

    expect(screen.getByText('Criando conta...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on registration failure', async () => {
    const { AuthService } = require('../services/AuthService');
    AuthService.signUp.mockResolvedValue({
      success: false,
      error: 'Email already exists'
    });

    render(
      <MockedAuthProvider>
        <RegisterPage />
      </MockedAuthProvider>
    );

    // Fill all required fields
    fireEvent.change(screen.getByLabelText('Nome Completo *'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha *'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar Senha *'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Cidade *'), { target: { value: 'Test City' } });
    fireEvent.change(screen.getByLabelText('Estado *'), { target: { value: 'Test State' } });
    fireEvent.change(screen.getByLabelText('Nome da Escola *'), { target: { value: 'Test School' } });

    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('calls onNavigateToLogin when login link is clicked', () => {
    const mockNavigateToLogin = jest.fn();
    
    render(
      <MockedAuthProvider>
        <RegisterPage onNavigateToLogin={mockNavigateToLogin} />
      </MockedAuthProvider>
    );

    const loginLink = screen.getByText('Faça login');
    fireEvent.click(loginLink);

    expect(mockNavigateToLogin).toHaveBeenCalledTimes(1);
  });
});