import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ToastData } from '../components/Toast';
import ToastContainer from '../components/ToastContainer';

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const newToast: ToastData = {
      ...toast,
      id: generateId(),
    };

    setToasts(prev => [...prev, newToast]);
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 4000,
    });
  };

  const showError = (title: string, message?: string) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 6000, // Errors stay longer
    });
  };

  const showWarning = (title: string, message?: string) => {
    showToast({
      type: 'warning',
      title,
      message,
      duration: 5000,
    });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};