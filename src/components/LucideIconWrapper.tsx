import React, { useEffect, useRef } from 'react';
import { reinitializeLucideIcons } from '../utils/lucideManager';

interface LucideIconWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper que força a re-inicialização dos ícones Lucide
 * Útil para componentes que são montados/desmontados frequentemente
 */
const LucideIconWrapper: React.FC<LucideIconWrapperProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Usar reinicialização com limpeza para evitar conflitos
    reinitializeLucideIcons();
  });

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default LucideIconWrapper;