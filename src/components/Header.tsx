import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLucideIcons } from '../hooks/useLucideIcons';

interface HeaderProps {
  title: string;
  onNavigate?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onNavigate }) => {
  const { user, profile, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Lucide icons using custom hook
  useLucideIcons([isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.nome) {
      return profile.nome
        .split(' ')
        .map(name => name.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <div className="h-4 w-[1px] bg-slate-200"></div>
        <nav className="flex text-xs text-slate-400 gap-2">
          <span>Sistema</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nutri Schools</span>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
          <i data-lucide="bell" className="w-5 h-5"></i>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-700 flex items-center justify-center overflow-hidden text-white text-sm font-semibold">
              {getUserInitials()}
            </div>
            <i 
              data-lucide="chevron-down" 
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            ></i>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)}></div>
              
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-slate-200 shadow-lg py-2 z-40">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {profile?.nome || 'Usuário'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                      {profile?.nome_escola && (
                        <p className="text-xs text-slate-400 truncate">
                          {profile.nome_escola}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onNavigate?.('profile');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <i data-lucide="user" className="w-4 h-4 text-slate-400"></i>
                    Meu Perfil
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onNavigate?.('settings');
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <i data-lucide="settings" className="w-4 h-4 text-slate-400"></i>
                    Configurações
                  </button>

                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <i data-lucide="help-circle" className="w-4 h-4 text-slate-400"></i>
                    Ajuda e Suporte
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-slate-100 my-1"></div>

                {/* Logout */}
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <i data-lucide="log-out" className="w-4 h-4 text-red-500"></i>
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;