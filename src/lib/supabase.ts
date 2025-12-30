import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Manter true para funcionar com email confirmation
    flowType: 'pkce' // Use PKCE flow for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Connection testing functionality
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js';