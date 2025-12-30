import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  rua?: string;
  bairro?: string;
  cep?: string;
  funcao?: string;
  nome_escola: string;
  created_at: string;
}

export interface DashboardStats {
  ingredientes: number;
  preparacoes: number;
  cardapios: number;
  listas_compras: number;
}

export class DatabaseService {
  // User Profile Management
  static async createUserProfile(user: User, profileData: Omit<UserProfile, 'id' | 'auth_user_id' | 'created_at'>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            auth_user_id: user.id, // Use auth_user_id instead of id
            ...profileData,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 DatabaseService.getUserProfile - Starting query for userId:', userId);
      
      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000)
      );

      // Create the actual query promise
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      // Race between query and timeout
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('🔍 DatabaseService.getUserProfile - Query completed:', {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details
      });

      if (error) {
        // If no rows returned, user profile doesn't exist yet
        if (error.code === 'PGRST116') {
          console.log('📝 DatabaseService.getUserProfile - No profile found (expected for new users)');
          return null;
        }
        
        // For other errors, log and return null
        console.error('❌ DatabaseService.getUserProfile - Database error:', error);
        return null;
      }

      console.log('✅ DatabaseService.getUserProfile - Profile found:', data ? 'YES' : 'NO');
      return data;
    } catch (error) {
      console.error('💥 DatabaseService.getUserProfile - Exception:', error);
      
      // If it's a timeout error, we know the query is hanging
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error('⏰ Query timeout - Supabase query is hanging');
      }
      
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', userId) // Use auth_user_id instead of id
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Dashboard Statistics
  static async getDashboardStats(userId: string): Promise<DashboardStats | null> {
    try {
      const [ingredientesResult, preparacoesResult, cardapiosResult, listasResult] = await Promise.all([
        supabase.from('ingredientes').select('id', { count: 'exact' }).eq('created_by', userId),
        supabase.from('preparacoes').select('id', { count: 'exact' }).eq('created_by', userId),
        supabase.from('cardapios_do_dia').select('id', { count: 'exact' }).eq('created_by', userId),
        supabase.from('listas_compras').select('id', { count: 'exact' }).eq('created_by', userId),
      ]);

      if (ingredientesResult.error || preparacoesResult.error || cardapiosResult.error || listasResult.error) {
        console.error('Error fetching dashboard stats:', {
          ingredientes: ingredientesResult.error,
          preparacoes: preparacoesResult.error,
          cardapios: cardapiosResult.error,
          listas: listasResult.error,
        });
        return null;
      }

      return {
        ingredientes: ingredientesResult.count || 0,
        preparacoes: preparacoesResult.count || 0,
        cardapios: cardapiosResult.count || 0,
        listas_compras: listasResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  }

  // Real-time subscription handling
  static subscribeToUserData(userId: string, callback: (stats: DashboardStats) => void) {
    const channels = [
      supabase
        .channel('ingredientes_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ingredientes', filter: `created_by=eq.${userId}` },
          () => this.getDashboardStats(userId).then(stats => stats && callback(stats))
        ),
      supabase
        .channel('preparacoes_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'preparacoes', filter: `created_by=eq.${userId}` },
          () => this.getDashboardStats(userId).then(stats => stats && callback(stats))
        ),
      supabase
        .channel('cardapios_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'cardapios_do_dia', filter: `created_by=eq.${userId}` },
          () => this.getDashboardStats(userId).then(stats => stats && callback(stats))
        ),
      supabase
        .channel('listas_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'listas_compras', filter: `created_by=eq.${userId}` },
          () => this.getDashboardStats(userId).then(stats => stats && callback(stats))
        ),
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }

  // Generic CRUD operations
  static async create<T>(table: string, data: Omit<T, 'id' | 'created_at'>): Promise<T | null> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error(`Error creating ${table}:`, error);
        return null;
      }

      return result;
    } catch (error) {
      console.error(`Error creating ${table}:`, error);
      return null;
    }
  }

  static async read<T>(table: string, filters?: Record<string, any>): Promise<T[] | null> {
    try {
      let query = supabase.from(table).select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error reading ${table}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error reading ${table}:`, error);
      return null;
    }
  }

  static async update<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${table}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      return null;
    }
  }

  static async delete(table: string, id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
  }
}