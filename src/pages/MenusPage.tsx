import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MenuStatus, MenuItem } from '../types';
import { useLucideIcons } from '../hooks/useLucideIcons';

// Mock Data - will be replaced with Supabase data later
const INITIAL_MENUS: MenuItem[] = [
  { id: '1', name: 'Almoço: Arroz, Feijão, Frango Grelhado, Brócolis', school: 'Escola Municipal Central', date: '2023-11-20', calories: 450, protein: 32, status: MenuStatus.APPROVED },
  { id: '2', name: 'Lanche: Maçã e Iogurte Natural', school: 'CMEI Cantinho Feliz', date: '2023-11-20', calories: 180, protein: 8, status: MenuStatus.PENDING },
  { id: '3', name: 'Almoço: Macarrão Integral à Bolonhesa', school: 'E.E. Padre Anchieta', date: '2023-11-21', calories: 520, protein: 28, status: MenuStatus.DRAFT },
  { id: '4', name: 'Lanche: Sanduíche de Queijo e Suco de Laranja', school: 'Escola Municipal Central', date: '2023-11-21', calories: 310, protein: 12, status: MenuStatus.APPROVED },
  { id: '5', name: 'Almoço: Peixe Assado com Purê de Mandioquinha', school: 'CMEI Cantinho Feliz', date: '2023-11-22', calories: 480, protein: 35, status: MenuStatus.PENDING },
];

const MenusPage: React.FC = () => {
  const [menus] = useState<MenuItem[]>(INITIAL_MENUS);

  // Initialize Lucide icons using custom hook
  useLucideIcons([menus]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Cardápios Planejados</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-md hover:bg-slate-50 font-medium">Filtros</button>
          <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold shadow-sm">+ Novo Cardápio</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refeição / Itens</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unidade</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Valores Nutricionais</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {menus.map((menu) => (
              <tr key={menu.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 text-sm">{menu.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600">{menu.school}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold self-start">{menu.calories} kcal</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold self-start">{menu.protein}g Proteína</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-500 font-medium">{menu.date}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={menu.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                      <i data-lucide="more-horizontal" className="w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenusPage;