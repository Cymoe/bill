import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileStack,
  Menu,
  X,
  Book,
  Sun,
  Moon,
  FolderKanban,
  Copy,
  User,
  LogOut,
  ChevronUp
} from 'lucide-react';

interface SidebarItem {
  icon?: LucideIcon;
  label: string;
  to: string;
  highlighted?: boolean;
  isAction?: boolean;
}

interface SidebarSection {
  title: string;
  badge?: string;
  items: SidebarItem[];
}

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, session, isLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = !!session;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: FolderKanban, label: 'Projects', to: '/projects' },
    { icon: FileText, label: 'Invoices', to: '/invoices' },
    { icon: Book, label: 'Products', to: '/products' },
    { icon: Copy, label: 'Templates', to: '/templates' },
    { icon: Book, label: 'Price Book', to: '/price-book' },
  ];

  const sidebarItems: SidebarSection[] = [
    {
      title: 'Views',
      items: [
        { icon: FileStack, label: 'All contracts', to: '/contracts/all' },
        { icon: FileText, label: 'My contracts', to: '/contracts/my', highlighted: true },
        { icon: X, label: 'Rejected', to: '/contracts/rejected' },
        { label: 'Add a view', to: '/contracts/views/new', isAction: true },
      ]
    },
    {
      title: 'Contract spaces',
      badge: 'New',
      items: [
        { icon: Users, label: 'Agency Agreements', to: '/contracts/agency' },
        { label: 'Add a contract space', to: '/contracts/spaces/new', isAction: true },
      ]
    },
    {
      title: 'Imports',
      items: [
        { icon: FileText, label: 'Import (Mar 12, 2025 20:02)', to: '/contracts/imports/latest' },
      ]
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center h-16 px-4">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-500" />
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-6">
                <div className="flex space-x-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-500'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center">
            </div>
          </div>
        </div>

      <div className="flex h-[calc(100vh-4rem)] mt-16">
        {/* Sidebar */}
        <div className="fixed top-16 w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 pb-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by title, content.."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {sidebarItems.map((section, idx) => (
              <div key={section.title} className={idx > 0 ? 'mt-8' : ''}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{section.title}</h3>
                  {section.badge && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <NavLink
                      key={itemIdx}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          item.isAction
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isActive || item.highlighted
                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`
                      }
                    >
                      {item.icon && <item.icon className="h-4 w-4 mr-3" />}
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* User profile section at bottom */}
          <div className="mt-auto border-t border-gray-700" ref={profileMenuRef}>
            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="bg-gray-900 py-1">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-4 h-4 mr-3" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 mr-3" />
                      Light Mode
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            )}

            {/* User Info */}
            <div className="p-4 flex items-center">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata.full_name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="ml-2 p-1 rounded-full hover:bg-gray-800 transition-colors duration-200"
              >
                <ChevronUp 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-0' : 'rotate-180'}`} 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 pt-4 ml-64">
          {children}
        </main>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-20 p-2 rounded-md bg-gray-900 text-white"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden fixed inset-0 z-10 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-4 space-y-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-500'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="h-4 w-4 mr-2" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};