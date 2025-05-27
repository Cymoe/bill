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
  User,
  Settings,
  Building,
  CreditCard,
  HelpCircle
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
  const [isLiveRevenuePopoverOpen, setIsLiveRevenuePopoverOpen] = useState(false);
  const liveRevenuePopoverRef = useRef<HTMLDivElement>(null);
  const liveRevenueButtonRef = useRef<HTMLDivElement>(null);
  const [isProjectsSidebarOpen, setIsProjectsSidebarOpen] = useState(false);
  const [projectsSearch, setProjectsSearch] = useState('');
  const projectsSidebarRef = useRef<HTMLDivElement>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isProjectsSidebarLocked, setIsProjectsSidebarLocked] = useState(() => {
    const saved = localStorage.getItem('projectsSidebarLocked');
    return saved ? JSON.parse(saved) : false;
  });
  const [projectsSortOrder, setProjectsSortOrder] = useState<'latest' | 'earliest'>('latest');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  const timePeriodHeaders = {
    D: "Today's Revenue",
    W: "Week Revenue", 
    M: "Month Revenue",
    Q: "Quarter Revenue",
    Y: "Year Revenue"
  };

  const goalPeriodLabels = {
    D: "daily",
    W: "weekly", 
    M: "monthly",
    Q: "quarterly",
    Y: "yearly"
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

  // Close Live Revenue popover on outside click
  useEffect(() => {
    if (!isLiveRevenuePopoverOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Don't close if clicking on the money button or inside the popover
      if (
        (liveRevenuePopoverRef.current && liveRevenuePopoverRef.current.contains(target)) ||
        (liveRevenueButtonRef.current && liveRevenueButtonRef.current.contains(target))
      ) {
        return;
      }
      
      setIsLiveRevenuePopoverOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLiveRevenuePopoverOpen]);

  // Close Projects sidebar on outside click
  useEffect(() => {
    if (!isProjectsSidebarOpen || isProjectsSidebarLocked) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Don't close if clicking inside the projects sidebar
      if (projectsSidebarRef.current && projectsSidebarRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on the "more" button in the main sidebar
      const moreButton = target as Element;
      if (moreButton.closest && moreButton.closest('[data-projects-more-button]')) {
        return;
      }
      
      setIsProjectsSidebarOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectsSidebarOpen, isProjectsSidebarLocked]);

  // Auto-open projects sidebar if it was previously locked
  useEffect(() => {
    if (isProjectsSidebarLocked) {
      setIsProjectsSidebarOpen(true);
    }
  }, [isProjectsSidebarLocked]);

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

  // Function to update projects sidebar locked state and persist to localStorage
  const setProjectsSidebarLockedWithPersistence = (value: boolean) => {
    setIsProjectsSidebarLocked(value);
    localStorage.setItem('projectsSidebarLocked', JSON.stringify(value));
  };

  // Mock projects data
  const allProjects = [
    { id: 1, name: 'Kitchen Renovation', client: 'Miller Residence', progress: 75, status: 'active' },
    { id: 2, name: 'HVAC Install', client: 'Johnson Home', progress: 45, status: 'active' },
    { id: 3, name: 'Office Buildout', client: 'Tech Startup Inc.', progress: 65, status: 'in-progress' },
    { id: 4, name: 'Bathroom Remodel', client: 'Smith Family', progress: 90, status: 'active' },
    { id: 5, name: 'Deck Construction', client: 'Brown Residence', progress: 30, status: 'in-progress' },
    { id: 6, name: 'Electrical Upgrade', client: 'Davis Home', progress: 85, status: 'active' },
    { id: 7, name: 'Flooring Installation', client: 'Wilson House', progress: 55, status: 'in-progress' },
    { id: 8, name: 'Roof Repair', client: 'Anderson Property', progress: 100, status: 'completed' },
    { id: 9, name: 'Plumbing Overhaul', client: 'Taylor Residence', progress: 20, status: 'in-progress' },
    { id: 10, name: 'Garage Addition', client: 'Martinez Home', progress: 40, status: 'in-progress' },
    { id: 11, name: 'Basement Finishing', client: 'Thompson House', progress: 60, status: 'active' },
    { id: 12, name: 'Driveway Paving', client: 'Roberts Property', progress: 80, status: 'active' },
    { id: 13, name: 'Window Replacement', client: 'Garcia Residence', progress: 35, status: 'in-progress' },
    { id: 14, name: 'Siding Installation', client: 'Lee Family', progress: 70, status: 'active' },
    { id: 15, name: 'Pool Installation', client: 'White Estate', progress: 25, status: 'in-progress' },
    { id: 16, name: 'Fence Construction', client: 'Clark Property', progress: 95, status: 'active' },
    { id: 17, name: 'Patio Addition', client: 'Young Residence', progress: 50, status: 'in-progress' },
    { id: 18, name: 'Insulation Upgrade', client: 'Hall Home', progress: 15, status: 'in-progress' },
    { id: 19, name: 'Tile Installation', client: 'King Family', progress: 85, status: 'active' },
    { id: 20, name: 'Painting Project', client: 'Scott Residence', progress: 100, status: 'completed' },
    { id: 21, name: 'Landscaping Design', client: 'Green Property', progress: 40, status: 'in-progress' },
    { id: 22, name: 'Concrete Driveway', client: 'Blue Estate', progress: 65, status: 'active' },
    { id: 23, name: 'Shed Construction', client: 'Red Residence', progress: 30, status: 'in-progress' },
    { id: 24, name: 'Gutter Installation', client: 'Orange Home', progress: 90, status: 'active' },
    { id: 25, name: 'Chimney Repair', client: 'Purple Property', progress: 55, status: 'in-progress' },
  ];

  // Filter projects based on search
  const filteredProjects = allProjects.filter(project => 
    project.name.toLowerCase().includes(projectsSearch.toLowerCase()) ||
    project.client.toLowerCase().includes(projectsSearch.toLowerCase())
  );

  // Sort projects based on sort order
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (projectsSortOrder === 'latest') {
      return b.id - a.id; // Higher ID = more recent
    } else {
      return a.id - b.id; // Lower ID = older
    }
  });

  // Close dropdown menus on outside click
  useEffect(() => {
    if (!openDropdownId) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Check if click is outside all dropdown menus
      const isOutsideDropdown = Object.values(dropdownRefs.current).every(ref => 
        !ref || !ref.contains(target)
      );
      
      if (isOutsideDropdown) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

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

          {/* Create button - always visible, more prominent after removing search */}
          <div className={`${isSidebarCollapsed ? 'px-1 py-2' : 'px-2 py-2'} border-b border-[#333333] relative`}>
            <div className={`w-full ${isSidebarCollapsed ? 'space-y-2' : 'space-y-1'}`}>
              <button
                ref={createButtonRef}
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className={`w-full text-[#9E9E9E] font-bold py-1.5 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-3 justify-between'} flex items-center hover:text-white transition-colors`}
                aria-expanded={isCreateMenuOpen}
                aria-haspopup="true"
                id="create-button"
                title={isSidebarCollapsed ? "Create New Item" : ""}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-5 h-5 rounded-[2px] bg-[#336699] flex items-center justify-center mr-0">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                  {!isSidebarCollapsed && <span className="font-normal text-base uppercase tracking-wide ml-3">Create</span>}
                </div>
              </button>
              
              {/* Subtle divider - only show when expanded */}
              {!isSidebarCollapsed && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#333333] to-transparent"></div>
              )}
              
              <button
                onClick={() => navigate('/chat')}
                className={`w-full text-[#9E9E9E] font-bold py-1.5 ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-3 justify-between'} flex items-center hover:text-white transition-colors`}
                title={isSidebarCollapsed ? "AI Advisor" : ""}
              >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="w-5 h-5 rounded-full border border-[#9E9E9E] flex items-center justify-center mr-0">
                    <span className="text-xs">💬</span>
                  </div>
                  {!isSidebarCollapsed && <span className="font-normal text-base uppercase tracking-wide ml-3">ADVISOR</span>}
                </div>
                {!isSidebarCollapsed && <ChevronRight className="w-4 h-4 text-[#9E9E9E]" />}
              </button>
            </div>
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

          {/* Recent Projects Section */}
          {!isSidebarCollapsed && (
            <div className="pt-2">
              {/* Projects without padding */}
              <div className="mb-2">
                <div className="space-y-0">
                  {/* Kitchen Renovation Row */}
                  <button 
                    onClick={() => navigate('/projects/1')}
                    className="w-full flex items-center justify-between px-1.5 py-2 hover:bg-[#2A2A2A] transition-colors group"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-white text-xs font-medium truncate group-hover:text-[#336699] transition-colors leading-tight">Kitchen Renovation</span>
                </div>
                    <span className="text-[#6b7280] text-xs font-medium leading-tight">75%</span>
                  </button>
                  {/* Divider */}
                  <div className="w-full h-px bg-[#333333]"></div>

                  {/* HVAC Install Row */}
                  <button 
                    onClick={() => navigate('/projects/2')}
                    className="w-full flex items-center justify-between px-1.5 py-2 hover:bg-[#2A2A2A] transition-colors group"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-white text-xs font-medium truncate group-hover:text-[#336699] transition-colors leading-tight">HVAC Install</span>
                  </div>
                    <span className="text-[#6b7280] text-xs font-medium leading-tight">45%</span>
                  </button>
                </div>
                  </div>
                  
              {/* Divider after projects - extends full width */}
              <div className="w-full h-px bg-[#333333]"></div>
              
              {/* View All Projects Link with padding */}
              <div className="px-2 pb-2">
                <div className="mt-3">
                  <button 
                    data-projects-more-button
                    onClick={() => {
                      // Only allow toggle if sidebar is not locked
                      if (!isProjectsSidebarLocked) {
                        if (isProjectsSidebarOpen) {
                          // If sidebar is open, close it
                          setIsProjectsSidebarOpen(false);
                        } else {
                          // If sidebar is closed, open it
                          setIsProjectsSidebarOpen(true);
                        }
                      }
                    }}
                    className={`${isProjectsSidebarLocked ? 'text-[#F9D71C]' : 'text-[#336699]'} text-[10px] font-medium hover:text-white transition-colors flex items-center uppercase tracking-wide ${isProjectsSidebarLocked ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {isProjectsSidebarOpen && !isProjectsSidebarLocked ? (
                      <span className="flex items-center">×</span>
                    ) : (
                      <span className="flex items-center">⋮⋮</span>
                    )}
                    <span className="ml-1">{isProjectsSidebarLocked ? 'locked' : (isProjectsSidebarOpen ? 'close' : 'more')}</span>
                    <ChevronRight className={`w-2.5 h-2.5 ml-1 transition-transform ${isProjectsSidebarOpen && !isProjectsSidebarLocked ? 'rotate-90' : ''}`} />
                    {isProjectsSidebarLocked && (
                      <svg className="w-2.5 h-2.5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
                </div>
                
          <div className="mt-auto">
          {/* Live Revenue - visible in both expanded and collapsed states */}
          <div className="p-2">
            {!isSidebarCollapsed ? (
              <div className="bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md p-2.5 rounded-[2px] border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)]">
                {/* Header */}
                <div className="mb-2">
                  <h3 className="text-white/90 text-[10px] font-medium mb-1.5 uppercase tracking-wide">{timePeriodHeaders[selectedTimePeriod]}</h3>
                  
                  {/* Main Revenue Amount */}
                  <div className="text-white text-base font-bold mb-1.5 leading-tight">
                    ${currentData.revenue.toLocaleString()}
                </div>
                
                  {/* Time Period Selector */}
                  <div className="flex items-center justify-start space-x-1 mb-3">
                    {(['D', 'W', 'M', 'Q', 'Y'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedTimePeriod(period)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                          selectedTimePeriod === period
                            ? 'bg-[#336699] text-white border border-[#336699]'
                            : 'bg-white/10 text-white/70 hover:bg-white/15'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
            </div>
                
                {/* Stats Row */}
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <div className="flex items-center text-green-300">
                    <span className="mr-1">↗</span>
                    <span>up 12% • Profit: ${currentData.profit.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-1.5">
                  <div className="w-full bg-white/20 rounded-full h-1">
                    <div 
                      className="bg-[#336699] h-1 rounded-full transition-all duration-300" 
                      style={{width: `${currentData.percentage}%`}}
                    ></div>
                  </div>
                </div>
                
                {/* Goal Progress */}
                <div className="text-center">
                  <span className="text-white/90 text-[10px] leading-tight">{currentData.percentage}% of {goalPeriodLabels[selectedTimePeriod]} goal (${(currentData.revenue / (currentData.percentage / 100)).toLocaleString()})</span>
                    </div>
                  </div>
            ) : (
              /* Collapsed state - just dollar sign with popover */
              <div className="relative">
                <div 
                  ref={liveRevenueButtonRef}
                  onClick={() => setIsLiveRevenuePopoverOpen(!isLiveRevenuePopoverOpen)}
                  className="w-7 h-7 bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md rounded-[2px] border border-[#336699]/50 cursor-pointer hover:from-[#336699]/30 hover:to-[#336699]/10 transition-all duration-200 flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(51,102,153,0.15)]"
                  title={`${timePeriodLabels[selectedTimePeriod]} Revenue: $${currentData.revenue.toLocaleString()}`}
                >
                  <span className="text-white text-base font-bold">$</span>
              </div>
            </div>
          )}
          </div>

          {/* Combined User Info */}
          <div className="relative border-t border-gray-700">
            {/* Dropdown Menu - positioned absolutely above user info */}
            {isProfileMenuOpen && (
              <div className={`absolute bottom-full ${isSidebarCollapsed ? 'left-0 w-64' : 'left-0 right-0'} mb-1 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg overflow-hidden z-50`}>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                >
                  <User className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                  <span className="font-['Roboto']">Profile Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/company-settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                >
                  <Building className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                  <span className="font-['Roboto']">Company Settings</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate('/billing');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                >
                  <CreditCard className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                  <span className="font-['Roboto']">Billing & Plan</span>
                </button>
                
                <div className="border-t border-[#333333]" />
                
                <button
                  onClick={() => {
                    setShowHelpModal(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-[#336699] hover:bg-[#333333] transition-colors duration-200"
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-[#336699]" />
                  <span className="font-['Roboto']">Help & Tutorials</span>
                </button>
                
                <div className="border-t border-[#333333]" />
                
                <button
                  onClick={() => {
                    signOut();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                  <span className="font-['Roboto']">Sign Out</span>
                </button>
              </div>
            )}

            <div className="p-4 flex items-center">
              {/* User Info - only when sidebar expanded */}
              {!isSidebarCollapsed && (
                <div className="flex items-center flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                      Admin • Pro Plan
                  </p>
                </div>
              </div>
              )}

              {/* Profile Menu Button */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`${isSidebarCollapsed ? 'w-full' : 'ml-3'} flex items-center justify-center w-8 h-8 rounded-full bg-[#336699] text-white hover:bg-[#2A5580] transition-colors`}
              >
                <span className="text-sm font-medium">
                  {(user?.user_metadata?.full_name || 'User').charAt(0).toUpperCase()}
                </span>
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
        <div className={`flex-1 ${isSidebarCollapsed ? 'md:ml-14' : 'md:ml-48'} ${isProjectsSidebarLocked ? (isSidebarCollapsed ? 'md:ml-[calc(3.5rem+20rem)]' : 'md:ml-[calc(12rem+20rem)]') : ''} px-0 bg-[#121212] transition-all duration-300`}>
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
                        navigate('/profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                    >
                      <User className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                      <span className="font-['Roboto']">Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/company-settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                    >
                      <Building className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                      <span className="font-['Roboto']">Company Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/billing');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                    >
                      <CreditCard className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                      <span className="font-['Roboto']">Billing & Plan</span>
                    </button>
                    
                    <div className="border-t border-[#333333]" />
                    
                    <button
                      onClick={() => {
                        setShowHelpModal(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-[#336699] hover:bg-[#333333] transition-colors duration-200"
                    >
                      <HelpCircle className="w-4 h-4 mr-3 text-[#336699]" />
                      <span className="font-['Roboto']">Help & Tutorials</span>
                    </button>
                    
                    <div className="border-t border-[#333333]" />
                    
                    <button
                      onClick={() => {
                        signOut();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                      <span className="font-['Roboto']">Sign Out</span>
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
                        Admin • Pro Plan
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

        {/* Live Revenue Popover - positioned outside sidebar to avoid clipping */}
        {isLiveRevenuePopoverOpen && (
          <div 
            ref={liveRevenuePopoverRef}
            className="fixed left-16 top-96 w-64 bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md rounded-lg border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)] z-[10000] p-4"
            style={{ 
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div className="mb-3">
              <h3 className="text-white/90 text-sm font-medium mb-3">{timePeriodHeaders[selectedTimePeriod]}</h3>
              
              {/* Main Revenue Amount */}
              <div className="text-white text-2xl font-bold mb-2">
                ${currentData.revenue.toLocaleString()}
              </div>
              
              {/* Time Period Selector */}
              <div className="flex items-center justify-start space-x-1 mb-3">
                {(['D', 'W', 'M', 'Q', 'Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimePeriod(period)}
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                      selectedTimePeriod === period
                        ? 'bg-[#336699] text-white border border-[#336699]'
                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center text-green-300">
                <span className="mr-1">↗</span>
                <span>up 12% • Profit: ${currentData.profit.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-[#336699] h-2 rounded-full transition-all duration-300" 
                  style={{width: `${currentData.percentage}%`}}
                ></div>
              </div>
            </div>

            {/* Goal Progress */}
            <div className="text-center">
              <span className="text-white/90 text-sm">{currentData.percentage}% of {goalPeriodLabels[selectedTimePeriod]} goal (${(currentData.revenue / (currentData.percentage / 100)).toLocaleString()})</span>
            </div>
          </div>
        )}

        {/* Secondary Projects Sidebar */}
        {(isProjectsSidebarOpen || isProjectsSidebarLocked) && (
          <div className={`fixed inset-0 z-[9998] ${isProjectsSidebarLocked ? 'pointer-events-none' : ''}`}>
            {/* Backdrop - only show when not locked */}
            {!isProjectsSidebarLocked && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsProjectsSidebarOpen(false)}
              />
            )}
            
            {/* Projects Sidebar */}
            <div 
              ref={projectsSidebarRef}
              className={`fixed top-0 ${isSidebarCollapsed ? 'left-14' : 'left-48'} w-80 h-full bg-[#1A1A1A] border-r border-gray-700 shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto z-[9999]`}
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white text-base font-medium">All Projects</h2>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        navigate('/projects/new');
                        if (!isProjectsSidebarLocked) {
                          setIsProjectsSidebarOpen(false);
                        }
                      }}
                      className="w-7 h-7 bg-[#336699] hover:bg-[#2A5580] text-white rounded-[2px] flex items-center justify-center transition-colors"
                      title="New Project"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setProjectsSortOrder(projectsSortOrder === 'latest' ? 'earliest' : 'latest')}
                      className="w-7 h-7 bg-[#333333] hover:bg-[#404040] text-gray-400 hover:text-white rounded-[2px] flex items-center justify-center transition-colors"
                      title={projectsSortOrder === 'latest' ? "Sort by earliest first" : "Sort by latest first"}
                    >
                      {projectsSortOrder === 'latest' ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 15l4 4 4-4m0-6l-4-4-4 4" />
                        </svg>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        if (isProjectsSidebarLocked) {
                          // When unlocking, close the sidebar immediately
                          setProjectsSidebarLockedWithPersistence(false);
                          setIsProjectsSidebarOpen(false);
                        } else {
                          // When locking, keep it open and lock it
                          setProjectsSidebarLockedWithPersistence(true);
                        }
                      }}
                      className={`w-7 h-7 ${isProjectsSidebarLocked ? 'bg-[#F9D71C] text-[#121212]' : 'bg-[#333333] text-gray-400'} hover:bg-[#F9D71C] hover:text-[#121212] rounded-[2px] flex items-center justify-center transition-colors`}
                      title={isProjectsSidebarLocked ? "Unlock and close projects pane" : "Lock projects pane open"}
                    >
                      {isProjectsSidebarLocked ? (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a project..."
                    value={projectsSearch}
                    onChange={(e) => setProjectsSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#2A2A2A] border border-[#404040] rounded-[2px] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#336699] transition-colors"
                  />
                </div>
              </div>

              {/* Projects List - Scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-0">
                  {sortedProjects.map((project, index) => (
                    <div key={project.id} className="relative">
                      <button
                        onClick={() => {
                          navigate(`/projects/${project.id}`);
                          if (!isProjectsSidebarLocked) {
                            setIsProjectsSidebarOpen(false);
                          }
                        }}
                        className={`w-full text-left p-3 hover:bg-[#333333] transition-colors border-b border-gray-700/30 group ${index === sortedProjects.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-0.5">
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${
                                project.status === 'completed' ? 'bg-green-500' :
                                project.status === 'active' ? 'bg-green-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <span className="text-white text-xs font-medium truncate leading-tight">{project.name}</span>
                            </div>
                            <div className="text-gray-400 text-[10px] truncate ml-3.5 leading-tight uppercase tracking-wide">{project.client}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#6b7280] text-xs font-medium leading-tight">{project.progress}%</span>
                            
                            {/* Action buttons - only show on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dropdownId = `project-${project.id}`;
                                    setOpenDropdownId(openDropdownId === dropdownId ? null : dropdownId);
                                  }}
                                  className="w-4 h-4 flex items-center justify-center rounded hover:bg-[#336699] transition-colors"
                                  title="More options"
                                >
                                  <svg className="w-3 h-3 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                                
                                {/* Dropdown Menu */}
                                {openDropdownId === `project-${project.id}` && (
                                  <div 
                                    ref={(el) => dropdownRefs.current[`project-${project.id}`] = el}
                                    className="absolute right-0 top-full mt-1 w-48 bg-[#2A2A2A] border border-[#404040] rounded-[4px] shadow-lg z-[10001] py-1"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/projects/${project.id}/edit`);
                                        setOpenDropdownId(null);
                                        if (!isProjectsSidebarLocked) {
                                          setIsProjectsSidebarOpen(false);
                                        }
                                      }}
                                      className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Edit Project
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Add note to ${project.name}`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                      </svg>
                                      Add Note
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`View timeline for ${project.name}`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      View Timeline
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`View photos for ${project.name}`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      View Photos
                                    </button>
                                    <div className="border-t border-[#404040] my-1"></div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Create invoice for ${project.name}`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Create Invoice
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Generate estimate for ${project.name}`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                      Generate Estimate
                                    </button>
                                    <div className="border-t border-[#404040] my-1"></div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Mark ${project.name} as complete`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-green-400 text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                      Mark Complete
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`Archive ${project.name}`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-yellow-400 text-xs hover:bg-[#336699] transition-colors flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l6 6 6-6" />
                                      </svg>
                                      Archive Project
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                  
                  {sortedProjects.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-gray-400 text-xs">No projects found</div>
                      <div className="text-gray-500 text-[10px] mt-1">Try adjusting your search</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help & Tutorials Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowHelpModal(false)} />
            <div className="relative bg-[#1E1E1E] rounded-[4px] shadow-xl border border-[#333333] w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#333333]">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Help & Tutorials</h2>
                  <p className="text-gray-400">Learn how to use each section of your construction business app</p>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Quick Access Section */}
                <div className="mb-8">
                  <h3 className="text-white font-bold mb-4">
                    Quick Start Tutorials
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Clients Tutorial */}
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040] hover:border-[#336699] transition-colors cursor-pointer"
                         onClick={() => {
                           setShowHelpModal(false);
                           navigate('/clients?tutorial=true');
                         }}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#336699] rounded-[4px] flex items-center justify-center mr-3">
                          <span className="text-base">👤</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Client Management</h4>
                          <p className="text-gray-400 text-sm">3 min tutorial</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Learn how to add clients, track their project history, and manage relationships.
                      </p>
                      <div className="flex items-center text-[#336699] text-sm font-medium">
                        <span>Start Tutorial</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>

                    {/* Projects Tutorial */}
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040] hover:border-[#336699] transition-colors cursor-pointer"
                         onClick={() => {
                           setShowHelpModal(false);
                           navigate('/projects?tutorial=true');
                         }}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#336699] rounded-[4px] flex items-center justify-center mr-3">
                          <span className="text-base">📁</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Project Management</h4>
                          <p className="text-gray-400 text-sm">4 min tutorial</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Create projects, track progress, manage budgets, and keep everything organized.
                      </p>
                      <div className="flex items-center text-[#336699] text-sm font-medium">
                        <span>Start Tutorial</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>

                    {/* Invoices Tutorial */}
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040] hover:border-[#336699] transition-colors cursor-pointer"
                         onClick={() => {
                           setShowHelpModal(false);
                           navigate('/invoices?tutorial=true');
                         }}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#336699] rounded-[4px] flex items-center justify-center mr-3">
                          <span className="text-base">📄</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Invoice Management</h4>
                          <p className="text-gray-400 text-sm">5 min tutorial</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Create professional invoices, track payments, and manage your cash flow.
                      </p>
                      <div className="flex items-center text-[#336699] text-sm font-medium">
                        <span>Start Tutorial</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>

                    {/* Products Tutorial */}
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040] hover:border-[#336699] transition-colors cursor-pointer"
                         onClick={() => {
                           setShowHelpModal(false);
                           navigate('/products?tutorial=true');
                         }}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#336699] rounded-[4px] flex items-center justify-center mr-3">
                          <span className="text-base">📦</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Product Catalog</h4>
                          <p className="text-gray-400 text-sm">6 min tutorial</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Build your product catalog with materials, labor, and services.
                      </p>
                      <div className="flex items-center text-[#336699] text-sm font-medium">
                        <span>Start Tutorial</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>

                    {/* Price Book Tutorial */}
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040] hover:border-[#336699] transition-colors cursor-pointer"
                         onClick={() => {
                           setShowHelpModal(false);
                           navigate('/price-book?tutorial=true');
                         }}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#336699] rounded-[4px] flex items-center justify-center mr-3">
                          <span className="text-base">📘</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Price Book</h4>
                          <p className="text-gray-400 text-sm">7 min tutorial</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Build your competitive advantage with a comprehensive price book.
                      </p>
                      <div className="flex items-center text-[#336699] text-sm font-medium">
                        <span>Start Tutorial</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>

                    {/* Complete Walkthrough */}
                    <div className="bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 rounded-[4px] p-4 border border-[#336699]/50 cursor-pointer"
                         onClick={() => {
                           setShowHelpModal(false);
                           navigate('/clients?tutorial=true');
                         }}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-[#F9D71C] rounded-[4px] flex items-center justify-center mr-3">
                          <span className="text-base">⠿</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Complete Walkthrough</h4>
                          <p className="text-gray-400 text-sm">15 min full tour</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Take a complete tour through all features and see how they work together.
                      </p>
                      <div className="flex items-center text-[#F9D71C] text-sm font-medium">
                        <span>Start Full Tour</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className="mb-8">
                  <h3 className="text-white font-bold mb-4 flex items-center">
                    <span className="text-[#336699] mr-2">📚</span>
                    Additional Resources
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040]">
                      <h4 className="text-white font-medium mb-2">Video Library</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Access our complete library of construction business tutorials and best practices.
                      </p>
                      <button className="text-[#336699] text-sm font-medium hover:text-white transition-colors">
                        Browse Videos →
                      </button>
                    </div>
                    
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040]">
                      <h4 className="text-white font-medium mb-2">Knowledge Base</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Find answers to common questions and detailed feature documentation.
                      </p>
                      <button className="text-[#336699] text-sm font-medium hover:text-white transition-colors">
                        Search Articles →
                      </button>
                    </div>
                    
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040]">
                      <h4 className="text-white font-medium mb-2">Live Support</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Get help from our construction industry experts via chat or phone.
                      </p>
                      <button className="text-[#336699] text-sm font-medium hover:text-white transition-colors">
                        Contact Support →
                      </button>
                    </div>
                    
                    <div className="bg-[#333333] rounded-[4px] p-4 border border-[#404040]">
                      <h4 className="text-white font-medium mb-2">Community Forum</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Connect with other contractors and share tips and best practices.
                      </p>
                      <button className="text-[#336699] text-sm font-medium hover:text-white transition-colors">
                        Join Discussion →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reset Options */}
                <div className="bg-[#1E1E1E] rounded-[4px] p-4 border border-[#333333]">
                  <h3 className="text-white font-bold mb-3 flex items-center">
                    <span className="text-[#9E9E9E] mr-2">🔄</span>
                    Reset Tutorials
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Want to see the onboarding tutorials again? You can reset them to show up on each page.
                  </p>
                  <button 
                    onClick={() => {
                      // Reset tutorial flags in localStorage
                      localStorage.removeItem('clientsOnboardingCompleted');
                      localStorage.removeItem('projectsOnboardingCompleted');
                      localStorage.removeItem('invoicesOnboardingCompleted');
                      localStorage.removeItem('productsOnboardingCompleted');
                      localStorage.removeItem('priceBookOnboardingCompleted');
                      setShowHelpModal(false);
                      // Show success message or reload page
                      window.location.reload();
                    }}
                    className="bg-[#336699] text-white px-4 py-2 rounded-[4px] hover:bg-[#2A5580] transition-colors font-medium"
                  >
                    Reset All Tutorials
                  </button>
                </div>
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