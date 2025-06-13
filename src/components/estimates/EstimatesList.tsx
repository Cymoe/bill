import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  FileText, Filter, MoreVertical, 
  Eye, Edit, Trash2, Send, Clock, CheckCircle, 
  XCircle, AlertTriangle, Calendar 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EstimateService, Estimate } from '../../services/EstimateService';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext, LayoutContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { TableSkeleton } from '../skeletons/TableSkeleton';

interface EstimatesListProps {
  onCreateEstimate?: () => void;
}

export const EstimatesList: React.FC<EstimatesListProps> = ({ onCreateEstimate }) => {
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const { isConstrained, isMinimal } = React.useContext(LayoutContext);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Estimate['status']>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const estimateDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedOrg?.id) {
      loadEstimates();
    }
  }, [selectedOrg?.id]);

  const loadEstimates = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setLoading(true);
      const data = await EstimateService.list(selectedOrg.id);
      setEstimates(data);
    } catch (error: any) {
      console.error('Error loading estimates:', error);
      // Check if it's a "table doesn't exist" error
      if (error?.message?.includes('estimates') || error?.code === '42P01') {
        console.warn('Estimates table does not exist yet. Please apply database migrations.');
        setEstimates([]);
      } else {
        setEstimates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEstimate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this estimate?')) return;
    
    try {
      await EstimateService.delete(id);
      await loadEstimates();
    } catch (error) {
      console.error('Error deleting estimate:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: Estimate['status']) => {
    try {
      await EstimateService.updateStatus(id, status);
      await loadEstimates();
    } catch (error) {
      console.error('Error updating estimate status:', error);
    }
  };

  const getStatusIcon = (status: Estimate['status']) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Estimate['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-400/10';
      case 'sent': return 'text-blue-400 bg-blue-400/10';
      case 'accepted': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'expired': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = 
      estimate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.estimate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Functions for the options menu
  const handleExportToCSV = () => {
    console.log('Export estimates to CSV');
  };

  const handleImportEstimates = () => {
    console.log('Import estimates clicked');
  };

  const handlePrintEstimates = () => {
    console.log('Print estimates clicked');
  };

  const statusCounts = estimates.reduce((acc, estimate) => {
    acc[estimate.status] = (acc[estimate.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <PageHeaderBar
        title="Estimates"
        searchPlaceholder="Search estimates..."
        onSearch={(query) => setSearchInput(query)}
        searchValue={searchInput}
        addButtonLabel="Add Estimate"
        onAddClick={onCreateEstimate}
      />
        
      {/* Unified Stats + Content Container */}
      <div className="bg-[#333333]/30 border border-[#333333] rounded-[4px]">
        {/* Stats Section */}
        <div className={`${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50 rounded-t-[4px]`}>
          {isMinimal || isConstrained ? (
            // Compact 4-column row for constrained/minimal
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL EST.</div>
                <div className="text-base font-semibold mt-1">{estimates.length}</div>
                <div className="text-xs text-gray-500">estimates</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL VALUE</div>
                <div className="text-base font-semibold text-[#F9D71C] mt-1">{formatCurrency(estimates.reduce((sum, est) => sum + est.total_amount, 0))}</div>
                <div className="text-xs text-gray-500">potential</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">ACCEPTED</div>
                <div className="text-base font-semibold text-[#388E3C] mt-1">{statusCounts.accepted || 0}</div>
                <div className="text-xs text-gray-500">won</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">PENDING</div>
                <div className="text-base font-semibold text-[#336699] mt-1">{statusCounts.sent || 0}</div>
                <div className="text-xs text-gray-500">awaiting</div>
              </div>
            </div>
          ) : (
            // Full 4-column layout for desktop
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL ESTIMATES</div>
                <div className="text-lg font-semibold mt-1">{estimates.length}</div>
                <div className="text-xs text-gray-500">(all estimates • lifetime business)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL VALUE</div>
                <div className="text-lg font-semibold text-[#F9D71C] mt-1">{formatCurrency(estimates.reduce((sum, est) => sum + est.total_amount, 0))}</div>
                <div className="text-xs text-gray-500">(potential revenue • win rate pending)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">ACCEPTED</div>
                <div className="text-lg font-semibold text-[#388E3C] mt-1">{statusCounts.accepted || 0}</div>
                <div className="text-xs text-gray-500">({Math.round(((statusCounts.accepted || 0) / Math.max(estimates.length, 1)) * 100)}% win rate)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">PENDING</div>
                <div className="text-lg font-semibold text-[#336699] mt-1">{statusCounts.sent || 0}</div>
                <div className="text-xs text-gray-500">({statusCounts.draft || 0} draft • awaiting response)</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className={`${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
          <div className={`flex items-center justify-between ${isMinimal ? 'gap-2' : 'gap-4'}`}>
            {/* Left side - Filters */}
            <div className={`flex items-center ${isMinimal ? 'gap-2' : 'gap-3'}`}>
              <select
                className={`bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699] ${
                  isMinimal ? 'px-2 py-1.5 text-xs min-w-[120px]' : isConstrained ? 'px-2 py-1.5 text-xs min-w-[140px]' : 'px-3 py-2 text-sm'
                }`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Estimates ({estimates.length})</option>
                <option value="draft">Drafts ({statusCounts.draft || 0})</option>
                <option value="sent">Sent ({statusCounts.sent || 0})</option>
                <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
                <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
                <option value="expired">Expired ({statusCounts.expired || 0})</option>
              </select>

              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white hover:bg-[#333333] transition-colors flex items-center gap-2 ${
                    isMinimal ? 'px-2 py-1.5 text-xs' : isConstrained ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                  }`}
                >
                  <Filter className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMinimal && !isConstrained && 'More Filters'}
                </button>

                {showFilterMenu && (
                  <div className={`absolute top-full ${isConstrained ? 'right-0' : 'left-0'} mt-2 ${isConstrained ? 'w-56' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-[9999] p-4`}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Date Range
                        </label>
                        <select className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]">
                          <option value="all">All Time</option>
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                          <option value="90d">Last 90 Days</option>
                        </select>
                      </div>
                      <div className="pt-2 border-t border-[#333333]">
                        <button
                          onClick={() => setShowFilterMenu(false)}
                          className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 rounded-[4px] text-sm font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Options menu */}
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 hover:bg-[#333333] rounded-[4px] transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333]">
                    Data Management
                  </div>
                  <button
                    onClick={() => {
                      handleImportEstimates();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-3 text-gray-400" />
                    Import Estimates
                  </button>
                  <button
                    onClick={() => {
                      handleExportToCSV();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-3 text-gray-400" />
                    Export to CSV
                  </button>
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333] border-t border-[#333333] mt-1">
                    View Options
                  </div>
                  <button
                    onClick={() => {
                      handlePrintEstimates();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-3 text-gray-400" />
                    Print Estimates
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className={`${isMinimal ? 'px-4 py-2' : isConstrained ? 'px-4 py-2' : 'px-6 py-3'} border-b border-[#333333]/50 bg-[#1E1E1E]/50`}>
          <div className={`grid ${isMinimal ? 'grid-cols-8' : isConstrained ? 'grid-cols-8' : 'grid-cols-12'} gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider items-center`}>
            <div className={`${isMinimal ? 'col-span-3' : isConstrained ? 'col-span-4' : 'col-span-5'}`}>ESTIMATE</div>
            <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-2' : 'col-span-2'} text-center`}>STATUS</div>
            <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-1' : 'col-span-3'} text-center`}>AMOUNT</div>
            {!isMinimal && !isConstrained && <div className="col-span-2">CLIENT</div>}
            <div className={`${isMinimal ? 'col-span-1' : isConstrained ? 'col-span-1' : 'col-span-1'} text-right`}></div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-hidden rounded-b-[4px]">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} columns={7} />
            </div>
          ) : !loading && estimates.length === 0 ? (
            <div className="max-w-4xl mx-auto p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Estimates Management</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Estimates help you win more business. Create professional estimates to quote 
                  projects accurately and convert prospects into paying clients.
                </p>
              </div>
              
              {/* Quick Start Steps */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#336699]">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#336699] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      1
                    </div>
                    <h3 className="text-white font-bold">Create Your First Estimate</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Generate a professional estimate for potential projects.
                  </p>
                  <button
                    onClick={onCreateEstimate}
                    className="w-full bg-white text-black py-2 px-4 rounded-[8px] hover:bg-gray-100 transition-colors font-medium"
                  >
                    CREATE ESTIMATE
                  </button>
                </div>
                
                <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      2
                    </div>
                    <h3 className="text-gray-400 font-bold">Send & Track</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Send estimates to clients and track their responses.
                  </p>
                  <button disabled className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium">
                    COMING NEXT
                  </button>
                </div>
                
                <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      3
                    </div>
                    <h3 className="text-gray-400 font-bold">Convert to Projects</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Turn accepted estimates into active projects.
                  </p>
                  <button disabled className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium">
                    COMING NEXT
                  </button>
                </div>
              </div>
            </div>

          ) : (
            <>
              {/* Table Rows */}
              <div>
                {filteredEstimates.map((estimate) => {
                  const status = getStatusColor(estimate.status);
                  
                  return (
                    <div
                      key={estimate.id}
                      className={`grid ${
                        isMinimal 
                          ? 'grid-cols-8 gap-4 px-4 py-3' 
                          : isConstrained 
                            ? 'grid-cols-8 gap-4 px-4 py-3' 
                            : 'grid-cols-12 gap-4 px-6 py-4'
                      } items-center hover:bg-[#1A1A1A] transition-colors cursor-pointer border-b border-[#333333]/50 last:border-b-0`}
                      onClick={() => navigate(`/estimates/${estimate.id}`)}
                    >
                      {/* Estimate Column with Status Badge */}
                      <div className={`${isMinimal ? 'col-span-3' : isConstrained ? 'col-span-3' : 'col-span-4'}`}>
                        <div className={`flex items-center ${isMinimal ? 'gap-2' : 'gap-3'}`}>
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium text-white truncate ${isMinimal ? 'text-sm' : ''}`}>
                              {estimate.title || estimate.estimate_number}
                            </div>
                            <div className="text-xs text-gray-400 truncate mt-0.5">
                              {estimate.estimate_number}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Column */}
                      <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-2' : 'col-span-2'} text-center`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-[4px] text-xs font-medium ${status}`}>
                          {getStatusIcon(estimate.status)}
                          {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Amount Column */}
                      <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-2' : 'col-span-3'} text-center`}>
                        <div className={`font-mono font-semibold text-white ${isMinimal ? 'text-sm' : ''}`}>
                          {formatCurrency(estimate.total_amount)}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">Estimate</div>
                      </div>
                      
                      {/* Client Column - Only shown in full mode */}
                      {!isMinimal && !isConstrained && (
                        <div className="col-span-2 text-sm text-gray-300">
                          <div>{estimate.client?.name || 'No client'}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(estimate.issue_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Actions Column */}
                      <div className={`${isMinimal ? 'col-span-1' : isConstrained ? 'col-span-1' : 'col-span-1'} flex justify-end items-center`}>
                        <div
                          ref={(el) => {
                            estimateDropdownRefs.current[estimate.id!] = el;
                          }}
                          className="relative flex-shrink-0"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(dropdownOpen === estimate.id ? null : estimate.id!);
                            }}
                            className={`${isMinimal ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-[2px] hover:bg-[#333333] transition-colors flex-shrink-0`}
                          >
                            <MoreVertical className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                          </button>
                          
                          {dropdownOpen === estimate.id && (
                            <div className="absolute right-0 top-8 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/estimates/${estimate.id}`);
                                  setDropdownOpen(null);
                                }}
                                className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-3 text-gray-400" />
                                View Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/estimates/${estimate.id}/edit`);
                                  setDropdownOpen(null);
                                }}
                                className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-3 text-gray-400" />
                                Edit Estimate
                              </button>
                              {estimate.status === 'draft' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(estimate.id!, 'sent');
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                >
                                  <Send className="w-4 h-4 mr-3 text-gray-400" />
                                  Send to Client
                                </button>
                              )}
                              <div className="border-t border-[#333333] my-1"></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEstimate(estimate.id!);
                                  setDropdownOpen(null);
                                }}
                                className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#333333] transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                                Delete Estimate
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};