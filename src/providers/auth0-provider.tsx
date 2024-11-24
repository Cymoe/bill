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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const setupUser = async () => {
      if (!isAuthenticated || !auth0User) {
        console.log("Not authenticated or no user", { isAuthenticated, auth0User });
        return;
      }

      try {
        // Try to get a token to verify our auth state
        const token = await getAccessTokenSilently({
          detailedResponse: true,
          timeoutInSeconds: 60,
          cacheMode: "off"  // Force fresh token on mobile
        });
        console.log("Got access token", { tokenLength: token?.access_token?.length });
        
        // Create or get user
        await getOrCreateUser();
        console.log("User setup complete");
        setRetryCount(0);  // Reset retry count on success
      } catch (error) {
        console.error("Error in user setup:", error);
        
        // Handle mobile-specific retry logic
        if (retryCount < 3 && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          console.log(`Retrying setup (attempt ${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
          setTimeout(setupUser, 1000);  // Retry after 1 second
        } else {
          toast.error("Failed to setup user profile");
        }
      }
    };

    setupUser();
  }, [isAuthenticated, auth0User, getOrCreateUser, getAccessTokenSilently, retryCount]);

  return <>{children}</>;
}

export function Auth0ConvexProvider({ children }: { children: React.ReactNode }) {
  const [redirectUri, setRedirectUri] = useState<string>();

  useEffect(() => {
    const origin = window.location.origin;
    console.log("Setting up Auth0Provider with callback URL:", origin);
    setRedirectUri(origin);
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
        scope: "openid profile email offline_access",
        prompt: "login"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      useRefreshTokensFallback={true}
      useCookiesForTransactions={false}
    >
      <ConvexProviderWithAuth0
        client={convex}
        loggedOut={<div>Please log in</div>}
        onError={(error) => {
          console.error("Convex auth error:", error);
          // Add specific handling for mobile browsers
          if (error.message?.toLowerCase().includes('auth') && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            console.log("Mobile auth error detected, attempting recovery");
            localStorage.removeItem('auth0spa');  // Clear auth cache
            window.location.href = redirectUri;   // Redirect to home
          }
        }}
      >
        <UserSetup>{children}</UserSetup>
      </ConvexProviderWithAuth0>
    </Auth0Provider>
  );
}
