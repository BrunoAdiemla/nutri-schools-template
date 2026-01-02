# Toast Notifications - Guia de Uso

## Visão Geral

O sistema de toast notifications foi implementado para substituir as notificações inline (cards) por notificações flutuantes que aparecem no canto superior direito da tela. Isso melhora significativamente a experiência do usuário, especialmente em formulários longos onde o usuário pode não ver a mensagem de confirmação.

## Como Usar

### 1. Importar o Hook

```typescript
import { useToast } from '../hooks/useToast';
```

### 2. Usar no Componente

```typescript
const MyComponent: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSave = async () => {
    try {
      // Sua lógica de salvamento aqui
      await saveData();
      
      // Mostrar toast de sucesso
      showSuccess('Dados salvos com sucesso!');
      
    } catch (error) {
      // Mostrar toast de erro
      showError('Erro ao salvar', 'Tente novamente.');
    }
  };

  return (
    // Seu JSX aqui
  );
};
```

## Tipos de Toast Disponíveis

### 1. Sucesso (Success)
```typescript
showSuccess('Título', 'Mensagem opcional');
// Duração: 4 segundos
// Cor: Verde
// Ícone: check-circle
```

### 2. Erro (Error)
```typescript
showError('Título', 'Mensagem opcional');
// Duração: 6 segundos (mais tempo para ler)
// Cor: Vermelho
// Ícone: alert-circle
```

### 3. Aviso (Warning)
```typescript
showWarning('Título', 'Mensagem opcional');
// Duração: 5 segundos
// Cor: Amarelo
// Ícone: alert-triangle
```

### 4. Informação (Info)
```typescript
showInfo('Título', 'Mensagem opcional');
// Duração: 4 segundos
// Cor: Azul
// Ícone: info
```

### 5. Toast Personalizado
```typescript
showToast({
  type: 'success',
  title: 'Título personalizado',
  message: 'Mensagem personalizada',
  duration: 3000 // Duração em milissegundos
});
```

## Características

- **Posicionamento**: Canto superior direito da tela
- **Animação**: Desliza da direita para a esquerda
- **Auto-remoção**: Remove automaticamente após a duração especificada
- **Remoção manual**: Usuário pode clicar no X para fechar
- **Empilhamento**: Múltiplos toasts são empilhados verticalmente
- **Responsivo**: Funciona bem em dispositivos móveis

## Quando Usar Toast vs Notificações Inline

### Use Toast para:
- ✅ Confirmação de ações (salvar, atualizar, deletar)
- ✅ Feedback de operações assíncronas
- ✅ Notificações de sistema
- ✅ Mensagens que não requerem ação imediata

### Use Notificações Inline para:
- ❌ Erros de validação de formulário
- ❌ Mensagens que requerem ação imediata
- ❌ Contexto específico de um campo/seção

## Implementações Atuais

### ProfilePage
- ✅ Perfil atualizado com sucesso
- ✅ Erro ao atualizar perfil
- ✅ Senha alterada com sucesso
- ✅ Erro ao alterar senha

### ForgotPasswordPage
- ✅ Email de recuperação enviado
- ✅ Erro ao enviar email

## Próximos Passos

Para implementar toast notifications em outros componentes:

1. Importe o hook: `import { useToast } from '../hooks/useToast';`
2. Use no componente: `const { showSuccess, showError } = useToast();`
3. Substitua mensagens inline por chamadas de toast
4. Remova estados de feedback locais desnecessários

## Exemplo Completo

```typescript
import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';

const ExampleComponent: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    
    try {
      // Simular operação assíncrona
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sucesso
      showSuccess('Operação concluída!', 'Dados foram processados com sucesso.');
      
    } catch (error) {
      // Erro
      showError('Falha na operação', 'Tente novamente em alguns instantes.');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleAction}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Processando...' : 'Executar Ação'}
      </button>
    </div>
  );
};

export default ExampleComponent;
```