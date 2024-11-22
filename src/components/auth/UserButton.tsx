import { useAuth } from "../../contexts/AuthContext";

interface UserButtonProps {
  onSignOut: () => void;
}

export function UserButton({ onSignOut }: UserButtonProps) {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <button
      onClick={onSignOut}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
    >
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || "User"}
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      <span className="text-sm text-gray-700">Sign Out</span>
    </button>
  );
}
