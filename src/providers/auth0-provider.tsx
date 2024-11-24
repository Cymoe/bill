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
    if (!isAuthenticated || !auth0User) {
      console.log("Not authenticated or no user");
      return;
    }

    // Create or get user when authenticated
    getOrCreateUser().catch(error => {
      console.error("Error in user setup:", error);
      toast.error("Failed to setup user profile");
    });
  }, [isAuthenticated, auth0User, getOrCreateUser]);

  return <>{children}</>;
}

export function Auth0ConvexProvider({ children }: { children: React.ReactNode }) {
  const [redirectUri, setRedirectUri] = useState<string>();

  useEffect(() => {
    // Use /callback as the redirect URI
    const origin = window.location.origin;
    const callbackUrl = `${origin}/callback`;
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
        scope: "openid profile email"
      }}
      cacheLocation="memory"
    >
      <ConvexProviderWithAuth0
        client={convex}
        loggedOut={<div>Please log in</div>}
        onError={(error) => {
          console.error("Convex auth error:", error);
        }}
      >
        <UserSetup>{children}</UserSetup>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
