import React from 'react';
import { useLucideIcons } from '../hooks/useLucideIcons';

const SettingsPage: React.FC = () => {
  // Initialize Lucide icons using custom hook
  useLucideIcons([]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <i data-lucide="settings" className="w-8 h-8"></i>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Configurações em desenvolvimento</h3>
      <p className="text-sm text-slate-500 max-w-sm">Esta funcionalidade está sendo implementada. Em breve estará disponível.</p>
    </div>
  );
};

export default SettingsPage;