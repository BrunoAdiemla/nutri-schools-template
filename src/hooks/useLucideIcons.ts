import { useEffect } from 'react';
import { initializeLucideIcons } from '../utils/lucideManager';

/**
 * Hook personalizado para inicializar ícones Lucide de forma segura
 * Evita conflitos durante mudanças de rota e re-renderizações
 */
export const useLucideIcons = (dependencies: any[] = []) => {
  useEffect(() => {
    // Usar o gerenciador para inicialização segura
    initializeLucideIcons();
  }, dependencies);
};