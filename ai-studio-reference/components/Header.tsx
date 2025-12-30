
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <div className="h-4 w-[1px] bg-slate-200"></div>
        <nav className="flex text-xs text-slate-400 gap-2">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">Nutrição Integrada</span>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <i data-lucide="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
          <input 
            type="text" 
            placeholder="Pesquisar em toda a rede..." 
            className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
            <i data-lucide="bell" className="w-5 h-5"></i>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
            <img src="https://picsum.photos/seed/user1/40/40" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
