import { useAuth0 } from '@auth0/auth0-react';

export const AuthButtons = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: "/dashboard" }
    });
  };

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          Log In
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          Log Out
        </button>
      )}
    </div>
  );
};
