import React, { useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const hasRendered = useRef(false);

  useEffect(() => {
    if (!loading) {
      hasRendered.current = true;
    }
  }, [loading]);

  // Only show loading screen on initial load, not on subsequent auth state changes
  if (loading && !hasRendered.current) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-slate-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // ✅ Use Navigate do React Router ao invés de window.location.href
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};