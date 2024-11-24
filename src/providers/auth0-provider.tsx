import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function UserSetup({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user: auth0User } = useAuth0();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    if (!isAuthenticated || !auth0User) return;

    // Only try to create/get user when we have auth
    getOrCreateUser()
      .catch(error => {
        console.error("Error in user setup:", error);
        toast.error("Failed to setup user profile");
      });
  }, [isAuthenticated, auth0User, getOrCreateUser]);

  return <>{children}</>;
}

export function Auth0ConvexProvider({ children }: { children: React.ReactNode }) {
  const [redirectUri, setRedirectUri] = useState<string>();

  useEffect(() => {
    // Handle both localhost and Netlify deployments
    const origin = window.location.origin;
    const path = "/dashboard"; // Redirect to dashboard after login
    setRedirectUri(`${origin}${path}`);
  }, []);

  if (!redirectUri) return null;

  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  if (!clientId || !domain || !audience) {
    console.error("Missing required Auth0 configuration");
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
          // Only reload for auth errors, and not too frequently
          if (error.message?.toLowerCase().includes('auth')) {
            // Store last reload time
            const lastReload = localStorage.getItem('lastAuthReload');
            const now = Date.now();
            if (!lastReload || now - parseInt(lastReload) > 60000) { // Only reload once per minute max
              localStorage.setItem('lastAuthReload', now.toString());
              window.location.reload();
            }
          }
        }}
      >
        <UserSetup>{children}</UserSetup>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
