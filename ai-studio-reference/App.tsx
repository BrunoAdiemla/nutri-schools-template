
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatusBadge from './components/StatusBadge';
import { MenuStatus, MenuItem, AIInsight } from './types';
import { analyzeMenuNutritionalValue } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Data
const INITIAL_MENUS: MenuItem[] = [
  { id: '1', name: 'Almoço: Arroz, Feijão, Frango Grelhado, Brócolis', school: 'Escola Municipal Central', date: '2023-11-20', calories: 450, protein: 32, status: MenuStatus.APPROVED },
  { id: '2', name: 'Lanche: Maçã e Iogurte Natural', school: 'CMEI Cantinho Feliz', date: '2023-11-20', calories: 180, protein: 8, status: MenuStatus.PENDING },
  { id: '3', name: 'Almoço: Macarrão Integral à Bolonhesa', school: 'E.E. Padre Anchieta', date: '2023-11-21', calories: 520, protein: 28, status: MenuStatus.DRAFT },
  { id: '4', name: 'Lanche: Sanduíche de Queijo e Suco de Laranja', school: 'Escola Municipal Central', date: '2023-11-21', calories: 310, protein: 12, status: MenuStatus.APPROVED },
  { id: '5', name: 'Almoço: Peixe Assado com Purê de Mandioquinha', school: 'CMEI Cantinho Feliz', date: '2023-11-22', calories: 480, protein: 35, status: MenuStatus.PENDING },
];

const COMPLIANCE_DATA = [
  { name: 'Seg', rate: 94 },
  { name: 'Ter', rate: 88 },
  { name: 'Qua', rate: 92 },
  { name: 'Qui', rate: 95 },
  { name: 'Sex', rate: 91 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [menus] = useState<MenuItem[]>(INITIAL_MENUS);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Initialize Lucide icons whenever the DOM structure might have changed
  useEffect(() => {
    const timer = setTimeout(() => {
      // @ts-ignore
      if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons();
      }
    }, 50); // Small delay to let React finish rendering
    return () => clearTimeout(timer);
  }, [activeTab, selectedMenu, aiInsight, menus, isSidebarCollapsed]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const handleAnalyzeMenu = async (menu: MenuItem) => {
    setSelectedMenu(menu);
    setIsLoadingInsight(true);
    setAiInsight(null);
    const result = await analyzeMenuNutritionalValue(menu);
    setAiInsight(result);
    setIsLoadingInsight(false);
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home': return 'Painel Executivo de Nutrição';
      case 'shopping-list': return 'Lista de Compras e Suprimentos';
      case 'menus': return 'Gestão de Cardápios Escolares';
      case 'preparations': return 'Fichas de Preparações Culinaristas';
      case 'ingredients': return 'Banco de Ingredientes';
      default: return 'Nutri Schools Enterprise';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Refeições Planejadas', value: '12.480', sub: '+12% vs. mês ant.', icon: 'Utensils' },
          { label: 'Unidades Ativas', value: '42', sub: 'Rede Municipal Total', icon: 'School' },
          { label: 'Taxa de Conformidade', value: '94.2%', sub: 'Padrão PNAE alcançado', icon: 'CheckCircle2', color: 'text-green-600' },
          { label: 'Revisões Pendentes', value: '08', sub: 'Exige atenção urgente', icon: 'Clock', color: 'text-yellow-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <i data-lucide={kpi.icon} className="w-4 h-4 text-slate-400"></i>
            </div>
            <div className={`text-2xl font-bold ${kpi.color || 'text-slate-900'}`}>{kpi.value}</div>
            <div className="text-xs text-slate-400 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">Conformidade Semanal (%)</h3>
            <button className="text-xs text-blue-600 font-medium hover:underline">Ver relatório completo</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COMPLIANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Ações Recomendadas</h3>
          <div className="space-y-4">
            {[
              { text: 'Aprovar cardápio da Escola Central (Semana 47)', type: 'urgent' },
              { text: 'Reposição de estoque: Arroz Integral em falta no Setor B', type: 'warning' },
              { text: 'Gerar relatório mensal de desperdício', type: 'info' },
            ].map((action, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-md bg-slate-50 border border-slate-100 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  action.type === 'urgent' ? 'bg-red-500' : action.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <p className="text-xs text-slate-700 leading-tight font-medium">{action.text}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md transition-colors">
            Acessar Central de Tarefas
          </button>
        </div>
      </div>
    </div>
  );

  const renderMenus = () => (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      <div className="xl:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
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
                <th className="px-6 py-3 text-[11px) font-bold text-slate-500 uppercase tracking-wider">Valores Nutricionais</th>
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
                      <button 
                        onClick={() => handleAnalyzeMenu(menu)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" 
                        title="Análise IA"
                      >
                        <i data-lucide="sparkles" className="w-4 h-4"></i>
                      </button>
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
          <div className="flex items-center gap-2 mb-1">
            <i data-lucide="sparkles" className="w-4 h-4 text-blue-600"></i>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Nutri AI Insight</h3>
          </div>
          <p className="text-[10px] text-slate-500">Análise técnica avançada baseada em regulação PNAE</p>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          {!selectedMenu ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
              <i data-lucide="info" className="w-8 h-8 text-slate-300"></i>
              <p className="text-sm text-slate-500 px-4">Selecione o ícone <i data-lucide="sparkles" className="w-3 h-3 inline"></i> na tabela para gerar uma análise detalhada.</p>
            </div>
          ) : isLoadingInsight ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-600 animate-pulse">Consultando padrões nutricionais...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Item Analisado</div>
                <div className="text-sm font-semibold text-slate-900 border-l-2 border-blue-600 pl-3 py-1">{selectedMenu.name}</div>
              </div>

              {aiInsight && (
                <>
                  <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-blue-600 uppercase">Score de Conformidade</span>
                      <span className="text-lg font-bold text-blue-700">{aiInsight.complianceScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${aiInsight.complianceScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                      <i data-lucide="activity" className="w-3 h-3"></i> Análise Técnica
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{aiInsight.analysis}"</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                      <i data-lucide="list-checks" className="w-3 h-3"></i> Sugestões
                    </h4>
                    <ul className="space-y-2">
                      {aiInsight.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-2 items-start">
                          <i data-lucide="chevron-right" className="w-3 h-3 text-blue-500 mt-0.5 shrink-0"></i>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderDashboard();
      case 'menus': return renderMenus();
      default: return (
        <div key={activeTab} className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <i data-lucide="hammer" className="w-8 h-8"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} em desenvolvimento</h3>
          <p className="text-sm text-slate-500 max-w-sm">Esta funcionalidade está sendo componentizada para atender aos requisitos de escala da rede.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        activeItem={activeTab} 
        onItemClick={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header title={getHeaderTitle()} />
        
        <div 
          key={isSidebarCollapsed ? 'content-collapsed' : 'content-expanded'}
          className="flex-1 p-8 pb-32 overflow-y-auto"
        >
          {renderContent()}
        </div>

        <div className={`fixed bottom-6 right-8 ${isSidebarCollapsed ? 'left-28' : 'left-72'} bg-white/90 border border-slate-200 shadow-xl rounded-lg p-4 flex items-center justify-between z-20 backdrop-blur-sm transition-all duration-300 ease-in-out`}>
          <div className="flex items-center gap-6 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight whitespace-nowrap">Sincronização Ativa</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200 shrink-0 hidden md:block"></div>
            <div className="hidden md:flex gap-4 shrink-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Última Atualização: <span className="text-slate-600">há 2 min</span></div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Região: <span className="text-slate-600">Sul (BR-PR)</span></div>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
             <button className="px-4 py-2 text-[10px] md:text-xs font-bold text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition-all uppercase tracking-wider">Visualizar LOGS</button>
             <button className="px-4 py-2 text-[10px] md:text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md transition-all uppercase tracking-wider">Aprovação em Massa</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
