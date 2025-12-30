
import React from 'react';
import { MenuStatus } from '../types';

interface StatusBadgeProps {
  status: MenuStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    [MenuStatus.APPROVED]: { label: 'Aprovado', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'check-circle' },
    [MenuStatus.PENDING]: { label: 'Pendente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'clock' },
    [MenuStatus.DRAFT]: { label: 'Rascunho', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: 'file-text' },
    [MenuStatus.REJECTED]: { label: 'Rejeitado', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'alert-circle' },
  };

  const { label, bg, text, border, icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border ${bg} ${text} ${border}`}>
      <i data-lucide={icon} className="w-3 h-3"></i>
      {label}
    </span>
  );
};

export default StatusBadge;
