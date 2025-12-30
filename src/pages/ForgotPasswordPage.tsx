import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Initialize Lucide icons
  useEffect(() => {
    const timer = setTimeout(() => {
      // @ts-ignore
      if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email deve ter um formato válido');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const result = await resetPassword(email.trim());
      
      if (!result.success) {
        setError(result.error || 'Erro ao enviar email de recuperação');
      } else {
        setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-slate-600">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i data-lucide="leaf" className="w-6 h-6 text-white"></i>
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">
              Nutri<span className="text-blue-600">Schools</span>
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Recuperar senha
          </h1>
          <p className="text-sm text-slate-600">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        {/* Recovery Form */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2">
                  <i data-lucide="check-circle" className="w-4 h-4 text-green-600"></i>
                  <span className="text-sm text-green-700">{message}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <i data-lucide="alert-circle" className="w-4 h-4 text-red-600"></i>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1"
                  placeholder="seu@email.com"
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i data-lucide="mail" className="w-4 h-4 text-slate-400"></i>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !!message}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enviando...</span>
                </div>
              ) : message ? (
                'Email enviado'
              ) : (
                'Enviar instruções'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-500">
                Lembrou da senha?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Voltar ao login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Sistema Online</span>
            <span>•</span>
            <span>Versão 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;