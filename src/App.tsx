import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { ProfileSetupRoute } from './components/auth/ProfileSetupRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatusBadge from './components/StatusBadge';
import { MenuStatus, MenuItem } from './types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Data - will be replaced with Supabase data later
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

// Dashboard Component (extracted from main App)
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [menus] = useState<MenuItem[]>(INITIAL_MENUS);

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
  }, [activeTab, menus, isSidebarCollapsed]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home': return 'Painel Executivo de Nutrição';
      case 'shopping-list': return 'Lista de Compras e Suprimentos';
      case 'menus': return 'Gestão de Cardápios Escolares';
      case 'preparations': return 'Fichas de Preparações Culinaristas';
      case 'ingredients': return 'Banco de Ingredientes';
      case 'stock': return 'Controle de Estoques';
      default: return 'Nutri Schools';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Ingredientes', value: '0', sub: 'Cadastrados no sistema', icon: 'apple' },
          { label: 'Total Preparações', value: '0', sub: 'Receitas disponíveis', icon: 'chef-hat' },
          { label: 'Total Cardápios', value: '0', sub: 'Planejamentos criados', icon: 'utensils' },
          { label: 'Listas de Compras', value: '0', sub: 'Listas geradas', icon: 'shopping-cart' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <i data-lucide={kpi.icon} className="w-4 h-4 text-slate-400"></i>
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
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
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
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
              { text: 'Cadastrar ingredientes básicos', type: 'info' },
              { text: 'Criar primeira preparação', type: 'info' },
              { text: 'Planejar cardápio da semana', type: 'info' },
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
            Começar Configuração
          </button>
        </div>
      </div>
    </div>
  );

  const renderMenus = () => (
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
          <p className="text-sm text-slate-500 max-w-sm">Esta funcionalidade está sendo implementada. Em breve estará disponível.</p>
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
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight whitespace-nowrap">Sistema Online</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200 shrink-0 hidden md:block"></div>
            <div className="hidden md:flex gap-4 shrink-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Versão: <span className="text-slate-600">1.0.0</span></div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Ambiente: <span className="text-slate-600">Desenvolvimento</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />

          {/* Profile setup route */}
          <Route path="/profile-setup" element={
            <ProfileSetupRoute>
              <ProfileSetupPage />
            </ProfileSetupRoute>
          } />

          {/* Private routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;