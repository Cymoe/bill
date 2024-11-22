import { useAuth0 } from '@auth0/auth0-react';

export function AuthButtons() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span>{user.email}</span>
        <button
          onClick={() => logout()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => loginWithRedirect()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Sign In
      </button>
    </div>
  );
}
