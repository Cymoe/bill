import React, { useState, useEffect, useRef, createContext } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
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
import { Sidebar } from './Sidebar';
import ChatManagementSystem from '../../pages/chat/ChatManagementSystem';
import { MobileHeader } from './MobileHeader';
import { MobileMenu } from './MobileMenu';
import { MobileCreateMenu } from './MobileCreateMenu';

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
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(() => {
    const saved = localStorage.getItem('chatPanelOpen');
    return saved !== null ? JSON.parse(saved) : true; // Default to open
  });
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false);
  const [showLineItemDrawer, setShowLineItemDrawer] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [selectedIndustry, setSelectedIndustry] = useState('All Trades');
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [isProjectsSidebarOpen, setIsProjectsSidebarOpen] = useState(false);
  const [isProjectsSidebarLocked, setIsProjectsSidebarLocked] = useState(() => {
    const saved = localStorage.getItem('projectsSidebarLocked');
    return saved ? JSON.parse(saved) : false;
  });
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'D' | 'W' | 'M' | 'Q' | 'Y'>('D');
  const [isLiveRevenuePopoverOpen, setIsLiveRevenuePopoverOpen] = useState(false);
  const liveRevenueButtonRef = useRef<HTMLDivElement>(null);
  const liveRevenuePopoverRef = useRef<HTMLDivElement>(null);
  const projectsSidebarRef = useRef<HTMLDivElement>(null);
  const [projectsSearch, setProjectsSearch] = useState('');
  const [projectsSortOrder, setProjectsSortOrder] = useState<'latest' | 'earliest'>('latest');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/clients')) return 'Clients';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/invoices')) return 'Invoices';
    if (path.startsWith('/products')) return 'Products';
    if (path.startsWith('/price-book')) return 'Price Book';
    return 'Dashboard';
  };

  // Mock organizations
  const mockOrgs = [
    { id: 'org1', name: 'Acme Construction', industry: 'New Construction' },
    { id: 'org2', name: 'Remodel Pros', industry: 'Remodelers' },
    { id: 'org3', name: 'Service Kings', industry: 'Service' },
    { id: 'org4', name: 'Luxury Estates', industry: 'Luxury Villas' },
  ];
  const [selectedOrg, setSelectedOrg] = useState(mockOrgs[0]);
  
  // Mock data for different time periods
  const moneyPulseData = {
    D: { revenue: 24500, profit: 7623, goal: 33500, percentage: 73 },
    W: { revenue: 127800, profit: 38340, goal: 150000, percentage: 85 },
    M: { revenue: 485200, profit: 145560, goal: 500000, percentage: 97 },
    Q: { revenue: 1425600, profit: 427680, goal: 1500000, percentage: 95 },
    Y: { revenue: 5234800, profit: 1570440, goal: 6000000, percentage: 87 }
  };

  const currentData = moneyPulseData[selectedTimePeriod];
  const timePeriodHeaders = {
    D: "Today's Revenue",
    W: "Week Revenue", 
    M: "Month Revenue",
    Q: "Quarter Revenue",
    Y: "Year Revenue"
  };

  const timePeriodLabels = {
    D: "Today's",
    W: "This Week's", 
    M: "This Month's",
    Q: "This Quarter's",
    Y: "This Year's"
  };

  const goalPeriodLabels = {
    D: "daily",
    W: "weekly", 
    M: "monthly",
    Q: "quarterly",
    Y: "yearly"
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

  // Function to cycle to next time period
  const cycleTimePeriod = () => {
    const periods: Array<'D' | 'W' | 'M' | 'Q' | 'Y'> = ['D', 'W', 'M', 'Q', 'Y'];
    const currentIndex = periods.indexOf(selectedTimePeriod);
    const nextIndex = (currentIndex + 1) % periods.length;
    setSelectedTimePeriod(periods[nextIndex]);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  // Keyboard shortcut for toggling chat panel (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        toggleChatPanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChatPanelOpen]);

  // Auto-collapse main sidebar when both chat and projects are open
  useEffect(() => {
    if (isChatPanelOpen && isProjectsSidebarLocked && !isSidebarCollapsed) {
      setSidebarCollapsedWithLogging(true);
    }
  }, [isChatPanelOpen, isProjectsSidebarLocked]);

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

  // Function to toggle chat panel with persistence
  const toggleChatPanel = () => {
    const newState = !isChatPanelOpen;
    setIsChatPanelOpen(newState);
    localStorage.setItem('chatPanelOpen', JSON.stringify(newState));
  };

  // Calculate available content width
  const calculateContentClass = () => {
    // Base classes
    let classes = 'flex-1 transition-all duration-300 pt-14 md:pt-0 pb-16 md:pb-0';
    
    // Add left margin when chat is open
    if (isChatPanelOpen) {
      classes += ' md:ml-[25rem]'; // 12 (chat toggle) + 384px (chat panel) = 400px
    } else {
      classes += ' md:ml-12'; // Just the chat toggle button width
    }
    
    // Add right margin based on sidebar state
    if (isSidebarCollapsed) {
      classes += isProjectsSidebarLocked ? ' md:mr-[22rem]' : ' md:mr-14';
    } else {
      classes += isProjectsSidebarLocked ? ' md:mr-[32rem]' : ' md:mr-48';
    }
    
    return classes;
  };

  return (
    <MobileCreateMenuContext.Provider value={{ isCreateMenuOpen, setIsCreateMenuOpen }}>
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
    <IndustryContext.Provider value={{ selectedIndustry, setSelectedIndustry }}>
      <div className="min-h-screen bg-[#121212] flex">
        {/* Mobile Header */}
        <MobileHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onChatClick={toggleChatPanel}
          onCreateClick={() => setIsCreateMenuOpen(true)}
          isChatOpen={isChatPanelOpen}
          title={getPageTitle()}
        />

        {/* Chat Toggle Button - Always visible on desktop */}
        <div className="hidden md:flex fixed left-0 top-0 z-[9997] flex-col items-center justify-center w-12 h-screen bg-[#1A1A1A] border-r border-gray-700">
                  <button
            onClick={toggleChatPanel}
            className={`relative w-10 h-10 ${isChatPanelOpen ? 'bg-[#336699]' : 'bg-[#2A2A2A]'} hover:bg-[#336699] rounded-[4px] flex items-center justify-center transition-all duration-200 group`}
            title={isChatPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <MessageSquare className={`h-5 w-5 ${isChatPanelOpen ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
            {/* Notification dot when closed */}
            {!isChatPanelOpen && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#F9D71C] rounded-full animate-pulse"></div>
            )}
              </button>
              
          {/* Vertical text label */}
          <div className="mt-4 writing-mode-vertical text-[10px] text-gray-500 uppercase tracking-wider select-none">
            AI Chat
            </div>
            </div>
            
        {/* AI Chat Panel - Collapsible on desktop */}
        <div className={`hidden md:flex fixed left-12 top-0 z-[9996] h-screen ${isChatPanelOpen ? 'w-96' : 'w-0'} transition-all duration-300 border-r border-gray-700 bg-[#1A1A1A]`}>
          <div className="w-full h-full overflow-hidden">
            {isChatPanelOpen && <ChatManagementSystem />}
                    </div>
                  </div>
                  
        {/* Main Content Area */}
        <div className={calculateContentClass()}>
            {children}
        </div>

        {/* Sidebar Component - moved to right */}
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setSidebarCollapsedWithLogging={setSidebarCollapsedWithLogging}
          isCreateMenuOpen={isCreateMenuOpen}
          setIsCreateMenuOpen={setIsCreateMenuOpen}
          createButtonRef={createButtonRef}
          createDropdownRef={createDropdownRef}
          orgDropdownOpen={orgDropdownOpen}
          setOrgDropdownOpen={setOrgDropdownOpen}
          selectedOrg={selectedOrg}
          setSelectedOrg={setSelectedOrg}
          mockOrgs={mockOrgs}
          setShowLineItemDrawer={setShowLineItemDrawer}
          setShowNewClientModal={setShowNewClientModal}
          setShowNewInvoiceDrawer={setShowNewInvoiceDrawer}
          isProjectsSidebarOpen={isProjectsSidebarOpen}
          setIsProjectsSidebarOpen={setIsProjectsSidebarOpen}
          isProjectsSidebarLocked={isProjectsSidebarLocked}
          setProjectsSidebarLockedWithPersistence={setProjectsSidebarLockedWithPersistence}
          selectedTimePeriod={selectedTimePeriod}
          setSelectedTimePeriod={setSelectedTimePeriod}
          currentData={currentData}
          timePeriodHeaders={timePeriodHeaders}
          isLiveRevenuePopoverOpen={isLiveRevenuePopoverOpen}
          setIsLiveRevenuePopoverOpen={setIsLiveRevenuePopoverOpen}
          liveRevenueButtonRef={liveRevenueButtonRef}
          isProfileMenuOpen={isProfileMenuOpen}
          setIsProfileMenuOpen={setIsProfileMenuOpen}
          setShowHelpModal={setShowHelpModal}
        />

        {/* Live Revenue Popover - positioned outside sidebar to avoid clipping */}
        {isLiveRevenuePopoverOpen && (
          <div 
            ref={liveRevenuePopoverRef}
            className={`fixed ${
              isSidebarCollapsed 
                ? isProjectsSidebarLocked ? 'right-[22rem]' : 'right-16' 
                : isProjectsSidebarLocked ? 'right-[32rem]' : 'right-16'
            } top-96 w-64 bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md rounded-lg border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)] z-[10000] p-4`}
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
              className={`fixed top-0 ${isSidebarCollapsed ? 'right-14' : 'right-48'} w-80 h-full bg-[#1A1A1A] border-l border-gray-700 shadow-2xl transition-all duration-300 flex flex-col pointer-events-auto z-[9999]`}
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
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
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
                          setProjectsSidebarLockedWithPersistence(false);
                          setIsProjectsSidebarOpen(false);
                        } else {
                          setProjectsSidebarLockedWithPersistence(true);
                        }
                      }}
                      className={`w-7 h-7 ${isProjectsSidebarLocked ? 'bg-[#F9D71C] text-[#121212]' : 'bg-[#333333] text-gray-400'} hover:bg-[#F9D71C] hover:text-[#121212] rounded-[2px] flex items-center justify-center transition-colors`}
                      title={isProjectsSidebarLocked ? "Unlock and close projects pane" : "Lock projects pane open"}
                    >
                      {isProjectsSidebarLocked ? (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
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

        {/* Modals */}
        {showNewClientModal && (
          <NewClientModal
            onClose={() => setShowNewClientModal(false)}
            onSave={(client) => {
              console.log('New client created:', client);
              setShowNewClientModal(false);
            }}
          />
        )}

        {showNewInvoiceDrawer && (
          <NewInvoiceModal
            onClose={() => setShowNewInvoiceDrawer(false)}
            onSave={(invoice) => {
              console.log('New invoice created:', invoice);
              setShowNewInvoiceDrawer(false);
            }}
          />
        )}

        {showLineItemDrawer && (
          <ProductForm
            title="Create Line Item"
            onClose={() => setShowLineItemDrawer(false)}
            onSubmit={async (data) => {
              console.log('New line item created:', data);
              setShowLineItemDrawer(false);
            }}
            submitLabel="Create Item"
          />
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

        {/* Mobile Menu Drawer */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          selectedOrg={selectedOrg}
          mockOrgs={mockOrgs}
          onOrgChange={setSelectedOrg}
          onShowHelp={() => setShowHelpModal(true)}
        />

        {/* Mobile Create Menu */}
        <MobileCreateMenu
          isOpen={isCreateMenuOpen}
          onClose={() => setIsCreateMenuOpen(false)}
          onCreateClient={() => setShowNewClientModal(true)}
          onCreateInvoice={() => setShowNewInvoiceDrawer(true)}
          onCreateLineItem={() => setShowLineItemDrawer(true)}
        />

        {/* Mobile Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-between items-center bg-[#121212] text-white px-4 py-2 border-t border-[#333333] z-[9999]">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#336699]' : 'text-gray-400'}`
            }
          >
            <span className="text-base">⠿</span>
            <span className="text-xs">Dashboard</span>
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#336699]' : 'text-gray-400'}`
            }
          >
            <span className="text-base">👤</span>
            <span className="text-xs">Clients</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#336699]' : 'text-gray-400'}`
            }
          >
            <span className="text-base">📁</span>
            <span className="text-xs">Projects</span>
          </NavLink>

          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#336699]' : 'text-gray-400'}`
            }
          >
            <span className="text-base">📄</span>
            <span className="text-xs">Invoices</span>
          </NavLink>

          <NavLink
            to="/price-book"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-[#336699]' : 'text-gray-400'}`
            }
          >
            <span className="text-base">📘</span>
            <span className="text-xs">Price Book</span>
          </NavLink>
        </nav>

        {/* Mobile Chat Panel */}
        {isChatPanelOpen && (
          <div className="md:hidden fixed inset-0 z-[10000] bg-[#1A1A1A] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#333333]">
              <h2 className="text-white font-medium text-lg">AI Assistant</h2>
              <button
                onClick={toggleChatPanel}
                className="p-2 bg-[#333333] hover:bg-[#404040] rounded-[4px] transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatManagementSystem />
            </div>
          </div>
        )}
      </div>
    </IndustryContext.Provider>
    </MobileMenuContext.Provider>
    </MobileCreateMenuContext.Provider>
  );
};