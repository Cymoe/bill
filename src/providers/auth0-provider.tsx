import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';
import { ReactNode, useEffect } from 'react';
import { convex } from '../lib/convex';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!domain || !clientId || !audience) {
  throw new Error('Missing Auth0 configuration');
}

console.log('Auth0 Config:', { domain, clientId, audience });

function UserSetup() {
  const { isAuthenticated, isLoading } = useAuth0();
  const createUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      createUser()
        .catch(console.error);
    }
  }, [isAuthenticated, isLoading, createUser]);

  return null;
}

export function Auth0ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      useRefreshTokensFallback={true}
    >
      <ConvexProviderWithAuth0 
        client={convex}
        logErrors={true}
      >
        <UserSetup />
        {children}
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
