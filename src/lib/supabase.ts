import { createClient, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Debug initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

console.log('Supabase Initialization:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0,
  keyPrefix: supabaseAnonKey?.substring(0, 10),
  keySuffix: supabaseAnonKey?.substring(supabaseAnonKey?.length - 10),
  hasKey: !!supabaseAnonKey
});

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
  console.log('Auth state changed:', { event, email: session?.user?.email });
  
  if (event === 'SIGNED_OUT') {
    // Clear any stored auth state
    window.localStorage.removeItem('billbreeze-auth');
  }
});
