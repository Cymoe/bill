import { createContext, useContext, useEffect, useState } from 'react';
import { useConvex } from 'convex/react';

interface ConvexAuthContextType {
  isAuthenticated: boolean;
}

const ConvexAuthContext = createContext<ConvexAuthContextType>({ isAuthenticated: false });

export function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const token = await convex.auth.getToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking Convex auth:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = convex.onAuth(() => {
      checkAuth();
    });

    return () => {
      unsubscribe();
    };
  }, [convex]);

  return (
    <ConvexAuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </ConvexAuthContext.Provider>
  );
}

export const useConvexAuth = () => useContext(ConvexAuthContext);
