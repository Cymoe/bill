import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Plus,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { CreateDropdown } from '../common/CreateModal';
import { NewClientModal } from '../clients/NewClientModal';
import ProductModal from '../products/ProductModal';
import { EditProductModal } from '../products/EditProductModal';
import ProductAssemblyForm from '../products/ProductAssemblyForm';
import { LineItemModal } from '../modals/LineItemModal';
import ProductForm from '../products/ProductForm';
import { supabase } from '../../lib/supabase';
import { NewInvoiceModal } from '../invoices/NewInvoiceModal';
import { NewPackageModal } from '../modals/NewPackageModal';

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

export const IndustryContext = createContext<{ selectedIndustry: string; setSelectedIndustry: (v: string) => void }>({ selectedIndustry: 'All Trades', setSelectedIndustry: () => {} });

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut, session, isLoading } = useAuth();
  const isAuthenticated = !!session;
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false);
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false);
  const [showNewPackageDrawer, setShowNewPackageDrawer] = useState(false);
  const [showLineItemDrawer, setShowLineItemDrawer] = useState(false);
  const [isClosingLineItemDrawer, setIsClosingLineItemDrawer] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedIndustry, setSelectedIndustry] = useState('All Trades');
  const industries = [
    'All Trades',
    'General Construction',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Carpentry',
    'Painting',
    'Flooring',
    'Roofing',
    'Landscaping',
    'Masonry',
  ];
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const industryDropdownRef = useRef<HTMLDivElement>(null);

  // Mock organizations
  const mockOrgs = [
    { id: 'org1', name: 'Acme Construction', industry: 'New Construction' },
    { id: 'org2', name: 'Remodel Pros', industry: 'Remodelers' },
    { id: 'org3', name: 'Service Kings', industry: 'Service' },
    { id: 'org4', name: 'Luxury Estates', industry: 'Luxury Villas' },
  ];
  const [selectedOrg, setSelectedOrg] = useState(mockOrgs[0]);

  // For sidebar industry/subcategory section - no longer needed as we're using the state directly
  const subcategoriesByIndustry: { [key: string]: { name: string; count: number }[] } = {
    'General Construction': [
      { name: 'All General Construction Items', count: 98 },
      { name: 'Foundation', count: 15 },
      { name: 'Framing', count: 22 },
      { name: 'Drywall', count: 18 },
      { name: 'Insulation', count: 12 },
      { name: 'Siding', count: 14 },
      { name: 'Windows & Doors', count: 17 },
    ],
    'Plumbing': [
      { name: 'All Plumbing Items', count: 76 },
      { name: 'Fixtures', count: 25 },
      { name: 'Pipes & Fittings', count: 30 },
      { name: 'Water Heaters', count: 8 },
      { name: 'Drainage', count: 13 },
    ],
    'Electrical': [
      { name: 'All Electrical Items', count: 82 },
      { name: 'Wiring', count: 20 },
      { name: 'Panels & Breakers', count: 15 },
      { name: 'Lighting', count: 25 },
      { name: 'Outlets & Switches', count: 12 },
      { name: 'Smart Home', count: 10 },
    ],
    'HVAC': [
      { name: 'All HVAC Items', count: 65 },
      { name: 'Heating', count: 18 },
      { name: 'Cooling', count: 22 },
      { name: 'Ventilation', count: 15 },
      { name: 'Ductwork', count: 10 },
    ],
    'Carpentry': [
      { name: 'All Carpentry Items', count: 70 },
      { name: 'Rough Carpentry', count: 25 },
      { name: 'Finish Carpentry', count: 30 },
      { name: 'Cabinetry', count: 15 },
    ],
    'Painting': [
      { name: 'All Painting Items', count: 45 },
      { name: 'Interior', count: 20 },
      { name: 'Exterior', count: 15 },
      { name: 'Specialty Finishes', count: 10 },
    ],
    'Flooring': [
      { name: 'All Flooring Items', count: 55 },
      { name: 'Hardwood', count: 15 },
      { name: 'Tile', count: 18 },
      { name: 'Carpet', count: 12 },
      { name: 'Vinyl/Laminate', count: 10 },
    ],
    'Roofing': [
      { name: 'All Roofing Items', count: 40 },
      { name: 'Shingles', count: 15 },
      { name: 'Metal', count: 10 },
      { name: 'Flat Roof', count: 8 },
      { name: 'Gutters', count: 7 },
    ],
    'Landscaping': [
      { name: 'All Landscaping Items', count: 50 },
      { name: 'Hardscaping', count: 15 },
      { name: 'Planting', count: 20 },
      { name: 'Irrigation', count: 10 },
      { name: 'Lighting', count: 5 },
    ],
    'Masonry': [
      { name: 'All Masonry Items', count: 35 },
      { name: 'Brick', count: 12 },
      { name: 'Stone', count: 15 },
      { name: 'Concrete', count: 8 },
    ],
    'All Trades': [
      { name: 'All Items', count: 0 },
    ],
  };
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const industryList = [
    'General Construction',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Carpentry',
    'Painting',
    'Flooring',
    'Roofing',
    'Landscaping',
    'Masonry'
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!showCreateModal) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node) &&
        createButtonRef.current &&
        !createButtonRef.current.contains(event.target as Node)
      ) {
        setShowCreateModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreateModal]);

  // Close org dropdown on outside click
  useEffect(() => {
    if (!orgDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(event.target as Node)) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [orgDropdownOpen]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Users, label: 'Clients', to: '/clients' },
    { icon: FolderKanban, label: 'Projects', to: '/projects' },
    { icon: FileText, label: 'Invoices', to: '/invoices' },
    { icon: Copy, label: 'Packages', to: '/packages' },
    { icon: Book, label: 'Products', to: '/products' },
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
    <IndustryContext.Provider value={{ selectedIndustry, setSelectedIndustry }}>
      <div className="min-h-screen bg-[#121212]">

        
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-20 bg-[#121212] border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center h-16 px-6">
            {/* Mobile Page Title - only visible on mobile */}
            <div className="md:hidden flex items-center">
              <h1 className="text-xl font-bold text-white">
                {(() => {
                  const path = location.pathname;
                  if (path === '/dashboard') return 'Dashboard';
                  if (path.startsWith('/clients')) return 'Clients';
                  if (path.startsWith('/projects')) return 'Projects';
                  if (path.startsWith('/invoices')) return 'Invoices';
                  if (path.startsWith('/packages')) return 'Packages';
                  if (path.startsWith('/products')) return 'Products';
                  if (path.startsWith('/price-book')) return 'Price Book';
                  if (path.startsWith('/contracts')) return 'Contracts';
                  return 'Dashboard';
                })()}
              </h1>
            </div>
            
            {/* Organization Dropdown - hidden on mobile, visible on desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative mr-4" ref={orgDropdownRef}>
                <button
                  className="flex items-center min-h-[40px] px-4 rounded bg-[#181818] text-white text-sm font-medium hover:bg-[#232323] focus:bg-[#232323] transition-colors"
                  onClick={() => setOrgDropdownOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setOrgDropdownOpen(false), 100)}
                  tabIndex={0}
                  type="button"
                >
                  {selectedOrg.name}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {orgDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-full bg-[#232323] rounded shadow-lg z-50">
                    {mockOrgs.map((org) => (
                      <button
                        key={org.id}
                        className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2a2a2a] transition-colors ${selectedOrg.id === org.id ? 'bg-[#181818]' : ''}`}
                        onClick={() => {
                          setSelectedOrg(org);
                          setSelectedIndustry(org.industry);
                          setOrgDropdownOpen(false);
                        }}
                        type="button"
                      >
                        {org.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Logo and Navigation */}
              <div className="flex items-center">
                {/* Desktop Navigation */}
                <div className="hidden md:block ml-6">
                  <div className="flex space-x-4">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            isActive
                              ? 'text-blue-500 font-medium'
                              : 'text-gray-400 hover:text-white font-medium'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center">
              {/* Show + button globally - hidden on mobile */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <button
                    ref={createButtonRef}
                    aria-label="create-new"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors pr-6"
                    onClick={() => setShowCreateModal((v) => !v)}
                    data-testid="create-new-btn"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-medium">Create</span>
                  </button>
                  {showCreateModal && (
                    <div ref={createDropdownRef}>
                      <CreateDropdown
                        onCreateLineItem={() => {
                          setShowCreateModal(false);
                          setShowLineItemDrawer(true);
                        }}
                        onCreateCategory={() => setShowCreateModal(false)}
                        onCreateClient={() => {
                          setShowCreateModal(false);
                          setShowNewClientModal(true);
                        }}
                        onCreateProject={() => setShowCreateModal(false)}
                        onCreateInvoice={() => {
                          setShowCreateModal(false);
                          setShowNewInvoiceDrawer(true);
                        }}
                        onCreateProduct={() => {
                          setShowCreateModal(false);
                          window.dispatchEvent(new CustomEvent('openNewProductDrawer'));
                        }}
                        onCreatePackage={() => {
                          setShowCreateModal(false);
                          setShowNewPackageDrawer(true);
                        }}
                        onCreatePriceBookTemplate={() => setShowCreateModal(false)}
                        onCreateProjectTemplate={() => setShowCreateModal(false)}
                        onCreateContractTemplate={() => setShowCreateModal(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-4rem)] mt-16">
          {/* Sidebar - reduced width - hidden on mobile */}
          <div className="hidden md:flex fixed top-16 w-48 h-[calc(100vh-4rem)] overflow-y-auto bg-[#121212] border-r border-gray-200 dark:border-gray-800 flex-col">
            {/* Sidebar header action for each main section */}
            {(() => {
              if (location.pathname === '/price-book') {
                return (
                  <div className="mb-6 px-4 pt-4">
                    <button
                      onClick={() => setShowLineItemDrawer(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-blue-500 hover:bg-[#232323] flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Line Item
                    </button>
                  </div>
                );
              }
              if (location.pathname.startsWith('/products')) {
                return (
                  <div className="mb-6 px-4 pt-4">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openNewProductDrawer'))}
                      className="w-full text-left px-3 py-2 rounded-lg text-blue-500 hover:bg-[#232323] flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Product
                    </button>
                  </div>
                );
              }
              if (location.pathname.startsWith('/projects')) {
                return (
                  <div className="mb-6 px-4 pt-4">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('openNewProjectDrawer'))}
                      className="w-full text-left px-3 py-2 rounded-lg text-blue-500 hover:bg-[#232323] flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Project
                    </button>
                  </div>
                );
              }
              if (location.pathname.startsWith('/clients')) {
                return (
                  <div className="mb-6 px-4 pt-4">
                    <button
                      onClick={() => setShowNewClientDrawer(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-blue-500 hover:bg-[#232323] flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Client
                    </button>
                  </div>
                );
              }
              if (location.pathname.startsWith('/invoices')) {
                return (
                  <div className="mb-6 px-4 pt-4">
                    <button
                      onClick={() => setShowNewInvoiceDrawer(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-blue-500 hover:bg-[#232323] flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invoice
                    </button>
                  </div>
                );
              }
              if (location.pathname.startsWith('/packages')) {
                return (
                  <div className="mb-6 px-4 pt-4">
                    <button
                      onClick={() => setShowNewPackageDrawer(true)}
                      className="w-full text-left px-3 py-2 rounded-lg text-blue-500 hover:bg-[#232323] flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Package
                    </button>
                  </div>
                );
              }
              return null;
            })()}
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
            <div className="mt-auto border-t border-gray-700">
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

          {/* Main Content - responsive for all screen sizes */}
          <div className="flex-1 md:ml-48 p-4 bg-[#121212]">
            {children}
          </div>

        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 right-4 z-20 p-2 rounded-md bg-[#121212] text-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        


        {/* Mobile Navigation Menu - Notion Style */}
        <div className={`md:hidden fixed inset-0 z-10 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#121212] overflow-y-auto">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="text-lg font-medium text-white">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Organization Selector */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{selectedOrg.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">View and switch organizations</p>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center bg-[#232323] rounded-md px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-transparent border-none w-full text-sm text-white focus:outline-none ml-2"
                />
              </div>
            </div>
            
            {/* Main Navigation */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase">Main Navigation</span>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'text-blue-500 bg-[#232323]'
                          : 'text-gray-400 hover:text-white hover:bg-[#232323]'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
            
            {/* Secondary Navigation Sections */}
            {sidebarItems.map((section, idx) => (
              <div key={section.title} className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">{section.title}</span>
                  {section.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-900 text-green-300">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <NavLink
                      key={`${section.title}-${itemIdx}`}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          item.isAction
                            ? 'text-blue-500'
                            : isActive || item.highlighted
                            ? 'text-blue-500 bg-[#232323]'
                            : 'text-gray-400 hover:text-white hover:bg-[#232323]'
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
            
            {/* User Section */}
            <div className="p-4 border-t border-gray-800 mt-auto">
              <div className="flex items-center">
                <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-white mr-3">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <p className="text-xs text-gray-400">Account Settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NewClientModal drawer */}
        {showNewClientModal && (
          <NewClientModal
            onClose={() => setShowNewClientModal(false)}
            onSave={() => setShowNewClientModal(false)}
          />
        )}
        {/* NewClientModal drawer */}
        {showNewClientDrawer && (
          <NewClientModal
            onClose={() => setShowNewClientDrawer(false)}
            onSave={() => {
              setShowNewClientDrawer(false);
            }}
          />
        )}
        {/* New Package Modal */}
        {showNewPackageDrawer && (
          <NewPackageModal
            onClose={() => setShowNewPackageDrawer(false)}
            onSave={() => {
              setShowNewPackageDrawer(false);
            }}
          />
        )}
        {/* New Line Item Drawer */}
        {showLineItemDrawer && (
          <div className="fixed inset-0 z-[60] flex justify-end">
            <div 
              className="absolute inset-0 bg-black transition-opacity duration-300 opacity-50"
              onClick={() => {
                setIsClosingLineItemDrawer(true);
                setTimeout(() => {
                  setShowLineItemDrawer(false);
                  setIsClosingLineItemDrawer(false);
                }, 300);
              }}
            />
            <div
              className={`
                md:w-full md:max-w-md
                transition-transform duration-300 ease-out 
                bg-white dark:bg-gray-800 
                shadow-xl
                overflow-hidden
                h-full
                transform
                ${isClosingLineItemDrawer ? 'translate-x-full' : 'translate-x-0'}
              `}
            >
              <ProductForm
                title="New Line Item"
                submitLabel="Save"
                onClose={() => {
                  setIsClosingLineItemDrawer(true);
                  setTimeout(() => {
                    setShowLineItemDrawer(false);
                    setIsClosingLineItemDrawer(false);
                  }, 300);
                }}
                onSubmit={async (data) => {
                  setIsClosingLineItemDrawer(true);
                  setTimeout(() => {
                    setShowLineItemDrawer(false);
                    setIsClosingLineItemDrawer(false);
                  }, 300);
                  // handle save logic here if needed
                }}
              />
            </div>
          </div>
        )}
        {/* New Invoice Drawer */}
        {showNewInvoiceDrawer && (
          <NewInvoiceModal
            onClose={() => setShowNewInvoiceDrawer(false)}
            onSave={() => setShowNewInvoiceDrawer(false)}
          />
        )}
        
        {/* Mobile Create Button - Floating Action Button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowCreateModal(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#232635] border border-[#2A3A8F] shadow-xl flex items-center justify-center text-white"
            style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)' }}
            aria-label="Create new"
          >
            <Plus className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </IndustryContext.Provider>
  );
};