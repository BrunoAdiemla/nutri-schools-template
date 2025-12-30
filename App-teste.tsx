import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { AuthProvider } from './contexts/AuthContext'
import { TimerProvider } from './contexts/TimerContext'
import { TesteGameProvider } from './contexts/TesteGameContext'
import i18n from './i18n'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { AulaAtualPage } from './pages/AulaAtualPage'
import { AulasAnterioresPage } from './pages/AulasAnterioresPage'
import { TurmasPage } from './pages/TurmasPage'
import { TurmaDetalhesPage } from './pages/TurmaDetalhesPage'
import { RankingsPage } from './pages/RankingsPage'
import { ConfiguracoesPage } from './pages/ConfiguracoesPage'
// import { ComponentsDemo } from './pages/ComponentsDemo' // Desabilitado - manter para uso futuro
import './App.css'

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <TimerProvider>
          <TesteGameProvider>
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

          {/* Private routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="/aula-atual" element={
            <PrivateRoute>
              <AulaAtualPage />
            </PrivateRoute>
          } />
          <Route path="/aulas-anteriores" element={
            <PrivateRoute>
              <AulasAnterioresPage />
            </PrivateRoute>
          } />
          <Route path="/turmas" element={
            <PrivateRoute>
              <TurmasPage />
            </PrivateRoute>
          } />
          <Route path="/turmas/:turmaId" element={
            <PrivateRoute>
              <TurmaDetalhesPage />
            </PrivateRoute>
          } />
          <Route path="/rankings" element={
            <PrivateRoute>
              <RankingsPage />
            </PrivateRoute>
          } />
          <Route path="/configuracoes" element={
            <PrivateRoute>
              <ConfiguracoesPage />
            </PrivateRoute>
          } />
          {/* Rota de componentes desabilitada - manter para uso futuro */}
          {/* <Route path="/componentes" element={
            <PrivateRoute>
              <ComponentsDemo />
            </PrivateRoute>
          } /> */}

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
            </Router>
          </TesteGameProvider>
        </TimerProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App