import React, { useState } from 'react';
import { LayoutDashboard, FileText, Package, Users, Settings, LogOut, Database, Sun, Moon, Copy, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { seedDatabase } from '../utils/seedDatabase';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: Copy, label: 'Templates', path: '/templates' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Clients', path: '/clients' },
  ];

  const handleSeedData = async () => {
    if (window.confirm('This will reset and seed the database with sample data. Are you sure?')) {
      const success = await seedDatabase();
      if (success) {
        window.location.reload();
      } else {
        alert('Failed to seed database. Check console for errors.');
      }
    }
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-indigo-900 dark:bg-gray-900 text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed md:static h-screen w-64 md:w-64 bg-indigo-900 dark:bg-gray-900 text-white p-6 transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40`}>
        <div className="flex items-center gap-3 mb-10">
          <FileText className="w-8 h-8" />
          <h1 className="text-xl font-bold">InvoiceHub</h1>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-800 dark:bg-gray-800'
                  : 'hover:bg-indigo-800 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-base">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="md:absolute bottom-6 left-6 right-6 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-indigo-800 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5" />
                <span className="text-base">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-5 h-5" />
                <span className="text-base">Light Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSeedData}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-indigo-800 dark:hover:bg-gray-800 transition-colors text-yellow-400 hover:text-yellow-300"
          >
            <Database className="w-5 h-5" />
            <span className="text-base">Seed Database</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-between items-center bg-indigo-900 dark:bg-gray-900 text-white px-6 py-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path
                ? 'text-indigo-200 dark:text-gray-200'
                : 'hover:text-indigo-200 dark:hover:text-gray-200'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
