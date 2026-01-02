import React, { useEffect, useState } from 'react';
import { useLucideIcons } from '../hooks/useLucideIcons';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Initialize Lucide icons
  useLucideIcons([toast.type]);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto-remove after duration
    const duration = toast.duration || 4000;
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-md w-full";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} bg-slate-50 border-slate-200 text-slate-800`;
    }
  };

  const getIconName = () => {
    switch (toast.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      default:
        return 'bell';
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={getToastStyles()}>
        {/* Icon */}
        <div className="flex-shrink-0">
          <i data-lucide={getIconName()} className={`w-5 h-5 ${getIconColor()}`}></i>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <i data-lucide="x" className="w-4 h-4 opacity-60"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;