import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function UserSetup({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user: auth0User, getAccessTokenSilently } = useAuth0();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    const setupUser = async () => {
      if (!isAuthenticated || !auth0User) {
        console.log("Not authenticated or no user", { isAuthenticated, auth0User });
        return;
      }

      try {
        // Try to get a token to verify our auth state
        const token = await getAccessTokenSilently();
        console.log("Got access token", { tokenLength: token?.length });
        
        // Create or get user
        await getOrCreateUser();
        console.log("User setup complete");
      } catch (error) {
        console.error("Error in user setup:", error);
        toast.error("Failed to setup user profile");
      }
    };

    setupUser();
  }, [isAuthenticated, auth0User, getOrCreateUser, getAccessTokenSilently]);

  return <>{children}</>;
}

export function Auth0ConvexProvider({ children }: { children: React.ReactNode }) {
  const [redirectUri, setRedirectUri] = useState<string>();

  useEffect(() => {
    // Handle both localhost and Netlify deployments
    const origin = window.location.origin;
    const callbackUrl = `${origin}/dashboard`;
    console.log("Setting up Auth0Provider with callback URL:", callbackUrl);
    setRedirectUri(callbackUrl);
  }, []);

  if (!redirectUri) return null;

  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!clientId || !domain || !audience) {
    console.error("Missing required Auth0 configuration", { clientId, domain, audience });
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: "openid profile email offline_access"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      useRefreshTokensFallback={true}
    >
      <ConvexProviderWithAuth0
        client={convex}
        loggedOut={<div>Please log in</div>}
        onError={(error) => {
          console.error("Convex auth error:", error);
          if (error.message?.toLowerCase().includes('auth')) {
            console.log("Auth error detected, considering reload");
            const lastReload = localStorage.getItem('lastAuthReload');
            const now = Date.now();
            if (!lastReload || now - parseInt(lastReload) > 60000) {
              console.log("Triggering reload");
              localStorage.setItem('lastAuthReload', now.toString());
              window.location.reload();
            } else {
              console.log("Skipping reload - too recent");
            }
          }
        }}
      >
        <UserSetup>{children}</UserSetup>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
