import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings, LogOut, Sun, Moon, User } from 'lucide-react';

interface UserProfileDropdownProps {
  onLogout?: () => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onLogout }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors duration-200"
      >
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
            alt={user?.user_metadata?.full_name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {user?.user_metadata?.full_name || user?.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email || ''}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-2">
          <button
            onClick={() => {
              navigate('/profile');
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="w-4 h-4 mr-3" />
            Profile Settings
          </button>

          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 mr-3" />
            ) : (
              <Moon className="w-4 h-4 mr-3" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

          <button
            onClick={() => {
              const handleLogout = async () => {
                await signOut();
                onLogout?.();
              };
              handleLogout();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
