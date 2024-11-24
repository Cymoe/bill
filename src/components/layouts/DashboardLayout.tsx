import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  FileStack,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Settings
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth0 } from '@auth0/auth0-react';
import { UserProfileDropdown } from '../common/UserProfileDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user, isAuthenticated, isLoading } = useAuth0();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard auth state:", { isAuthenticated, isLoading, user });
    if (!isLoading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isInvoiceDetailPage = location.pathname.startsWith('/invoices/') && location.pathname !== '/invoices';

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: Package, label: 'Products', to: '/products' },
    { icon: FileText, label: 'Invoices', to: '/invoices' },
    { icon: FileStack, label: 'Templates', to: '/templates' },
  ];

  const handleNavigation = (to: string) => {
    navigate(to);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log("Logging out");
    logout({ 
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu toggle - hidden on invoice detail pages */}
      {!isInvoiceDetailPage && (
        <button
          className="fixed top-4 right-4 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:translate-x-0 z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bill Breeze</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile Dropdown */}
          <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
            <UserProfileDropdown />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <main className="p-4 md:p-8 pb-32 md:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom navigation - hidden on invoice detail pages */}
      {!isInvoiceDetailPage && (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-between items-center bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 md:hidden z-40">
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleNavigation(item.to)}
              className={`flex flex-col items-center ${
                location.pathname === item.to
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
          <div className="flex flex-col items-center">
            <UserProfileDropdown />
          </div>
        </nav>
      )}
    </div>
  );
};