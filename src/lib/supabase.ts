import { createClient, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Debug initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'billbreeze-auth',
    debug: true
  }
});

// Set up global auth state change listener
supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  if (event === 'SIGNED_OUT') {
    // Clear any stored auth state
    window.localStorage.removeItem('billbreeze-auth');
  }
});
