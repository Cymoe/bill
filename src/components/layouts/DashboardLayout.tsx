import React, { useState, useEffect, useRef, createContext, useCallback } from 'react';
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
import { CreateInvoiceDrawer } from '../invoices/CreateInvoiceDrawer';
import { useProductDrawer } from '../../contexts/ProductDrawerContext';
import { Sidebar } from './Sidebar';
import ChatManagementSystem from '../../pages/chat/ChatManagementSystem';
import { MobileHeader } from './MobileHeader';
import { MobileMenu } from './MobileMenu';
import { MobileCreateMenu } from './MobileCreateMenu';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { supabase } from '../../lib/supabase';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const IndustryContext = createContext<{ selectedIndustry: string; setSelectedIndustry: (v: string) => void }>({ selectedIndustry: 'All Trades', setSelectedIndustry: () => {} });

// Context for mobile menu state
export const MobileMenuContext = createContext<{ isMobileMenuOpen: boolean; setIsMobileMenuOpen: (v: boolean) => void }>({ isMobileMenuOpen: false, setIsMobileMenuOpen: () => {} });

// Context for mobile create menu state
export const MobileCreateMenuContext = createContext<{ isCreateMenuOpen: boolean; setIsCreateMenuOpen: (v: boolean) => void }>({ isCreateMenuOpen: false, setIsCreateMenuOpen: () => {} });

// Context for layout constraints
export const LayoutContext = createContext<{ 
  isConstrained: boolean; 
  isMinimal: boolean;
  isCompact: boolean;
  isChatOpen: boolean; 
  isProjectsOpen: boolean;
  availableWidth: 'full' | 'constrained' | 'minimal' | 'compact';
}>({ 
  isConstrained: false, 
  isMinimal: false,
  isCompact: false,
  isChatOpen: false, 
  isProjectsOpen: false,
  availableWidth: 'full'
});

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
    return saved ? JSON.parse(saved) : true; // Default to open
  });
  const [chatPanelWidth, setChatPanelWidth] = useState(() => {
    const saved = localStorage.getItem('chatPanelWidth');
    return saved ? parseInt(saved) : 520; // Default to 520px, can be dragged to 780px max
  });
  const [isResizing, setIsResizing] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false);
  const [showLineItemDrawer, setShowLineItemDrawer] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isProjectsSearchExpanded, setIsProjectsSearchExpanded] = useState(false);
  const [projectsSortOrder, setProjectsSortOrder] = useState<'latest' | 'earliest'>('latest');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [availableContentWidth, setAvailableContentWidth] = useState<'full' | 'constrained' | 'minimal' | 'compact'>('full');

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();
    
    const startX = mouseDownEvent.pageX;
    const startWidth = chatPanelWidth;
    let animationId: number;
    
    setIsResizing(true);

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      mouseMoveEvent.preventDefault();
      mouseMoveEvent.stopPropagation();
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      animationId = requestAnimationFrame(() => {
        const currentX = mouseMoveEvent.pageX;
        const diff = currentX - startX;
        // Calculate max width based on viewport to ensure sidebar stays visible
        const viewportWidth = window.innerWidth;
        const reservedSpace = 48 + 350 + (isProjectsSidebarLocked || isProjectsSidebarOpen ? 320 : 0) + (isSidebarCollapsed ? 48 : 192); // chat button + min content + projects + sidebar
        const maxAllowedWidth = Math.max(280, viewportWidth - reservedSpace);
        const newWidth = Math.min(Math.max(280, startWidth + diff), Math.min(780, maxAllowedWidth));
        
        setChatPanelWidth(newWidth);
      });
    }

    function onMouseUp() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      localStorage.setItem('chatPanelWidth', chatPanelWidth.toString());
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [chatPanelWidth]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

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

  const mockOrgs = [
    { id: 'org1', name: 'Acme Construction', industry: 'New Construction' },
    { id: 'org2', name: 'Remodel Pros', industry: 'Remodelers' },
    { id: 'org3', name: 'Service Kings', industry: 'Service' },
    { id: 'org4', name: 'Luxury Estates', industry: 'Luxury Villas' },
  ];
  const [selectedOrg, setSelectedOrg] = useState(mockOrgs[0]);
  
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

  const filteredProjects = allProjects.filter(project => 
    project.name.toLowerCase().includes(projectsSearch.toLowerCase()) ||
    project.client.toLowerCase().includes(projectsSearch.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (projectsSortOrder === 'latest') {
      return b.id - a.id;
    } else {
      return a.id - b.id;
    }
  });

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCreateMenuOpen &&
        createButtonRef.current &&
        !createButtonRef.current.contains(event.target as Node)
      ) {
        setIsCreateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCreateMenuOpen]);

  useEffect(() => {
    if (!isLiveRevenuePopoverOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
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

  useEffect(() => {
    if (!isProjectsSidebarOpen || isProjectsSidebarLocked) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (projectsSidebarRef.current && projectsSidebarRef.current.contains(target)) {
        return;
      }
      
      const moreButton = target as Element;
      if (moreButton.closest && moreButton.closest('[data-projects-more-button]')) {
        return;
      }
      
      setIsProjectsSidebarOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProjectsSidebarOpen, isProjectsSidebarLocked]);

  useEffect(() => {
    if (isProjectsSidebarLocked) {
      setIsProjectsSidebarOpen(true);
    }
  }, [isProjectsSidebarLocked]);

  useEffect(() => {
    if (!openDropdownId) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
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

  useEffect(() => {
    if (isChatPanelOpen && (isProjectsSidebarLocked || isProjectsSidebarOpen) && !isSidebarCollapsed) {
      setSidebarCollapsedWithLogging(true);
    }
  }, [isChatPanelOpen, isProjectsSidebarLocked, isProjectsSidebarOpen]);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const sidebarWidth = isProjectsSidebarOpen ? (isSidebarCollapsed ? 48 : 256) : 48;
    const chatWidth = isChatPanelOpen ? chatPanelWidth : 0;
    const totalWidth = sidebarWidth + chatWidth;

    mainContent.style.marginLeft = `${totalWidth}px`;
  }, [isProjectsSidebarOpen, isSidebarCollapsed, isChatPanelOpen, chatPanelWidth]);

  // Calculate actual available width for content
  const calculateAvailableWidth = useCallback(() => {
    if (typeof window === 'undefined') return 'full';
    
    const viewportWidth = window.innerWidth;
    const leftSpace = isChatPanelOpen ? chatPanelWidth + 48 : 48; // chat panel + button
    const rightSpace = (() => {
      if (isProjectsSidebarLocked || isProjectsSidebarOpen) {
        return isSidebarCollapsed ? 368 : 512; // projects + main sidebar
      }
      return isSidebarCollapsed ? 48 : 192; // just main sidebar
    })();
    
    const availableSpace = viewportWidth - leftSpace - rightSpace;
    
    // Debug logging
    console.log('Layout calculation:', {
      viewportWidth,
      leftSpace,
      rightSpace,
      availableSpace,
      isChatPanelOpen,
      chatPanelWidth,
      isProjectsSidebarLocked,
      isProjectsSidebarOpen,
      isSidebarCollapsed
    });
    
    // Adjusted breakpoints - more aggressive when projects sidebar is open
    const isProjectsOpen = isProjectsSidebarLocked || isProjectsSidebarOpen;
    
    // When projects sidebar is open, be much more conservative with space
    if (isProjectsOpen) {
      if (availableSpace < 700) return 'minimal';      // Switch to minimal sooner when projects open
      if (availableSpace < 900) return 'constrained';  // Cramped when projects open  
      if (availableSpace < 1100) return 'compact';     // Slightly tight when projects open
    } else {
      // Normal breakpoints when projects sidebar is closed
      if (availableSpace < 400) return 'minimal';      // Very cramped
      if (availableSpace < 600) return 'constrained';  // Cramped
      if (availableSpace < 800) return 'compact';      // Slightly tight
    }
    
    // Special case: if both chat and projects are open, be even more conservative
    if (isChatPanelOpen && isProjectsOpen) {
      // When chat is wide (>600px), be extremely conservative
      if (chatPanelWidth > 600) {
        if (availableSpace < 1000) return 'minimal';    // Much more aggressive for wide chat
        if (availableSpace < 1200) return 'constrained';
        if (availableSpace < 1400) return 'compact';
      } else {
        // Normal chat width
        if (availableSpace < 800) return 'minimal';      
        if (availableSpace < 1000) return 'constrained';
        if (availableSpace < 1200) return 'compact';
      }
    }
    
    return 'full';                                   // Full width - show everything
  }, [isChatPanelOpen, chatPanelWidth, isProjectsSidebarLocked, isProjectsSidebarOpen, isSidebarCollapsed]);

  // Update available width when dependencies change
  useEffect(() => {
    const updateWidth = () => {
      setAvailableContentWidth(calculateAvailableWidth());
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, [calculateAvailableWidth]);

  const isConstrained = availableContentWidth === 'constrained' || availableContentWidth === 'minimal';
  const isMinimal = availableContentWidth === 'minimal';
  const isCompact = availableContentWidth === 'compact';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const setSidebarCollapsedWithLogging = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(isSidebarCollapsed) : value;
    console.log('Sidebar state changing:', { from: isSidebarCollapsed, to: newValue, stack: new Error().stack });
    setIsSidebarCollapsed(value);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
  };

  const setProjectsSidebarLockedWithPersistence = (value: boolean) => {
    setIsProjectsSidebarLocked(value);
    localStorage.setItem('projectsSidebarLocked', JSON.stringify(value));
  };

  const toggleChatPanel = () => {
    const newState = !isChatPanelOpen;
    setIsChatPanelOpen(newState);
    localStorage.setItem('chatPanelOpen', JSON.stringify(newState));
  };

  const calculateContentClass = () => {
    let classes = `flex-1 pt-14 md:pt-0 pb-16 md:pb-0 ${!isResizing ? 'transition-all duration-300 ease-out' : ''}`;
    
    // Dynamic left margin based on actual chat panel width
    const chatMargin = isChatPanelOpen ? chatPanelWidth + 48 : 48; // 48px for the chat button area
    
    if (isSidebarCollapsed) {
      classes += isProjectsSidebarLocked ? ' md:mr-[22rem]' : ' md:mr-14';
    } else {
      classes += isProjectsSidebarLocked ? ' md:mr-[32rem]' : ' md:mr-48';
    }
    
    const isConstrained = isChatPanelOpen && (isProjectsSidebarLocked || isProjectsSidebarOpen);
    if (isConstrained) {
      classes += ' data-constrained-layout';
    }
    
    return classes;
  };
  
  return (
    <MobileCreateMenuContext.Provider value={{ isCreateMenuOpen, setIsCreateMenuOpen }}>
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
    <IndustryContext.Provider value={{ selectedIndustry, setSelectedIndustry }}>
    <LayoutContext.Provider value={{ 
      isConstrained: isConstrained, 
      isMinimal: isMinimal,
      isCompact: isCompact,
      isChatOpen: isChatPanelOpen, 
      isProjectsOpen: isProjectsSidebarLocked || isProjectsSidebarOpen,
      availableWidth: availableContentWidth
    }}>
      <div className="min-h-screen bg-[#121212] flex overflow-x-hidden">
        <MobileHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onChatClick={toggleChatPanel}
          onCreateClick={() => setIsCreateMenuOpen(true)}
          isChatOpen={isChatPanelOpen}
          title={getPageTitle()}
        />

        {/* Desktop Layout Container */}
        <div className="hidden md:grid w-full h-screen overflow-hidden" 
          style={{
            gridTemplateColumns: `48px ${isChatPanelOpen ? `${chatPanelWidth}px` : '0px'} minmax(400px, 1fr) ${isProjectsSidebarLocked || isProjectsSidebarOpen ? '320px' : '0px'} ${isSidebarCollapsed ? '48px' : '192px'}`,
            transition: isResizing ? 'none' : 'grid-template-columns 300ms ease-out'
          }}
        >
          {/* Chat Toggle Button */}
          <div className="flex flex-col items-center justify-center h-screen bg-[#1A1A1A] border-r border-gray-700">
          <button
            onClick={toggleChatPanel}
            className={`relative w-10 h-10 ${isChatPanelOpen ? 'bg-[#336699]' : 'bg-[#2A2A2A]'} hover:bg-[#336699] rounded-[4px] flex items-center justify-center transition-all duration-200 group`}
            title={isChatPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <MessageSquare className={`h-5 w-5 ${isChatPanelOpen ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
            {!isChatPanelOpen && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#F9D71C] rounded-full animate-pulse"></div>
            )}
          </button>
          
          <div className="mt-4 writing-mode-vertical text-[10px] text-gray-500 uppercase tracking-wider select-none">
            AI Chat
        </div>
        </div>
        
          {/* Chat Panel */}
          <div className={`h-screen border-r border-gray-700 bg-[#1A1A1A] relative ${isChatPanelOpen ? '' : 'overflow-hidden'}`}>
          {isChatPanelOpen && (
            <>
                <div className="h-full overflow-hidden">
                <ChatManagementSystem />
              </div>
              <div
                  className="absolute -right-[3px] top-0 w-[6px] h-full cursor-ew-resize group z-10"
                onMouseDown={startResizing}
              >
                  <div className="absolute inset-y-0 left-[2px] w-[2px] bg-gray-700 group-hover:bg-[#336699] transition-colors" />
              </div>
            </>
          )}
        </div>
                  
          {/* Main Content Area */}
          <div className="min-h-full overflow-y-auto">
            <div className={`min-h-full max-w-3xl mx-auto px-4`}>
            {children}
                  </div>
              </div>
              
          {/* Projects Sidebar */}
        {(isProjectsSidebarOpen || isProjectsSidebarLocked) && (
            <div ref={projectsSidebarRef} className="h-screen bg-[#1A1A1A] border-l border-gray-700 overflow-hidden">
              <div className="h-full flex flex-col">
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
                
                <div className="relative">
                  {!isProjectsSearchExpanded ? (
                    <button
                      onClick={() => setIsProjectsSearchExpanded(true)}
                      className="w-7 h-7 bg-[#333333] hover:bg-[#404040] text-gray-400 hover:text-white rounded-[2px] flex items-center justify-center transition-colors"
                      title="Search projects"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
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
                          onBlur={() => {
                            if (!projectsSearch) {
                              setIsProjectsSearchExpanded(false);
                            }
                          }}
                          autoFocus
                    className="w-full pl-8 pr-3 py-1.5 bg-[#2A2A2A] border border-[#404040] rounded-[2px] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#336699] transition-colors"
                  />
                      </div>
                      {projectsSearch && (
                        <button
                          onClick={() => {
                            setProjectsSearch('');
                            setIsProjectsSearchExpanded(false);
                          }}
                          className="w-7 h-7 bg-[#333333] hover:bg-[#404040] text-gray-400 hover:text-white rounded-[2px] flex items-center justify-center transition-colors"
                          title="Clear search"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

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

          {/* Main Sidebar */}
          <Sidebar
            isSidebarCollapsed={isSidebarCollapsed}
            setSidebarCollapsedWithLogging={setSidebarCollapsedWithLogging}
            isCreateMenuOpen={isCreateMenuOpen}
            setIsCreateMenuOpen={setIsCreateMenuOpen}
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
        </div>

        {/* Mobile Layout - unchanged */}
        <div className="md:hidden flex-1 pt-14 pb-16">
          <div className="px-4">
            {children}
          </div>
        </div>

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
            <div className="mb-3">
              <h3 className="text-white/90 text-sm font-medium mb-3">{timePeriodHeaders[selectedTimePeriod]}</h3>
              
              <div className="text-white text-2xl font-bold mb-2">
                ${currentData.revenue.toLocaleString()}
              </div>
              
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

            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center text-green-300">
                <span className="mr-1">↗</span>
                <span>up 12% • Profit: ${currentData.profit.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-[#336699] h-2 rounded-full transition-all duration-300" 
                  style={{width: `${currentData.percentage}%`}}
                ></div>
              </div>
            </div>

            <div className="text-center">
              <span className="text-white/90 text-sm">{currentData.percentage}% of {goalPeriodLabels[selectedTimePeriod]} goal (${(currentData.revenue / (currentData.percentage / 100)).toLocaleString()})</span>
            </div>
          </div>
        )}

        {showNewClientModal && (
          <NewClientModal
            onClose={() => setShowNewClientModal(false)}
            onSave={(client) => {
              console.log('New client created:', client);
              setShowNewClientModal(false);
            }}
          />
        )}

        {/* Invoice Creation Drawer */}
        <CreateInvoiceDrawer
          isOpen={showNewInvoiceDrawer}
          onClose={() => setShowNewInvoiceDrawer(false)}
          onSave={async (data) => {
            try {
              // Create the invoice
              const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                  user_id: user?.id,
                  client_id: data.client_id,
                  amount: data.total_amount,
                  status: data.status,
                  issue_date: data.issue_date,
                  due_date: data.due_date,
                  description: data.description
                })
                .select()
                .single();

              if (invoiceError) throw invoiceError;

              // Create invoice items
              const itemsToInsert = data.items.map(item => ({
                invoice_id: invoice.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                description: item.description
              }));

              const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

              if (itemsError) throw itemsError;

              console.log('New invoice created:', invoice);
              setShowNewInvoiceDrawer(false);
            } catch (error) {
              console.error('Error creating invoice:', error);
            }
          }}
        />

        {showLineItemDrawer && (
          <div className="fixed inset-0 z-[10000] flex justify-end">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowLineItemDrawer(false)} />
            <div className="relative w-full max-w-md bg-[#121212] shadow-xl">
          <ProductForm
            title="Create Line Item"
            onClose={() => setShowLineItemDrawer(false)}
            onSubmit={async (data) => {
              console.log('New line item created:', data);
              setShowLineItemDrawer(false);
            }}
            submitLabel="Create Item"
          />
            </div>
          </div>
        )}

        {showHelpModal && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowHelpModal(false)} />
            <div className="relative bg-[#1E1E1E] rounded-[4px] shadow-xl border border-[#333333] w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
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

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="mb-8">
                  <h3 className="text-white font-bold mb-4">
                    Quick Start Tutorials
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      localStorage.removeItem('clientsOnboardingCompleted');
                      localStorage.removeItem('projectsOnboardingCompleted');
                      localStorage.removeItem('invoicesOnboardingCompleted');
                      localStorage.removeItem('productsOnboardingCompleted');
                      localStorage.removeItem('priceBookOnboardingCompleted');
                      setShowHelpModal(false);
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

        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          selectedOrg={selectedOrg}
          mockOrgs={mockOrgs}
          onOrgChange={setSelectedOrg}
          onShowHelp={() => setShowHelpModal(true)}
        />

        <MobileCreateMenu
          isOpen={isCreateMenuOpen}
          onClose={() => setIsCreateMenuOpen(false)}
          onCreateClient={() => setShowNewClientModal(true)}
          onCreateInvoice={() => setShowNewInvoiceDrawer(true)}
          onCreateLineItem={() => setShowLineItemDrawer(true)}
        />

        {/* Floating Action Button - Desktop Only */}
        <div className="hidden md:block">
          <button
            ref={createButtonRef}
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            className={`fixed bottom-6 ${
              isSidebarCollapsed 
                ? isProjectsSidebarLocked || isProjectsSidebarOpen ? 'right-[23rem]' : 'right-16' 
                : isProjectsSidebarLocked || isProjectsSidebarOpen ? 'right-[33rem]' : 'right-52'
            } w-14 h-14 bg-[#F9D71C] hover:bg-[#e9c91c] rounded-full shadow-[0_4px_20px_rgba(249,215,28,0.4)] hover:shadow-[0_6px_25px_rgba(249,215,28,0.6)] flex items-center justify-center transition-all duration-200 z-[9998] active:scale-95 group`}
            title="Create New Item"
            aria-label="Create new item"
          >
            <Plus className="w-6 h-6 text-[#121212] group-hover:scale-110 transition-transform" />
          </button>
        </div>

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
    </LayoutContext.Provider>
    </IndustryContext.Provider>
    </MobileMenuContext.Provider>
    </MobileCreateMenuContext.Provider>
  );
};