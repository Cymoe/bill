import React, { useState, useEffect, useRef, createContext } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  FileText, 
  Book, 
  Plus, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  MessageSquare,
  LogOut,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  FileStack,
  Zap,
  AlertTriangle,
  ChevronUp,
  CheckCircle2,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NewClientModal } from '../clients/NewClientModal';
import ProductForm from '../products/ProductForm';
import { NewInvoiceModal } from '../invoices/NewInvoiceModal';
import { useProductDrawer } from '../../contexts/ProductDrawerContext';

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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const IndustryContext = createContext<{ selectedIndustry: string; setSelectedIndustry: (v: string) => void }>({ selectedIndustry: 'All Trades', setSelectedIndustry: () => {} });

// Context for mobile menu state
export const MobileMenuContext = createContext<{ isMobileMenuOpen: boolean; setIsMobileMenuOpen: (v: boolean) => void }>({ isMobileMenuOpen: false, setIsMobileMenuOpen: () => {} });

// Context for mobile create menu state
export const MobileCreateMenuContext = createContext<{ isCreateMenuOpen: boolean; setIsCreateMenuOpen: (v: boolean) => void }>({ isCreateMenuOpen: false, setIsCreateMenuOpen: () => {} });

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, signOut, session, isLoading } = useAuth();
  const isAuthenticated = !!session;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
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
  const quickStartRef = useRef<HTMLDivElement>(null);
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
  const [isQuickStartCollapsed, setIsQuickStartCollapsed] = useState(true);
  const [isQuickStartDismissed, setIsQuickStartDismissed] = useState(false);

  // Mock organizations
  const mockOrgs = [
    { id: 'org1', name: 'Acme Construction', industry: 'New Construction' },
    { id: 'org2', name: 'Remodel Pros', industry: 'Remodelers' },
    { id: 'org3', name: 'Service Kings', industry: 'Service' },
    { id: 'org4', name: 'Luxury Estates', industry: 'Luxury Villas' },
  ];
  const [selectedOrg, setSelectedOrg] = useState(mockOrgs[0]);

  // Time period state for Live Money Pulse
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'D' | 'W' | 'M' | 'Q' | 'Y'>('D');
  
  // Mock data for different time periods
  const moneyPulseData = {
    D: { revenue: 24500, profit: 7623, goal: 33500, percentage: 73 },
    W: { revenue: 127800, profit: 38340, goal: 150000, percentage: 85 },
    M: { revenue: 485200, profit: 145560, goal: 500000, percentage: 97 },
    Q: { revenue: 1425600, profit: 427680, goal: 1500000, percentage: 95 },
    Y: { revenue: 5234800, profit: 1570440, goal: 6000000, percentage: 87 }
  };

  const currentData = moneyPulseData[selectedTimePeriod];
  const timePeriodLabels = {
    D: "Today's",
    W: "This Week's", 
    M: "This Month's",
    Q: "This Quarter's",
    Y: "This Year's"
  };

  // Function to cycle to next time period
  const cycleTimePeriod = () => {
    const periods: Array<'D' | 'W' | 'M' | 'Q' | 'Y'> = ['D', 'W', 'M', 'Q', 'Y'];
    const currentIndex = periods.indexOf(selectedTimePeriod);
    const nextIndex = (currentIndex + 1) % periods.length;
    setSelectedTimePeriod(periods[nextIndex]);
  };

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

  // Mobile menu state is now exposed through context

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

  // Close Quick Start dropdown on outside click
  useEffect(() => {
    if (isQuickStartCollapsed || isSidebarCollapsed) return;
    function handleClickOutside(event: MouseEvent) {
      if (quickStartRef.current && !quickStartRef.current.contains(event.target as Node)) {
        setIsQuickStartCollapsed(true);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickStartCollapsed, isSidebarCollapsed]);

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

  // Debug function to track sidebar state changes
  const setSidebarCollapsedWithLogging = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(isSidebarCollapsed) : value;
    console.log('Sidebar state changing:', { from: isSidebarCollapsed, to: newValue, stack: new Error().stack });
    setIsSidebarCollapsed(value);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
  };

  return (
    <MobileCreateMenuContext.Provider value={{ isCreateMenuOpen, setIsCreateMenuOpen }}>
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
    <IndustryContext.Provider value={{ selectedIndustry, setSelectedIndustry }}>
      <div className="min-h-screen bg-[#121212]">
        {/* Top Navbar - fixed, full-width for desktop and mobile, modified on dashboard */}
        {/* Hidden - now using PageHeaderBar component in each page */}
        <div className={`hidden flex fixed top-0 right-0 h-16 bg-[#121212] border-b border-gray-700 items-center justify-between px-6 z-[9999] md:left-52 left-0`}>
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
          {/* Search bar - moved from sidebar to header */}
          <div className="relative hidden md:flex items-center gap-4">
            <div className="relative w-64">
              <div className="bg-[#1E1E1E] rounded-md flex items-center px-3 py-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  className="bg-transparent border-none w-full text-white text-sm focus:outline-none ml-2 placeholder-gray-400"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const path = window.location.pathname;
                if (path.startsWith('/clients')) setShowNewClientModal(true);
                else if (path.startsWith('/products')) openProductDrawer();
                else if (path.startsWith('/invoices')) setShowNewInvoiceDrawer(true);
                else if (path.startsWith('/projects')) navigate('/projects/new');
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
        <div className={`hidden md:flex fixed left-0 top-0 ${isSidebarCollapsed ? 'w-14' : 'w-48'} h-full bg-[#121212] border-r border-gray-700 flex-col z-[9999] transition-all duration-300`}>
          {/* Organization header and sidebar toggle */}
          <div className="p-2 border-b border-[#333333] relative flex items-center justify-between">
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="flex-1 bg-[#1E1E1E] rounded-md p-2 flex items-center justify-between mr-1"
              >
                <div className="flex items-center">
                  <span className="text-white text-base font-medium leading-tight truncate max-w-[110px]">{selectedOrg.name}</span>
                </div>
                <ChevronDown className={`text-[#336699] w-4 h-4 transition-transform duration-200 ${orgDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
            )}
            <button
              onClick={() => setSidebarCollapsedWithLogging(!isSidebarCollapsed)}
              className={`${isSidebarCollapsed ? 'w-full' : 'w-8'} h-8 flex items-center justify-center rounded-md bg-[#1E1E1E] text-[#9E9E9E] hover:text-white transition-colors`}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            
            {/* Organization Dropdown */}
            {orgDropdownOpen && !isSidebarCollapsed && (
              <div className="absolute left-2 right-2 top-[calc(100%-8px)] mt-1 bg-[#1E1E1E] border border-[#333333] rounded-md shadow-lg z-50 py-1 overflow-hidden">
                {mockOrgs.map((org) => (
                  <button
                    key={org.id}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#333333] transition-colors ${selectedOrg.id === org.id ? 'bg-[#232D3F]' : ''}`}
                    onClick={() => {
                      setSelectedOrg(org);
                      setOrgDropdownOpen(false);
                    }}
                  >
                    <div className={`text-white w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold ${selectedOrg.id === org.id ? 'bg-[#336699]' : 'bg-[#333333]'}`}>
                      {org.name.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden max-w-[120px]">
                      <span className="text-white text-sm font-medium truncate">{org.name}</span>
                      <span className="text-gray-400 text-xs truncate">{org.industry}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create button - more prominent after removing search */}
          <div className="px-2 py-3 border-b border-[#333333] relative">
            <div className="w-full space-y-2">
              <button
                ref={createButtonRef}
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className={`w-full text-[#9E9E9E] font-bold py-2 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-3 justify-between'} flex items-center hover:text-white transition-colors`}
                aria-expanded={isCreateMenuOpen}
                aria-haspopup="true"
                id="create-button"
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-5 h-5 rounded-full bg-[#336699] flex items-center justify-center mr-0">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                  {!isSidebarCollapsed && <span className="font-normal text-base uppercase tracking-wide ml-3">Create</span>}
                </div>
              </button>
              
              <button
                onClick={() => navigate('/chat')}
                className={`w-full text-[#9E9E9E] font-bold py-2 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-3 justify-between'} flex items-center hover:text-white transition-colors`}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-5 h-5 rounded-full border border-[#9E9E9E] flex items-center justify-center mr-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  {!isSidebarCollapsed && <span className="font-normal text-base uppercase tracking-wide ml-3">ADVISOR</span>}
                </div>
                {!isSidebarCollapsed && <ChevronRight className="w-4 h-4 text-[#9E9E9E]" />}
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
                        navigate('/projects/new');
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
                      className="flex items-center w-full px-4 py-4 text-white hover:bg-[#232D3F] transition-colors border-b border-[#2D3748]"
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

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
          {/* Grid navigation */}
          <div className={`${isSidebarCollapsed ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-0`}>
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#252525] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">⠿</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Dashboard
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>

            {/* Clients */}
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#252525] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">👤</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Clients
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>

            {/* Projects */}
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#252525] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">📁</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Projects
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>

            {/* Invoices */}
            <NavLink
              to="/invoices"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#252525] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">📄</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Invoices
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>

            {/* Products */}
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#252525] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">📦</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Products
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>

            {/* Price Book */}
            <NavLink
              to="/price-book"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#252525] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">📘</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Price Book
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          </div>

          {/* Live Revenue - visible in both expanded and collapsed states */}
          <div className="p-3">
            {!isSidebarCollapsed ? (
              <div className="bg-gradient-to-r from-[#336699]/30 to-[#0D47A1]/20 p-4 rounded-[4px] border border-[#336699]/30">
                {/* Header with time period selector */}
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <Zap className="h-4 w-4 mr-2 text-[#336699] animate-pulse" />
                    <span className="text-[#336699] font-bold text-sm">LIVE REVENUE</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {(['D', 'W', 'M', 'Q', 'Y'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedTimePeriod(period)}
                        className={`w-6 h-6 rounded-[2px] flex items-center justify-center text-xs font-bold transition-colors hover:opacity-80 ${
                          selectedTimePeriod === period
                            ? 'bg-[#336699] text-white'
                            : 'bg-[#333333] text-gray-400 hover:bg-[#404040]'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue and Profit Display */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Revenue</div>
                    <div className="text-white text-sm font-bold">${currentData.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Profit</div>
                    <div className="text-white text-sm font-bold">${currentData.profit.toLocaleString()}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="w-full bg-[#333333] rounded-full h-2">
                    <div 
                      className="bg-[#336699] h-2 rounded-full transition-all duration-300" 
                      style={{width: `${currentData.percentage}%`}}
                    ></div>
                  </div>
                </div>

                {/* Goal Progress - Fixed width container */}
                <div className="text-center">
                  <span className="text-[#336699] text-sm font-bold">{currentData.percentage}% of goal</span>
                </div>
              </div>
            ) : (
              /* Collapsed state - just lightning bolt */
              <div 
                onClick={cycleTimePeriod}
                className="w-8 h-8 bg-gradient-to-r from-[#336699]/30 to-[#0D47A1]/20 rounded-[4px] border border-[#336699]/30 cursor-pointer hover:from-[#336699]/40 hover:to-[#0D47A1]/30 transition-all duration-200 flex items-center justify-center mx-auto"
                title={`${timePeriodLabels[selectedTimePeriod]} Revenue: $${currentData.revenue.toLocaleString()}`}
              >
                <Zap className="h-4 w-4 text-[#336699] animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Profit Alerts section removed for cleaner pilot cockpit aesthetic */}
          </div>

          <div className="mt-auto">
          {/* Quick Start Guide - Collapsible onboarding at bottom */}
          {!isQuickStartDismissed && (
            <div className="border-t border-gray-700" ref={quickStartRef}>
              {!isSidebarCollapsed ? (
                /* Expanded state - full Quick Start guide */
                <>
                  <button
                    onClick={() => setIsQuickStartCollapsed(!isQuickStartCollapsed)}
                    className="w-full p-2 flex items-center justify-between text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="flex items-center">
                      {/* Circular Progress Indicator */}
                      <div className="relative w-6 h-6 mr-2">
                        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                          {/* Background circle */}
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 9}`}
                            strokeDashoffset={`${2 * Math.PI * 9 * (1 - 0.2)}`}
                            className="text-[#F9D71C] transition-all duration-300"
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Center number showing current step */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[#F9D71C] text-sm font-bold leading-none">1</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium">QUICK START</span>
                    </div>
                    <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${isQuickStartCollapsed ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                  
                  {!isQuickStartCollapsed && (
                    <div className="px-2 pb-2">
                      <div className="space-y-2">
                        <div className="bg-[#388E3C]/20 border border-[#388E3C]/30 rounded-[4px] p-2 flex items-center">
                          <CheckCircle2 className="h-3 w-3 text-[#388E3C] mr-2 flex-shrink-0" />
                          <span className="text-white text-xs">Add your first client</span>
                        </div>
                        
                        <div className="bg-[#1E1E1E] border border-[#336699]/30 rounded-[4px] p-2 hover:border-[#336699]/50 transition-colors cursor-pointer flex items-center">
                          <div className="w-3 h-3 border border-[#336699] rounded-full mr-2 flex-shrink-0 flex items-center justify-center">
                            <div className="w-1 h-1 bg-[#336699] rounded-full"></div>
                          </div>
                          <span className="text-white text-xs">Create your first project</span>
                        </div>
                        
                        <div className="bg-[#1E1E1E] border border-gray-600/30 rounded-[4px] p-2 flex items-center opacity-75">
                          <div className="w-3 h-3 border border-gray-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="text-gray-400 text-xs">Set up your price book</span>
                        </div>
                        
                        <div className="bg-[#1E1E1E] border border-gray-600/30 rounded-[4px] p-2 flex items-center opacity-75">
                          <div className="w-3 h-3 border border-gray-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="text-gray-400 text-xs">Send your first invoice</span>
                        </div>
                        
                        <div className="bg-[#1E1E1E] border border-gray-600/30 rounded-[4px] p-2 flex items-center opacity-75">
                          <div className="w-3 h-3 border border-gray-500 rounded-full mr-2 flex-shrink-0"></div>
                          <span className="text-gray-400 text-xs">Try the ADVISOR feature</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-800 rounded-full h-1 w-16">
                            <div className="bg-[#F9D71C] h-1 rounded-full" style={{width: '20%'}}></div>
                          </div>
                          <span className="text-gray-400 text-xs ml-2">1/5</span>
                        </div>
                        <button 
                          onClick={() => setIsQuickStartDismissed(true)}
                          className="text-[#336699] text-xs font-medium hover:text-white transition-colors"
                        >
                          SKIP
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Collapsed state - just progress circle */
                <div className="p-2 flex justify-center">
                  <div 
                    className="relative w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-200"
                    title="Quick Start Progress: 1/5 steps completed"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSidebarCollapsedWithLogging(false);
                      setIsQuickStartCollapsed(false);
                    }}
                  >
                    <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                      {/* Background circle */}
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-gray-600"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 9}`}
                        strokeDashoffset={`${2 * Math.PI * 9 * (1 - 0.2)}`}
                        className="text-[#F9D71C] transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center text showing completion */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#F9D71C] text-xs font-bold">1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* User Info */}
          <div className="relative border-t border-gray-700">
            {/* Dropdown Menu - positioned absolutely above user info */}
            {isProfileMenuOpen && (
              <div className={`absolute bottom-full ${isSidebarCollapsed ? 'left-0 w-36' : 'left-0 right-0'} mb-1 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg overflow-hidden z-50`}>
                <button
                  onClick={() => {
                    signOut();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-white text-opacity-90 hover:bg-[#333333] transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                  <span className="uppercase tracking-wider text-xs font-medium">SIGN OUT</span>
                </button>
              </div>
            )}
            
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
        <div className={`flex-1 ${isSidebarCollapsed ? 'md:ml-14' : 'md:ml-48'} px-0 bg-[#121212] transition-all duration-300`}>
          {/* Render children with setTriggerNewProduct prop if possible */}
          <div className="h-full w-full">
            {children}
          </div>
        </div>

        {/* Mobile Navigation Menu - Full Screen */}
        <div className={`md:hidden fixed inset-0 z-[10000] ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black bg-opacity-90" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 w-full bg-[#121212] flex flex-col z-[10001] h-full">
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-[#333333] flex-shrink-0">
              <span className="text-xl font-medium text-white uppercase">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main Content - Flex container that fills remaining space */}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Organization header */}
              <div className="p-2 border-b border-[#333333] relative flex-shrink-0">
                <button 
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="w-full bg-[#1E1E1E] rounded-md p-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="text-white text-base font-medium">{selectedOrg.name}</span>
                  </div>
                  <ChevronDown className={`text-[#336699] w-4 h-4 transition-transform duration-200 ${orgDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                {/* Organization Dropdown - Mobile */}
                {orgDropdownOpen && (
                  <div className="absolute left-2 right-2 top-[calc(100%-8px)] mt-1 bg-[#1E1E1E] border border-[#333333] rounded-md shadow-lg z-50 py-1 overflow-hidden">
                    {mockOrgs.map((org) => (
                      <button
                        key={org.id}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#333333] transition-colors ${selectedOrg.id === org.id ? 'bg-[#232D3F]' : ''}`}
                        onClick={() => {
                          setSelectedOrg(org);
                          setOrgDropdownOpen(false);
                        }}
                      >
                        <div className={`text-white w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold ${selectedOrg.id === org.id ? 'bg-[#336699]' : 'bg-[#333333]'}`}>
                          {org.name.charAt(0)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white text-sm font-medium truncate">{org.name}</span>
                          <span className="text-gray-400 text-xs truncate">{org.industry}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create and Advisor buttons */}
              <div className="px-2 py-3 flex-shrink-0">
                <div className="w-full space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/chat');
                    }}
                    className="w-full text-[#9E9E9E] font-bold py-2 px-3 flex items-center justify-between hover:text-white transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full border border-[#9E9E9E] flex items-center justify-center mr-3">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-normal text-base uppercase tracking-wide">ADVISOR</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9E9E9E]" />
                  </button>
                </div>
              </div>

              {/* Grid navigation - Takes up remaining space with scroll if needed */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-0 min-h-full">
                  {/* Dashboard */}
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "w-full bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                        : "w-full bg-white/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className={`text-sm font-medium uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>Dashboard</span>
                    )}
                  </NavLink>

                  {/* Clients */}
                  <NavLink
                    to="/clients"
                    className={({ isActive }) =>
                      isActive
                        ? "w-full bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                        : "w-full bg-white/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className={`text-sm font-medium uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>Clients</span>
                    )}
                  </NavLink>

                  {/* Projects */}
                  <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                      isActive
                        ? "w-full bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                        : "w-full bg-white/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className={`text-sm font-medium uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>Projects</span>
                    )}
                  </NavLink>

                  {/* Invoices */}
                  <NavLink
                    to="/invoices"
                    className={({ isActive }) =>
                      isActive
                        ? "w-full bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                        : "w-full bg-white/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className={`text-sm font-medium uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>Invoices</span>
                    )}
                  </NavLink>

                  {/* Products */}
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      isActive
                        ? "w-full bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                        : "w-full bg-white/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className={`text-sm font-medium uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>Products</span>
                    )}
                  </NavLink>

                  {/* Price Book */}
                  <NavLink
                    to="/price-book"
                    className={({ isActive }) =>
                      isActive
                        ? "w-full bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                        : "w-full bg-white/5 backdrop-blur-md px-4 py-12 flex items-center justify-center border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {({ isActive }) => (
                      <span className={`text-sm font-medium uppercase ${isActive ? 'text-white' : 'text-gray-300'}`}>Price Book</span>
                    )}
                  </NavLink>
                </div>

                {/* Live Money Pulse - Attached to bottom of grid */}
                <div 
                  onClick={cycleTimePeriod}
                  className="bg-gradient-to-r from-[#336699]/30 to-[#0D47A1]/20 p-4 border-b border-[#336699]/30 cursor-pointer active:scale-95 transition-transform duration-150 flex-shrink-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#336699] font-bold text-sm flex items-center">
                      <Zap className="h-4 w-4 mr-1 animate-pulse" />
                      LIVE REVENUE
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#336699] rounded-full animate-pulse"></div>
                      <div className="bg-[#336699]/20 px-2 py-1 rounded-[4px] border border-[#336699]/50">
                        <span className="text-[#336699] text-xs font-bold">{selectedTimePeriod}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{timePeriodLabels[selectedTimePeriod]} Revenue</span>
                      <span className="text-[#336699] font-bold animate-pulse">${currentData.revenue.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Pure Profit</span>
                      <span className="text-white font-bold">${currentData.profit.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-[#336699] h-2 rounded-full animate-pulse" style={{width: `${currentData.percentage}%`}}></div>
                    </div>
                    <div className="text-xs text-[#336699] text-center">{currentData.percentage}% of {selectedTimePeriod === 'D' ? 'daily' : selectedTimePeriod === 'W' ? 'weekly' : selectedTimePeriod === 'M' ? 'monthly' : selectedTimePeriod === 'Q' ? 'quarterly' : 'yearly'} goal</div>
                  </div>
                  
                  <div className="text-center mt-3">
                    <span className="text-gray-500 text-xs">TAP TO CYCLE PERIODS</span>
                  </div>
                </div>
              </div>

              {/* Fixed User Section at Bottom */}
              <div className="border-t border-[#333333] bg-[#121212] flex-shrink-0">
                {/* Mobile Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="bg-[#1E1E1E] border-t border-[#333333]">
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-white text-opacity-90 hover:bg-[#333333] transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                      <span className="uppercase tracking-wider text-xs font-medium">SIGN OUT</span>
                    </button>
                  </div>
                )}
                
                <div className="px-3 py-2.5">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user?.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata.full_name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 ml-2 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="ml-1.5 p-0.5 rounded-full hover:bg-gray-800 transition-colors duration-200"
                    >
                      <ChevronUp
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-0' : 'rotate-180'}`}
                      />
                    </button>
                  </div>
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
              className={`flex-1 ml-0 ${isSidebarCollapsed ? 'md:ml-14' : 'md:ml-48'} transition-all duration-300`}
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
        
        {/* Mobile Create Menu - Full Screen */}
        {isCreateMenuOpen && (
          <div className="fixed inset-0 z-[10000] md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-90" onClick={() => setIsCreateMenuOpen(false)} />
            <div className="fixed inset-0 w-full bg-[#121212] overflow-y-auto z-[10001]">
              {/* Mobile Header with Close Button */}
              <div className="flex items-center justify-between p-6 border-b border-[#2D3748]">
                <span className="text-xl font-medium text-white">Choose what you'd like to create</span>
                <button onClick={() => setIsCreateMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Create New Options */}
              <div className="p-4">
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-3">CREATE NEW</h3>
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    setShowLineItemDrawer(true);
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#F9D71C] text-[#121212] flex items-center justify-center mr-4">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Line Item</div>
                    <div className="text-sm text-gray-400">Add individual service or product</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    setShowNewClientModal(true);
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Client</div>
                    <div className="text-sm text-gray-400">New customer or contact</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    navigate('/projects/new');
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Project</div>
                    <div className="text-sm text-gray-400">Start a new project</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    setShowNewInvoiceDrawer(true);
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Invoice</div>
                    <div className="text-sm text-gray-400">Create billing document</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    openProductDrawer();
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <FileStack size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Product</div>
                    <div className="text-sm text-gray-400">Add to inventory</div>
                  </div>
                </button>
                
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide mt-6 mb-3">TEMPLATES</h3>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    // Handle price book template creation
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <Book className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Price book template</div>
                    <div className="text-sm text-gray-400">Reusable pricing structure</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    // Handle project template creation
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Project template</div>
                    <div className="text-sm text-gray-400">Standard project layout</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    // Handle contract template creation
                  }}
                  className="flex items-center w-full p-4 mb-4 text-white bg-[#1E1E1E] rounded-[4px] border border-[#333333]"
                >
                  <div className="w-10 h-10 rounded-[4px] bg-[#336699] text-white flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Contract template</div>
                    <div className="text-sm text-gray-400">Legal document template</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </IndustryContext.Provider>
    </MobileMenuContext.Provider>
    </MobileCreateMenuContext.Provider>
  );
};