import React, { useState } from 'react';
import { LayoutDashboard, FileText, Users, Database, Sun, Moon, Menu, X, FolderKanban, Book, Box } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { seedDatabase } from '../utils/seedDatabase';
import { useTheme } from '../contexts/ThemeContext';

type MenuItem = {
  icon: React.FC<any>;
  label: string;
  path?: string;
  action?: () => void;
};

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const mainMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: Box, label: 'Products', path: '/products' },
    { icon: Book, label: 'Price Book', path: '/price-book' },
  ];

  const viewsItems: MenuItem[] = [
    { icon: FileText, label: 'All contracts', path: '/contracts' },
    { icon: FileText, label: 'My contracts', path: '/my-contracts' },
    { icon: X, label: 'Rejected', path: '/rejected' },
  ];

  const adminItems: MenuItem[] = [
    { icon: Database, label: 'Seed Database', action: handleSeedData },
  ];

  return (
    <>
      {/* Mobile menu toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed md:static h-screen w-64 bg-[#121212] text-white transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-40 border-r border-[#333333]`}>
        {/* Company header */}
        <div className="p-3 border-b border-[#333333]">
          <button className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-[#1E1E1E] hover:bg-[#333333] transition-colors">
            <span className="text-lg font-medium">ACME CO...</span>
            <svg className="w-5 h-5 text-[#336699]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        {/* Search bar */}
        <div className="p-3 border-b border-[#333333]">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#1E1E1E] text-white py-2 pl-9 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0D47A1]"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* Create button */}
        <div className="p-3 border-b border-[#333333]">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-[#1E1E1E] hover:bg-[#333333] transition-colors">
            <svg className="w-5 h-5 text-[#336699]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span className="text-gray-300">Create</span>
          </button>
        </div>
        
        {/* Main navigation */}
        <div className="p-3">
          <div className="mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">MAIN</h3>
            <nav className="space-y-1">
              {mainMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isPriceBook = item.label === 'Price Book';
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else if (item.action) {
                        item.action();
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors ${isPriceBook
                      ? 'text-[#336699] border-l-2 border-[#336699] bg-[#0D47A1]/10' 
                      : isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#333333]/30'
                    }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Views navigation */}
          <div className="mt-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-2">VIEWS</h3>
            <nav className="space-y-1">
              {viewsItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isMyContracts = item.label === 'My contracts';
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors ${isMyContracts
                      ? 'text-[#336699] border-l-2 border-[#336699] bg-[#0D47A1]/10' 
                      : isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#333333]/30'
                    }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-base">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Admin section */}
        <div className="absolute bottom-6 left-0 right-0 px-3">
          {adminItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.action) {
                  item.action();
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-[#F9D71C] hover:bg-[#333333]/30 transition-colors"
            >
              <div className="flex items-center justify-center w-5 h-5">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-base">{item.label}</span>
            </button>
          ))}

          <button
            onClick={toggleTheme}
            className="mt-2 flex items-center gap-3 w-full px-3 py-2 rounded-md text-gray-400 hover:text-white hover:bg-[#333333]/30 transition-colors"
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
        </div>
      </div>

      {/* Mobile nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-between items-center bg-[#121212] text-white px-4 py-2 border-t border-[#333333]">
        {mainMenuItems.filter(item => item.path).slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path) navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-[#336699]' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};


