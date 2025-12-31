import React from 'react';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, isCollapsed, onToggleCollapse }) => {
  return (
    <aside 
      key={isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-40 shadow-sm`}
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between relative h-16 shrink-0">
        <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <i data-lucide="leaf" className="w-5 h-5 text-white"></i>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 whitespace-nowrap">
            Nutri<span className="text-blue-600">Schools</span>
          </span>
        </div>
        
        {isCollapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto shrink-0">
            <i data-lucide="leaf" className="w-5 h-5 text-white"></i>
          </div>
        )}

        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleCollapse();
          }}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-md transition-all z-50 focus:outline-none"
          style={{ zIndex: 50 }}
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <i data-lucide={isCollapsed ? "chevron-right" : "chevron-left"} className="w-3 h-3"></i>
        </button>
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group ${
              activeItem === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <i 
              data-lucide={item.icon} 
              className={`w-4 h-4 shrink-0 transition-colors ${
                activeItem === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            ></i>
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 shrink-0">
        {!isCollapsed ? (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Sistema</p>
            <p className="text-sm font-medium text-slate-900">Nutri Schools</p>
            <p className="text-xs text-slate-500 mt-1">Versão: 1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center text-slate-300 py-2">
            <i data-lucide="info" className="w-5 h-5"></i>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;