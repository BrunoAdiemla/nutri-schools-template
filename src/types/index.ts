// Enums
export enum MenuStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
  REJECTED = 'REJECTED'
}

export type PreparacaoTipo = 'sólido' | 'líquido' | 'frutas' | 'acompanhamento' | 'guarnição' | 'entrada' | 'sobremesa' | 'complemento';
export type RefeicaoTipo = 'colação' | 'almoço' | 'lanche' | 'jantar';
export type UserFuncao = 'nutricionista' | 'gestor';

// Legacy types (will be replaced with Supabase types)
export interface MenuItem {
  id: string;
  name: string;
  school: string;
  date: string;
  calories: number;
  protein: number;
  status: MenuStatus;
}

export interface DashboardStats {
  totalIngredientes: number;
  totalPreparacoes: number;
  totalListasCompras: number;
  totalCardapios: number;
}

// Supabase Database Types
export interface UserProfile {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  cidade?: string;
  estado?: string;
  rua?: string;
  bairro?: string;
  cep?: string;
  funcao: UserFuncao;
  nome_escola?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingrediente {
  id: string;
  nome: string;
  unidade_medida: string;
  calorias_por_unidade: number;
  default_ingredient: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Preparacao {
  id: string;
  nome: string;
  valor_per_capita: number;
  modo_preparo?: string;
  tipo: PreparacaoTipo;
  refeicoes_presente: RefeicaoTipo[];
  default_preparation: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CardapiosDoDia {
  id: string;
  data: string; // ISO date string
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Refeicao {
  id: string;
  tipo: RefeicaoTipo;
  comensais_adultos: number;
  comensais_adolescentes: number;
  comensais_pequenos: number;
  cardapio_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ListaCompras {
  id: string;
  data_inicial: string;
  data_final: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface IngredienteEstoque {
  id: string;
  ingrediente_id: string;
  quantidade_atual: number;
  data_atualizacao: string;
  created_by: string;
  updated_at: string;
}

// Authentication Types
export interface AuthContextType {
  user: any | null; // Will be replaced with Supabase User type
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  nome: string;
  email: string;
  password: string;
  cidade?: string;
  estado?: string;
  nome_escola?: string;
}

// Error Types
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'email_already_exists'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
}

export enum DatabaseErrorType {
  CONNECTION_FAILED = 'connection_failed',
  QUERY_FAILED = 'query_failed',
  PERMISSION_DENIED = 'permission_denied',
  CONSTRAINT_VIOLATION = 'constraint_violation'
}

export interface DatabaseError {
  type: DatabaseErrorType;
  message: string;
  query?: string;
  table?: string;
}

export interface NetworkError {
  status: number;
  message: string;
  retryable: boolean;
}

// Global Application State
export interface AppState {
  auth: {
    user: any | null;
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
  };
  dashboard: {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
  };
  ui: {
    sidebarCollapsed: boolean;
    activeRoute: string;
    theme: 'light' | 'dark';
  };
}

// Environment Configuration
export interface EnvironmentConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_ENV: 'development' | 'staging' | 'production';
}