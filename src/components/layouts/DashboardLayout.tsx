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
  User,
  LogOut,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Box
} from 'lucide-react';
import { NewClientModal } from '../clients/NewClientModal';
import ProductForm from '../products/ProductForm';
import { NewInvoiceModal } from '../invoices/NewInvoiceModal';
import { useProductDrawer } from '../../contexts/ProductDrawerContext';
// NewPackageModal import removed as part of simplification

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
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  // Line item modal replaced with drawer
  const [isProductModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false);
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false);
  // Package drawer state removed as part of simplification
  const [showLineItemDrawer, setShowLineItemDrawer] = useState(false);
  const [isClosingLineItemDrawer, setIsClosingLineItemDrawer] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
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
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNewProjectDrawer, setShowNewProjectDrawer] = useState(false);
  const { openProductDrawer } = useProductDrawer();

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
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCreateModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreateModal]);

  // Handle click outside of create menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCreateMenuOpen &&
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateMenuOpen]);

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

  // Navigation items moved to sidebar for better ergonomics

  const sidebarItems: SidebarSection[] = [
    {
      title: '',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Users, label: 'Clients', to: '/clients' },
        { icon: FolderKanban, label: 'Projects', to: '/projects' },
        { icon: FileText, label: 'Invoices', to: '/invoices' },
        { icon: Book, label: 'Products', to: '/products' },
        { icon: Book, label: 'Price Book', to: '/price-book' },
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
        {/* Top Navbar - fixed, full-width for desktop and mobile */}
        <div className="flex fixed top-0 right-0 h-16 bg-[#121212] border-b border-gray-700 items-center justify-between px-6 z-[9999] md:left-64 left-0">
          {/* Mobile Menu Toggle - Only visible on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center text-gray-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">
              {(() => {
                const path = location.pathname;
                if (path === '/dashboard') return 'Dashboard';
                if (path.startsWith('/clients')) return 'Clients';
                if (path.startsWith('/projects')) return 'Projects';
                if (path.startsWith('/invoices')) return 'Invoices';
                if (path.startsWith('/products')) return 'Products';
                if (path.startsWith('/price-book')) return 'Price Book';
                if (path.startsWith('/contracts')) return 'Contracts';
                return 'Dashboard';
              })()}
            </h1>
          </div>

          {/* Top Navbar - Context-aware Add Button */}
          <div className="relative flex items-center">
            <button
              onClick={() => {
                const path = window.location.pathname;
                if (path.startsWith('/clients')) setShowNewClientModal(true);
                else if (path.startsWith('/products')) openProductDrawer();
                else if (path.startsWith('/invoices')) setShowNewInvoiceDrawer(true);
                else if (path.startsWith('/projects')) setShowNewProjectDrawer(true);
                else setShowLineItemDrawer(true);
              }}
              className="flex items-center text-[#A3A6AE] hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {(() => {
                const path = window.location.pathname;
                if (path.startsWith('/products')) return 'Product';
                if (path.startsWith('/invoices')) return 'Invoice';
                if (path.startsWith('/projects')) return 'Project';
                if (path.startsWith('/clients')) return 'Client';
                if (path.startsWith('/packages')) return 'Package';
                if (path.startsWith('/pricebooks')) return 'Price Book';
                if (path.startsWith('/contracts')) return 'Contract';
                return 'Item';
              })()}
            </button>
          </div>
        </div>
        {/* Sidebar - fixed, left-aligned */}
        <div className="hidden md:flex fixed left-0 top-0 w-64 h-full overflow-y-auto bg-[#121212] border-r border-gray-700 flex-col z-[9999]">
          {/* Organization header */}
          <div className="p-4 border-b border-[#333333]">
            <div className="bg-[#1E1E1E] rounded-md p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#336699] text-white w-12 h-12 rounded-md flex items-center justify-center text-2xl font-bold">
                  A
                </div>
                <span className="text-white text-xl font-medium">ACME CO</span>
              </div>
              <ChevronDown className="text-[#336699] w-5 h-5" />
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-[#333333] relative">
            <div className="bg-[#1E1E1E] rounded-md flex items-center px-4 py-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                className="bg-transparent border-none w-full text-white focus:outline-none ml-2 placeholder-gray-400"
              />
              {/* Plus button removed to separate search and create functionalities */}
            </div>
            
            {/* Create button - with increased separation from search */}
            <div className="w-full mt-6 mb-4">
              <button
                ref={createButtonRef}
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="w-full bg-[#336699] text-white rounded-md py-3 px-4 flex items-center justify-between hover:bg-[#2A5580] transition-colors"
                aria-expanded={isCreateMenuOpen}
                aria-haspopup="true"
                id="create-button"
              >
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="font-medium">Create new...</span>
                </div>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            
            {/* Create Menu - Drawer-style interaction */}
            {isCreateMenuOpen && (
              <div className="fixed inset-0 z-[9999]">
                {/* Drawer backdrop - only visible when open */}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setIsCreateMenuOpen(false)}
                />
                
                {/* Drawer panel - full screen on mobile, sidebar on desktop */}
                <div 
                  ref={createDropdownRef}
                  className="absolute inset-y-0 left-0 w-full md:max-w-md bg-[#1A2332] shadow-xl overflow-y-auto transform transition-transform duration-300 ease-in-out"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="create-button"
                  tabIndex={-1}
                >
                  {/* Modal header with close button */}
                  <div className="p-4 border-b border-[#2D3748] flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-medium text-white">Create New Item</h2>
                      <p className="text-sm text-gray-400">Choose what you'd like to create</p>
                    </div>
                    <button 
                      onClick={() => setIsCreateMenuOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Create New section */}
                  <div className="border-b border-[#2D3748]">
                    <h3 className="text-gray-400 text-sm font-medium p-4 pb-2">Create New</h3>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setShowLineItemDrawer(true);
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
                    >
                      <span className="text-[#F9D71C] mr-4 w-8 h-8 flex items-center justify-center">+</span>
                      <div className="text-left">
                        <div className="font-medium">Line Item</div>
                        <div className="text-sm text-gray-400">Add individual service or product</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setShowNewClientModal(true);
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <Users size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Client</div>
                        <div className="text-sm text-gray-400">New customer or contact</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setShowNewProjectDrawer(true);
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <FolderKanban size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Project</div>
                        <div className="text-sm text-gray-400">Start a new project</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setShowNewInvoiceDrawer(true);
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <FileText size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Invoice</div>
                        <div className="text-sm text-gray-400">Create billing document</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        openProductDrawer();
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <FileStack size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Product</div>
                        <div className="text-sm text-gray-400">Add to inventory</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                  </div>
                  
                  {/* Templates section */}
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium p-4 pb-2">Templates</h3>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        // Handle price book template creation
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <Book size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Price book template</div>
                        <div className="text-sm text-gray-400">Reusable pricing structure</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        // Handle project template creation
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <FolderKanban size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Project template</div>
                        <div className="text-sm text-gray-400">Standard project layout</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        // Handle contract template creation
                      }}
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors"
                    >
                      <span className="text-[#336699] mr-4 w-8 h-8 flex items-center justify-center">
                        <FileText size={20} />
                      </span>
                      <div className="text-left">
                        <div className="font-medium">Contract template</div>
                        <div className="text-sm text-gray-400">Legal document template</div>
                      </div>
                      <ChevronRight className="ml-auto text-gray-400" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Grid navigation */}
          <div className="px-2 pt-2 grid grid-cols-2 gap-1">
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#336699] p-2 rounded-md flex flex-col items-center justify-center border-l-2 border-[#336699]"
                  : "bg-[#1E1E1E] p-2 rounded-md flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="mb-0.5">
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>⠿</span>
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Dashboard</span>
                </>
              )}
            </NavLink>

            {/* Clients */}
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#336699] p-2 rounded-md flex flex-col items-center justify-center border-l-2 border-[#336699]"
                  : "bg-[#1E1E1E] p-2 rounded-md flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="mb-0.5">
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>👤</span>
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Clients</span>
                </>
              )}
            </NavLink>

            {/* Projects */}
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#336699] p-2 rounded-md flex flex-col items-center justify-center border-l-2 border-[#336699]"
                  : "bg-[#1E1E1E] p-2 rounded-md flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="mb-0.5">
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📁</span>
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Projects</span>
                </>
              )}
            </NavLink>

            {/* Invoices */}
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#336699] p-2 rounded-md flex flex-col items-center justify-center border-l-2 border-[#336699]"
                  : "bg-[#1E1E1E] p-2 rounded-md flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="mb-0.5">
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📄</span>
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Invoices</span>
                </>
              )}
            </NavLink>

            {/* Products */}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#336699] p-2 rounded-md flex flex-col items-center justify-center border-l-2 border-[#336699]"
                  : "bg-[#1E1E1E] p-2 rounded-md flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="mb-0.5">
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📦</span>
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Products</span>
                </>
              )}
            </NavLink>

            {/* Price Book */}
            <NavLink
              to="/price-book"
              className={({ isActive }) =>
                isActive
                  ? "bg-[#336699] p-2 rounded-md flex flex-col items-center justify-center border-l-2 border-[#336699]"
                  : "bg-[#1E1E1E] p-2 rounded-md flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="mb-0.5">
                    <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📘</span>
                  </div>
                  <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Price Book</span>
                </>
              )}
            </NavLink>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-4 mx-2">
            <h3 className="text-gray-400 text-xs uppercase font-medium mb-2 px-1">QUICK STATS</h3>
            <div className="bg-[#1E1E1E] rounded-md p-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div className="text-gray-400 text-xs">Active Projects</div>
                  <div className="text-white text-xl font-bold">12</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Pending Invoices</div>
                  <div className="text-white text-xl font-bold">5</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-gray-400 text-xs">This Month</div>
                  <div className="text-[#2ECC71] text-xl font-bold">$24,500</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Clients</div>
                  <div className="text-white text-xl font-bold">28</div>
                </div>
              </div>
            </div>
          </div>

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
        {/* Mobile header - only visible on mobile devices */}
        <div className="md:hidden fixed left-48 top-0 right-0 h-16 z-20 bg-[#121212] border-b border-gray-200 dark:border-gray-800 flex items-center px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">
              {(() => {
                const path = location.pathname;
                if (path === '/dashboard') return 'Dashboard';
                if (path.startsWith('/clients')) return 'Clients';
                if (path.startsWith('/projects')) return 'Projects';
                if (path.startsWith('/invoices')) return 'Invoices';
                if (path.startsWith('/products')) return 'Products';
                if (path.startsWith('/price-book')) return 'Price Book';
                if (path.startsWith('/contracts')) return 'Contracts';
                return 'Dashboard';
              })()}
            </h1>
          </div>
        </div>
        {/* Main Content - margin left for sidebar only */}
        <div className={`flex-1 ${location.pathname.startsWith('/products') ? 'md:ml-[8.5rem] pt-[3.5rem]' : 'md:ml-64 pt-16'} px-0 bg-[#121212]`}>
          {/* Render children with setTriggerNewProduct prop if possible */}
          <div className="h-full w-full -mt-16 pt-16 -ml-0 px-0">
            {children}
          </div>
        </div>

        {/* Mobile Navigation Menu - Full Screen */}
        <div className={`md:hidden fixed inset-0 z-[10000] ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black bg-opacity-90" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 w-full bg-[#121212] overflow-y-auto z-[10001]">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-[#2D3748]">
              <span className="text-xl font-medium text-white">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Organization header */}
            <div className="p-4 border-b border-[#333333]">
              <div className="bg-[#1E1E1E] rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#336699] text-white w-12 h-12 rounded-md flex items-center justify-center text-2xl font-bold">
                    A
                  </div>
                  <span className="text-white text-xl font-medium">ACME CO</span>
                </div>
                <ChevronDown className="text-[#336699] w-5 h-5" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-[#333333]">
              <div className="bg-[#1E1E1E] rounded-md flex items-center px-4 py-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  className="bg-transparent border-none w-full text-white focus:outline-none ml-2 placeholder-gray-400"
                />
                <div className="text-[#336699] relative">
                  <button
                    onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                    className="flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m6 0H6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid navigation - Mobile version (without section headers) */}
            <div className="p-2 grid grid-cols-2 gap-2">
              {/* Dashboard */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#336699] p-3 rounded-sm flex flex-col items-center justify-center border-l-2 border-[#336699]"
                    : "bg-[#1E1E1E] p-3 rounded-sm flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="mb-0.5">
                      <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>⠿</span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Dashboard</span>
                  </>
                )}
              </NavLink>

              {/* Clients */}
              <NavLink
                to="/clients"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#336699] p-3 rounded-sm flex flex-col items-center justify-center border-l-2 border-[#336699]"
                    : "bg-[#1E1E1E] p-3 rounded-sm flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="mb-0.5">
                      <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>👤</span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Clients</span>
                  </>
                )}
              </NavLink>

              {/* Projects */}
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#336699] p-3 rounded-sm flex flex-col items-center justify-center border-l-2 border-[#336699]"
                    : "bg-[#1E1E1E] p-3 rounded-sm flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="mb-0.5">
                      <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📁</span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Projects</span>
                  </>
                )}
              </NavLink>

              {/* Invoices */}
              <NavLink
                to="/invoices"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#336699] p-3 rounded-sm flex flex-col items-center justify-center border-l-2 border-[#336699]"
                    : "bg-[#1E1E1E] p-3 rounded-sm flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="mb-0.5">
                      <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📄</span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Invoices</span>
                  </>
                )}
              </NavLink>

              {/* Products */}
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#336699] p-3 rounded-sm flex flex-col items-center justify-center border-l-2 border-[#336699]"
                    : "bg-[#1E1E1E] p-3 rounded-sm flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="mb-0.5">
                      <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📦</span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Products</span>
                  </>
                )}
              </NavLink>

              {/* Price Book */}
              <NavLink
                to="/price-book"
                className={({ isActive }) =>
                  isActive
                    ? "bg-[#336699] p-3 rounded-sm flex flex-col items-center justify-center border-l-2 border-[#336699]"
                    : "bg-[#1E1E1E] p-3 rounded-sm flex flex-col items-center justify-center hover:bg-[#333333] transition-colors"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <div className="mb-0.5">
                      <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-300'}`}>📘</span>
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white' : 'text-gray-300'}`}>Price Book</span>
                  </>
                )}
              </NavLink>
            </div>

            {/* Quick Stats Section - Mobile */}
            <div className="mt-4 mx-2">
              <h3 className="text-gray-400 text-xs uppercase font-medium mb-2 px-1">QUICK STATS</h3>
              <div className="bg-[#1E1E1E] rounded-md p-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-gray-400 text-xs">Active Projects</div>
                    <div className="text-white text-xl font-bold">12</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Pending Invoices</div>
                    <div className="text-white text-xl font-bold">5</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-gray-400 text-xs">This Month</div>
                    <div className="text-[#2ECC71] text-xl font-bold">$24,500</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Clients</div>
                    <div className="text-white text-xl font-bold">28</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Navigation Sections (without headers on mobile) */}
            {sidebarItems.map((section, _idx) => (
              <div key={section.title} className="p-4 border-b border-gray-800">
                {/* Section header hidden on mobile */}
                <div className="hidden md:flex items-center justify-between mb-2">
                  {section.title !== 'Main Navigation' && (
                    <span className="text-xs font-medium text-gray-500 uppercase">{section.title}</span>
                  )}
                  {section.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-900 text-green-300">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => (
                    <NavLink
                      key={`${section.title}-${item.to}-${itemIdx}`}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          item.isAction
                            ? 'text-[#336699]'
                            : isActive || item.highlighted
                            ? 'text-[#336699] bg-[#232323]'
                            : 'text-gray-400 hover:text-white hover:bg-[#232323]'
                        }`
                      }
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-3" />}
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
          <div className="fixed inset-0 z-[11000]">
            <NewClientModal
              onClose={() => setShowNewClientModal(false)}
              onSave={() => setShowNewClientModal(false)}
            />
          </div>
        )}
        {/* NewClientModal drawer */}
        {showNewClientDrawer && (
          <div className="fixed inset-0 z-[11000]">
            <NewClientModal
              onClose={() => setShowNewClientDrawer(false)}
              onSave={() => {
                setShowNewClientDrawer(false);
              }}
            />
          </div>
        )}
        {/* New Line Item Drawer */}
        {showLineItemDrawer && (
          <div className="fixed inset-0 z-[11000] flex justify-end">
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
              className={
                `md:w-full md:max-w-md
                transition-transform duration-300 ease-out
                bg-white dark:bg-gray-800
                shadow-xl
                overflow-hidden
                h-full
                transform
                ${isClosingLineItemDrawer ? 'translate-x-full' : 'translate-x-0'}`
              }
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
                onSubmit={async () => {
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
          <div className="fixed inset-0 z-[11000]">
            <NewInvoiceModal
              onClose={() => setShowNewInvoiceDrawer(false)}
              onSave={() => setShowNewInvoiceDrawer(false)}
            />
          </div>
        )}
        {/* New Project Drawer */}
        {showNewProjectDrawer && (
          <div className="fixed inset-0 z-[11000]">
            {/* TODO: Replace with your actual NewProjectModal component */}
            <div className="flex items-center justify-center h-full">
              <div className="bg-[#232635] p-8 rounded shadow-xl text-white">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">New Project (Placeholder)</h2>
                  <button onClick={() => setShowNewProjectDrawer(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <p>Replace this with your actual NewProjectModal or ProjectForm component.</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Create Button removed - using single FAB implementation */}
        
        {/* Mobile Floating Action Button (FAB) - Opens Creation Menu */}
        <div className="md:hidden fixed right-4 bottom-4 z-[9990]">
          <button
            onClick={() => {
              // Direct approach to ensure the menu opens
              setIsCreateMenuOpen(true);
            }}
            className="w-14 h-14 rounded-full bg-[#F9D71C] text-[#121212] flex items-center justify-center shadow-lg hover:bg-[#E8C80F] transition-colors"
            aria-label="Create new item"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(51, 102, 153, 0.2)' }}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </IndustryContext.Provider>
  );
};