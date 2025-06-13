import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  CreditCard,
  HelpCircle,
  LogOut,
  Building2,
  Book
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setSidebarCollapsedWithLogging: (value: boolean | ((prev: boolean) => boolean)) => void;
  orgDropdownOpen: boolean;
  setOrgDropdownOpen: (value: boolean) => void;
  selectedOrg: { id: string; name: string; industry: string };
  setSelectedOrg: (org: { id: string; name: string; industry: string }) => void;
  organizations: { id: string; name: string; industry: string }[];
  isProjectsSidebarOpen: boolean;
  setIsProjectsSidebarOpen: (value: boolean) => void;
  isProjectsSidebarLocked: boolean;
  setProjectsSidebarLockedWithPersistence: (value: boolean) => void;
  selectedTimePeriod: 'D' | 'W' | 'M' | 'Q' | 'Y';
  setSelectedTimePeriod: (period: 'D' | 'W' | 'M' | 'Q' | 'Y') => void;
  currentData: { revenue: number; profit: number; goal: number; percentage: number };
  timePeriodHeaders: { [key: string]: string };
  isLiveRevenuePopoverOpen: boolean;
  setIsLiveRevenuePopoverOpen: (value: boolean) => void;
  liveRevenueButtonRef: React.RefObject<HTMLDivElement>;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (value: boolean) => void;
  setShowHelpModal: (value: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarCollapsed,
  setSidebarCollapsedWithLogging,
  orgDropdownOpen,
  setOrgDropdownOpen,
  selectedOrg,
  setSelectedOrg,
  organizations,
  isProjectsSidebarOpen,
  setIsProjectsSidebarOpen,
  isProjectsSidebarLocked,
  setProjectsSidebarLockedWithPersistence,
  selectedTimePeriod,
  setSelectedTimePeriod,
  currentData,
  timePeriodHeaders,
  isLiveRevenuePopoverOpen,
  setIsLiveRevenuePopoverOpen,
  liveRevenueButtonRef,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  setShowHelpModal
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen, setIsProfileMenuOpen]);

  return (
    <>
      {/* Sidebar - part of grid layout, not fixed */}
      <div className={`hidden md:flex ${isSidebarCollapsed ? 'w-14' : 'w-48'} h-screen bg-[#121212] border-l border-gray-700 flex-col transition-all duration-300 overflow-hidden`}>
        {/* Organization header and sidebar toggle */}
        <div className="p-2 border-b border-[#333333] relative flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarCollapsedWithLogging(!isSidebarCollapsed)}
            className={`${isSidebarCollapsed ? 'w-full' : 'w-8'} h-8 flex items-center justify-center rounded-[4px] bg-[#1E1E1E] text-[#9E9E9E] hover:text-white transition-colors`}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-between ml-1 h-8 px-2 hover:bg-[#2A2A2A] transition-all duration-150"
            >
              <div className="flex items-center min-w-0">
                <span className="text-white text-sm font-medium leading-tight truncate">{selectedOrg.name}</span>
              </div>
              <ChevronDown className={`text-[#336699] w-3 h-3 transition-transform duration-200 flex-shrink-0 ${orgDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
          )}
          
          {/* Organization Dropdown */}
          {orgDropdownOpen && !isSidebarCollapsed && (
            <div className="absolute left-2 right-2 top-[calc(100%-8px)] mt-1 bg-[#1A1A1A] border border-[#2A2A2A] shadow-lg z-50 py-1 overflow-hidden">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#2A2A2A] transition-colors ${selectedOrg.id === org.id ? 'bg-[#2A2A2A]' : ''}`}
                  onClick={() => {
                    setSelectedOrg(org);
                    setOrgDropdownOpen(false);
                  }}
                >
                  <div className={`text-white w-7 h-7 flex items-center justify-center text-sm font-bold ${selectedOrg.id === org.id ? 'bg-[#336699]' : 'bg-[#333333]'}`}>
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
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Grid navigation */}
          <div className={`${isSidebarCollapsed ? 'grid grid-cols-1' : 'grid grid-cols-2'} gap-0`}>
            {/* Profit Tracker (formerly Dashboard) */}
            <NavLink
              to="/profit-tracker"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">💰</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Profit Tracker
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>


            {/* Estimates */}
            <NavLink
              to="/estimates"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">📋</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Estimates
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
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
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

            {/* People (formerly Clients) */}
            <NavLink
              to="/people"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-base">👥</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        People
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
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
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

            {/* Work Packs */}
            <NavLink
              to="/templates"
              className={({ isActive }) =>
                isActive
                  ? `bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md border border-[#336699]/50 flex flex-col items-center justify-center h-16 relative overflow-hidden group shadow-[0_0_10px_rgba(51,102,153,0.15)]`
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-xl font-bold">▣</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Work Packs
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
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-xl font-bold">▢</span>
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
                  : "bg-[#1A1A1A] border border-[#2A2A2A] flex flex-col items-center justify-center h-16 hover:bg-[#2A2A2A] transition-all duration-150 relative overflow-hidden group active:scale-95"
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className={`mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                      <span className="text-2xl font-bold">•</span>
                    </div>
                    {!isSidebarCollapsed && (
                      <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        Cost Codes
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          </div>

          {/* Recent Projects Section */}
          {!isSidebarCollapsed && (
            <div>
              {/* Projects without padding */}
              <div className="mb-2">
                <div className="space-y-0">
                  {/* Kitchen Renovation Row */}
                  <button 
                    onClick={() => navigate('/projects/1')}
                    className={`w-full flex items-center justify-between px-1.5 py-2 transition-colors group border-b border-[#333333] last:border-b-0 hover:bg-[#2A2A2A] first:rounded-t-[4px] last:rounded-b-[4px] ${location.pathname === '/projects/1' ? 'bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 border-l border-[#336699]/50' : ''}`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className={`text-white text-xs font-medium truncate ${location.pathname === '/projects/1' ? 'text-[#336699]' : 'group-hover:text-[#336699]'} transition-colors leading-tight`}>Kitchen Renovation</span>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-[#6b7280] text-xs font-medium leading-tight">75%</span>
                    </div>
                  </button>

                  {/* HVAC Install Row */}
                  <button 
                    onClick={() => navigate('/projects/2')}
                    className={`w-full flex items-center justify-between px-1.5 py-2 transition-colors group border-b border-[#333333] last:border-b-0 hover:bg-[#2A2A2A] first:rounded-t-[4px] last:rounded-b-[4px] ${location.pathname === '/projects/2' ? 'bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 border-l border-[#336699]/50' : ''}`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className={`text-white text-xs font-medium truncate ${location.pathname === '/projects/2' ? 'text-[#336699]' : 'group-hover:text-[#336699]'} transition-colors leading-tight`}>HVAC Install</span>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-[#6b7280] text-xs font-medium leading-tight">45%</span>
                    </div>
                  </button>

                  {/* Office Buildout Row */}
                  <button 
                    onClick={() => navigate('/projects/3')}
                    className={`w-full flex items-center justify-between px-1.5 py-2 transition-colors group border-b border-[#333333] last:border-b-0 hover:bg-[#2A2A2A] first:rounded-t-[4px] last:rounded-b-[4px] ${location.pathname === '/projects/3' ? 'bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 border-l border-[#336699]/50' : ''}`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className={`text-white text-xs font-medium truncate ${location.pathname === '/projects/3' ? 'text-[#336699]' : 'group-hover:text-[#336699]'} transition-colors leading-tight`}>Office Buildout</span>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-[#6b7280] text-xs font-medium leading-tight">65%</span>
                    </div>
                  </button>
                </div>
              </div>
              
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
                    className={`${isProjectsSidebarLocked ? 'text-[#F9D71C]' : 'text-[#336699]'} text-[10px] font-medium hover:text-white transition-colors flex items-center justify-end uppercase tracking-wide ${isProjectsSidebarLocked ? 'cursor-default' : 'cursor-pointer'} w-full`}
                  >
                    <ChevronLeft className={`w-2.5 h-2.5 mr-1 transition-transform ${isProjectsSidebarOpen && !isProjectsSidebarLocked ? 'rotate-90' : ''}`} />
                    <span className="mr-1">{isProjectsSidebarLocked ? 'locked' : (isProjectsSidebarOpen ? 'close' : 'more')}</span>
                    {isProjectsSidebarOpen && !isProjectsSidebarLocked ? (
                      <span className="flex items-center">×</span>
                    ) : (
                      <span className="flex items-center">⋮⋮</span>
                    )}
                    {isProjectsSidebarLocked && (
                      <svg className="w-2.5 h-2.5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto flex-shrink-0">
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
                        className={`w-7 h-7 rounded-[4px] flex items-center justify-center text-xs font-bold transition-colors ${
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
                    <span className="text-[10px] leading-tight">up 12%</span>
                  </div>
                  <div className="text-white/90 text-[10px] leading-tight">
                    Profit: ${currentData.profit.toLocaleString()}
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
                  <span className="text-white/90 text-[10px] leading-tight">{currentData.percentage}% of goal</span>
                </div>
              </div>
            ) : (
              <div 
                ref={liveRevenueButtonRef}
                onClick={() => setIsLiveRevenuePopoverOpen(!isLiveRevenuePopoverOpen)}
                className="bg-gradient-to-br from-[#336699]/20 to-[#336699]/5 backdrop-blur-md p-2 rounded-[2px] border border-[#336699]/50 shadow-[0_0_10px_rgba(51,102,153,0.15)] cursor-pointer hover:from-[#336699]/30 hover:to-[#336699]/10 transition-all"
              >
                <div className="text-center">
                  <div className="text-white text-xs font-bold mb-1">
                    ${(currentData.revenue / 1000).toFixed(0)}K
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1">
                    <div 
                      className="bg-[#336699] h-1 rounded-full transition-all duration-300" 
                      style={{width: `${currentData.percentage}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Section */}
          <div className="relative border-t border-gray-700">
            {/* Profile Dropdown Menu - positioned absolutely above user info */}
            {isProfileMenuOpen && (
              <div 
                ref={profileDropdownRef}
                className={`absolute bottom-full ${isSidebarCollapsed ? 'right-0 w-48' : 'left-0 right-0'} mb-1 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg overflow-hidden z-50`}
              >
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
                    navigate('/settings/industries');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-white hover:bg-[#333333] transition-colors duration-200"
                >
                  <Building2 className="w-4 h-4 mr-3 text-[#9E9E9E]" />
                  <span className="font-['Roboto']">Industry Settings</span>
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
    </>
  );
}; 