# Nutri Schools - Visão Geral do Projeto

## Proposta de Valor
Sistema web para nutricionistas escolares montarem cardápios semanais e gerarem listas de compras automatizadas baseadas em quantidades, comensais e valores per capita. O app também calcula valores calóricos para cada refeição do cardápio.

## Público-Alvo
- Nutricionistas escolares
- Gestores escolares

## Stack Tecnológico

### Frontend
- **React**: 18.2.0
- **TypeScript**: 5.0.2
- **Vite**: 4.4.5
- **React Router DOM**: 6.15.0
- **TailwindCSS**: 3.3.3

### Backend & Database
- **Supabase**: Banco de dados PostgreSQL + Autenticação

### Dev Tools
- **ESLint**: 8.45.0
- **PostCSS**: 8.4.29
- **Autoprefixer**: 10.4.15

## Funcionalidades do MVP

### Core Features
1. **CRUD de Ingredientes**
   - Nome, unidade de medida, calorias por unidade
   - Ingredientes padrão (default)

2. **CRUD de Preparações**
   - Nome, valor per capita, modo de preparo
   - Tipo (sólido, líquido, frutas, etc.)
   - Refeições onde pode ser servida
   - Ingredientes com quantidades

3. **CRUD de Cardápios**
   - Planejamento por semana
   - Dias com múltiplas refeições
   - Especificação de preparações e comensais

4. **CRUD de Refeições**
   - Tipos: colação, almoço, lanche, jantar
   - Comensais por faixa etária (adultos, pequenos, adolescentes)

5. **CRUD de Lista de Compras**
   - Geração automática baseada nos cardápios
   - Período configurável (data inicial/final)

6. **Gestão de Estoque**
   - Atualização de quantidades dos ingredientes cadastrados
   - Controle simples de estoque por ingrediente

### Funcionalidades Calculadas
- **Geração de Lista de Compras**: Baseada em quantidades e valores per capita
- **Cálculo de Calorias**: Por refeição baseado nos ingredientes

## Estrutura do Banco de Dados

### Tabelas Principais

#### users
- nome, email, cidade, estado, rua, bairro, CEP
- função, nome_escola

#### ingredientes
- nome (texto)
- unidade_medida (texto)
- calorias_por_unidade (float)
- default (boolean)

#### preparacoes
- nome (texto)
- valor_per_capita (float)
- modo_preparo (texto)
- tipo (texto)
- refeicoes_presente (texto)
- default (boolean)

#### ingrediente_preparacao
- ingrediente_id (uuid)
- preparacao_id (uuid)
- quantidade_para_percapita (float)
- unidade_medida (texto)

#### refeicoes
- tipo (texto)
- comensais_adultos (int)
- comensais_pequenos (int)
- comensais_adolescentes (int)
- cardapio_id (uuid)

#### cardapio_do_dia
- data (date)

#### lista_compras
- cardapios_ids (array)
- data_inicial (date)
- data_final (date)

## Estrutura da Interface

### Páginas de Autenticação
- **Login**: Email e senha
- **Cadastro**: Nome completo, email, cidade, estado, nome da escola
- **Recuperação de Senha**: Reset via email

### Layout Principal (Pós-autenticação)
- **Sidebar Colapsável**: 
  - Logo (superior esquerda)
  - Navegação: Home, Lista de Compras, Cardápios, Preparações, Ingredientes, Estoques
  - Responsivo: colapsa para menu hamburger em telas menores
- **Header**: 
  - Avatar circular + email do usuário (direita)
  - Dropdown menu: Assinatura, Perfil, Sair
- **Área de Conteúdo**: Páginas principais

### Dashboard/Home
- 4 cards de resumo: Total de Ingredientes, Preparações, Lista de Compras, Cardápios
- Exibe contagem de itens cadastrados pelo usuário atual

## Estratégia de Desenvolvimento
1. Setup do projeto React + TypeScript + Vite
2. Configuração do Supabase
3. Sistema de autenticação
4. Layout base com sidebar
5. Estrutura de navegação

### Fase 2: Funcionalidades Core
1. CRUD de Ingredientes
2. CRUD de Preparações
3. CRUD de Cardápios
4. CRUD de Refeições
5. Gestão de Estoque

### Fase 3: Funcionalidades Avançadas
1. Geração de Lista de Compras
2. Cálculos de Calorias
3. Relatórios e Exportações

## Notas de Implementação
- Projeto Supabase já criado com credenciais disponíveis
- Definição das tabelas será fornecida para geração de scripts SQL
- Desenvolvimento incremental com testes a cada etapa
- Foco na experiência do usuário e usabilidade