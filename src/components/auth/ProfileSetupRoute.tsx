import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileSetupRouteProps {
  children: React.ReactNode;
}

export const ProfileSetupRoute: React.FC<ProfileSetupRouteProps> = ({ children }) => {
  const { isAuthenticated, needsProfileSetup, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-slate-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but doesn't need profile setup, redirect to dashboard
  if (!needsProfileSetup) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and needs profile setup
  return <>{children}</>;
};