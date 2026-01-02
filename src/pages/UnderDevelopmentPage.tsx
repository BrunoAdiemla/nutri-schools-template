import React from 'react';
import { useLucideIcons } from '../hooks/useLucideIcons';

interface UnderDevelopmentPageProps {
  featureName: string;
}

const UnderDevelopmentPage: React.FC<UnderDevelopmentPageProps> = ({ featureName }) => {
  // Initialize Lucide icons using custom hook
  useLucideIcons([featureName]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
        <i data-lucide="hammer" className="w-8 h-8"></i>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {featureName.charAt(0).toUpperCase() + featureName.slice(1).replace('-', ' ')} em desenvolvimento
      </h3>
      <p className="text-sm text-slate-500 max-w-sm">
        Esta funcionalidade está sendo implementada. Em breve estará disponível.
      </p>
    </div>
  );
};

export default UnderDevelopmentPage;