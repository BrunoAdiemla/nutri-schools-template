import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/DatabaseService';

interface ProfileFormData {
  nome: string;
  cidade: string;
  estado: string;
  nome_escola: string;
  rua?: string;
  bairro?: string;
  cep?: string;
  funcao?: string;
}

interface ProfileFormErrors {
  nome?: string;
  cidade?: string;
  estado?: string;
  nome_escola?: string;
  cep?: string;
  general?: string;
}

const ProfileSetupPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    nome: '',
    cidade: '',
    estado: '',
    nome_escola: '',
    rua: '',
    bairro: '',
    cep: '',
    funcao: ''
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    // Nome validation
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Cidade validation
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    // Estado validation
    if (!formData.estado.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }

    // Nome da escola validation
    if (!formData.nome_escola.trim()) {
      newErrors.nome_escola = 'Nome da escola é obrigatório';
    }

    // CEP validation (optional but if provided, should be valid)
    if (formData.cep && !/^\d{5}-?\d{3}$/.test(formData.cep)) {
      newErrors.cep = 'CEP deve ter o formato 00000-000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof ProfileFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const profileData = {
        nome: formData.nome.trim(),
        email: user.email || '',
        cidade: formData.cidade.trim(),
        estado: formData.estado.trim(),
        nome_escola: formData.nome_escola.trim(),
        rua: formData.rua?.trim(),
        bairro: formData.bairro?.trim(),
        cep: formData.cep?.trim(),
        funcao: formData.funcao?.trim()
      };

      const profile = await DatabaseService.createUserProfile(user, profileData);
      
      if (!profile) {
        setErrors({
          general: 'Erro ao criar perfil. Tente novamente.'
        });
        return;
      }

      // Refresh profile in context to trigger redirect to dashboard
      await refreshProfile();
    } catch (error) {
      console.error('Profile creation error:', error);
      setErrors({
        general: 'Erro inesperado. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
            Complete seu perfil
          </h1>
          <p className="text-sm text-slate-600">
            Preencha seus dados para finalizar o cadastro e acessar o sistema
          </p>
        </div>

        {/* Profile Setup Form */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <i data-lucide="alert-circle" className="w-4 h-4 text-red-600"></i>
                  <span className="text-sm text-red-700">
                    {errors.general}
                  </span>
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Informações Pessoais
              </h3>

              {/* Nome Field */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    errors.nome
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-1`}
                  placeholder="Seu nome completo"
                  disabled={isSubmitting}
                />
                {errors.nome && (
                  <p className="mt-1 text-xs text-red-600">{errors.nome}</p>
                )}
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Informações Profissionais
              </h3>

              {/* Nome da Escola Field */}
              <div>
                <label htmlFor="nome_escola" className="block text-sm font-medium text-slate-700 mb-1">
                  Nome da Escola *
                </label>
                <input
                  type="text"
                  id="nome_escola"
                  name="nome_escola"
                  value={formData.nome_escola}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    errors.nome_escola
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-1`}
                  placeholder="Nome da instituição de ensino"
                  disabled={isSubmitting}
                />
                {errors.nome_escola && (
                  <p className="mt-1 text-xs text-red-600">{errors.nome_escola}</p>
                )}
              </div>

              {/* Função Field (Optional) */}
              <div>
                <label htmlFor="funcao" className="block text-sm font-medium text-slate-700 mb-1">
                  Função
                </label>
                <select
                  id="funcao"
                  name="funcao"
                  value={formData.funcao}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1"
                  disabled={isSubmitting}
                >
                  <option value="">Selecione sua função</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="gestor">Gestor Escolar</option>
                  <option value="coordenador">Coordenador de Alimentação</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
                Localização
              </h3>

              {/* Cidade and Estado Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-slate-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                      errors.cidade
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-1`}
                    placeholder="Sua cidade"
                    disabled={isSubmitting}
                  />
                  {errors.cidade && (
                    <p className="mt-1 text-xs text-red-600">{errors.cidade}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-slate-700 mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                      errors.estado
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-1`}
                    placeholder="Seu estado"
                    disabled={isSubmitting}
                  />
                  {errors.estado && (
                    <p className="mt-1 text-xs text-red-600">{errors.estado}</p>
                  )}
                </div>
              </div>

              {/* Optional Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="rua" className="block text-sm font-medium text-slate-700 mb-1">
                    Rua
                  </label>
                  <input
                    type="text"
                    id="rua"
                    name="rua"
                    value={formData.rua}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1"
                    placeholder="Nome da rua (opcional)"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-slate-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                      errors.cep
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-1`}
                    placeholder="00000-000"
                    disabled={isSubmitting}
                  />
                  {errors.cep && (
                    <p className="mt-1 text-xs text-red-600">{errors.cep}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-slate-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-1"
                  placeholder="Nome do bairro (opcional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Finalizando cadastro...</span>
                </div>
              ) : (
                'Finalizar Cadastro'
              )}
            </button>
          </form>
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

export default ProfileSetupPage;