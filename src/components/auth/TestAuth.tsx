import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function TestAuth() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else {
          setSession(data.session);
          setUser(data.session?.user || null);
        }
      } catch (err) {
        setError('Failed to fetch session');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // Store the auth URL for debugging
      if (data.url) {
        setAuthUrl(data.url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    }
  };

  const handleCreateAccount = async () => {
    // Implementation of handleCreateAccount function
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Auth Diagnostics</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-steel-blue animate-pulse relative">
            <div className="absolute inset-1 bg-steel-blue opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">User Status:</h3>
            <div className="p-2 bg-gray-100 rounded">
              {user ? (
                <div className="text-green-600">
                  ✓ Authenticated as: {user.email}
                </div>
              ) : (
                <div className="text-red-600">
                  ✗ Not authenticated
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!user && (
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-full"
            >
              <svg
                className="w-5 h-5 mr-2"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Sign in with Google (Test)
            </button>
          )}

          {authUrl && (
            <div className="mt-4">
              <h3 className="font-medium">Auth URL:</h3>
              <div className="p-2 bg-gray-100 rounded overflow-x-auto">
                <code className="text-xs break-all">{authUrl}</code>
              </div>
            </div>
          )}

          {session && (
            <div className="mt-4">
              <h3 className="font-medium">Session Info:</h3>
              <div className="p-2 bg-gray-100 rounded overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre>
              </div>
            </div>
          )}

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-steel-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-steel-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-8 h-8 border-2 border-steel-blue animate-pulse relative">
                <div className="absolute inset-1 bg-steel-blue opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
              </div>
            ) : (
              'Create Test Account'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
