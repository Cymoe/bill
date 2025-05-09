import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ provider: string; url: string; } | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", { event, email: session?.user?.email });
        setUser(session?.user ?? null);
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      // Match the exact URL from Supabase settings
      const redirectTo = window.location.origin + '/auth/callback';
      const site = window.location.origin;
      console.log('Using redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'email profile',
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
            site
          }
        }
      });

      if (error) {
        console.error('Google sign in error:', error.message);
        throw error;
      }

      if (!data) {
        console.error('No data returned from sign in');
        throw new Error('No data returned from sign in');
      }

      console.log('Sign in successful, redirecting...');
      return data;
    } catch (err: any) {
      console.error('Error signing in with Google:', err.message);
      // Add more context to the error
      throw new Error(`Google sign in failed: ${err.message}`);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
