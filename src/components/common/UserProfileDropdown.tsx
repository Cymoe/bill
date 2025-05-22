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
        className="flex items-center space-x-3 hover:bg-[#1E1E1E] rounded-[4px] p-2 transition-colors duration-200"
      >
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user?.user_metadata?.avatar_url || '/default-avatar.png'}
            alt={user?.user_metadata?.full_name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-[#333333]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center">
            <User className="w-5 h-5 text-[#9E9E9E]" />
          </div>
        )}
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-white font-['Roboto']">
            {user?.user_metadata?.full_name || user?.email}
          </p>
          <p className="text-xs text-[#9E9E9E] font-['Roboto']">
            {user?.email || ''}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-[4px] bg-[#1E1E1E] shadow-lg border border-[#333333] py-2 z-[11000]">
          <button
            onClick={() => {
              navigate('/profile');
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-white font-['Roboto'] hover:bg-[#333333] hover:text-[#F9D71C]"
          >
            <Settings className="w-4 h-4 mr-3" />
            Profile Settings
          </button>

          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-white font-['Roboto'] hover:bg-[#333333] hover:text-[#F9D71C]"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 mr-3" />
            ) : (
              <Moon className="w-4 h-4 mr-3" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div className="my-2 border-t border-[#333333]" />

          <button
            onClick={() => {
              const handleLogout = async () => {
                await signOut();
                onLogout?.();
              };
              handleLogout();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-[#D32F2F] font-['Roboto'] hover:bg-[#333333]"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
