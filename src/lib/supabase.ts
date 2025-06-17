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
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    },
    timeout: 10000,
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => {
      // Exponential backoff with jitter
      return [1000, 2000, 5000, 10000, 30000][tries - 1] || 30000;
    }
  },
  global: {
    headers: {
      'x-client-info': 'billbreeze-web'
    }
  }
});

// Set up global auth state change listener
supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  if (event === 'SIGNED_OUT') {
    // Clear any stored auth state
    window.localStorage.removeItem('billbreeze-auth');
  }
});
