import React, { useState, useEffect } from 'react';
import { useLucideIcons } from '../hooks/useLucideIcons';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string, confirmPassword: string) => Promise<void>;
  loading: boolean;
}

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPasswords, setShowPasswords] = useState(false);

  // Initialize Lucide icons using custom hook
  useLucideIcons([isOpen, showPasswords, formData.newPassword, formData.confirmPassword]);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setShowPasswords(false);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData.newPassword, formData.confirmPassword);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Password change error:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <i data-lucide="lock" className="w-5 h-5 text-orange-600"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Alterar Senha</h2>
              <p className="text-sm text-slate-500">Digite sua nova senha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i data-lucide="x" className="w-5 h-5 text-slate-400"></i>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md text-sm transition-colors ${
                    errors.newPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-1`}
                  placeholder="Digite sua nova senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={loading}
                >
                  <i data-lucide={showPasswords ? 'eye-off' : 'eye'} className="w-4 h-4"></i>
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-md text-sm transition-colors ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-1`}
                  placeholder="Confirme sua nova senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={loading}
                >
                  <i data-lucide={showPasswords ? 'eye-off' : 'eye'} className="w-4 h-4"></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Requisitos da senha:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className="flex items-center gap-2">
                  <i data-lucide={formData.newPassword.length >= 6 ? 'check' : 'circle'} 
                     className={`w-3 h-3 ${formData.newPassword.length >= 6 ? 'text-green-600' : 'text-slate-400'}`}></i>
                  Pelo menos 6 caracteres
                </li>
                <li className="flex items-center gap-2">
                  <i data-lucide={formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'check' : 'circle'} 
                     className={`w-3 h-3 ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-slate-400'}`}></i>
                  Senhas coincidem
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Alterando...</span>
                  </div>
                ) : (
                  'Alterar Senha'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;