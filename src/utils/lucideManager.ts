/**
 * Gerenciador de ícones Lucide
 * Implementa estratégias para evitar conflitos com React
 */

let isInitializing = false;
let initQueue: (() => void)[] = [];

/**
 * Inicializa ícones Lucide de forma segura
 */
export const initializeLucideIcons = (): Promise<void> => {
  return new Promise((resolve) => {
    // Se já está inicializando, adicionar à fila
    if (isInitializing) {
      initQueue.push(() => resolve());
      return;
    }

    isInitializing = true;

    const tryInitialize = () => {
      try {
        // @ts-ignore - Tentar função global primeiro
        if (window.initLucideIcons && typeof window.initLucideIcons === 'function') {
          // @ts-ignore
          window.initLucideIcons();
          finishInitialization();
          resolve();
          return;
        }

        // @ts-ignore - Fallback para método direto
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          // @ts-ignore
          window.lucide.createIcons();
          finishInitialization();
          resolve();
          return;
        }

        // Se Lucide não está disponível, tentar novamente em breve
        setTimeout(tryInitialize, 50);
      } catch (error) {
        // Em caso de erro, apenas finalizar silenciosamente
        finishInitialization();
        resolve();
      }
    };

    // Usar requestAnimationFrame para garantir DOM pronto
    requestAnimationFrame(tryInitialize);
  });
};

/**
 * Finaliza o processo de inicialização e processa a fila
 */
const finishInitialization = () => {
  isInitializing = false;
  
  // Processar fila de callbacks
  const queue = [...initQueue];
  initQueue = [];
  queue.forEach(callback => callback());
};

/**
 * Limpa todos os ícones existentes (útil antes de re-inicializar)
 */
export const clearLucideIcons = () => {
  try {
    // Remover todos os elementos SVG criados pelo Lucide
    const lucideIcons = document.querySelectorAll('i[data-lucide] svg');
    lucideIcons.forEach(icon => {
      if (icon.parentNode) {
        icon.parentNode.removeChild(icon);
      }
    });
  } catch (error) {
    // Silenciar erros de limpeza
  }
};

/**
 * Reinicializa ícones com limpeza prévia
 */
export const reinitializeLucideIcons = async () => {
  clearLucideIcons();
  await initializeLucideIcons();
};