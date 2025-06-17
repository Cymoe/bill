import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  FileText, Filter, MoreVertical, 
  Eye, Edit, Trash2, Send, Clock, CheckCircle, 
  XCircle, AlertTriangle, Calendar, ChevronDown, ChevronUp, LayoutGrid, Share2, Copy 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EstimateService, Estimate } from '../../services/EstimateService';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext, LayoutContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { advancedSearch, SearchableField } from '../../utils/searchUtils';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { supabase } from '../../lib/supabase';

interface EstimatesListProps {
  onCreateEstimate?: () => void;
  searchTerm?: string;
  refreshTrigger?: number;
}

import { CreateEstimateDrawer } from './CreateEstimateDrawer';

export const EstimatesList: React.FC<EstimatesListProps> = ({ onCreateEstimate, searchTerm = '', refreshTrigger }) => {
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const { isConstrained } = React.useContext(LayoutContext);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | Estimate['status']>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isCompactTable, setIsCompactTable] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingEstimate, setSharingEstimate] = useState<Estimate | null>(null);
  
  // Sort state
  const [sortField, setSortField] = useState<'amount' | 'date' | 'estimate_number' | 'client'>('amount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const estimateDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedOrg?.id) {
      loadEstimates();
    }
  }, [selectedOrg?.id, refreshTrigger]);

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

  const handleEditEstimate = (estimate: Estimate) => {
    console.log('handleEditEstimate called', estimate);
    setEditingEstimate(estimate);
    setShowEditDrawer(true);
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
      case 'opened': return <Eye className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Estimate['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-600 text-white';
      case 'sent': return 'bg-blue-600 text-white';
      case 'opened': return 'bg-purple-600 text-white';
      case 'accepted': return 'bg-green-600 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      case 'expired': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const filteredEstimates = estimates.filter(estimate => {
    // Advanced search filter
    let matchesSearch = true;
    if (searchTerm) {
      const searchableFields: SearchableField[] = [
        { 
          key: 'estimate_number', 
          weight: 2.0, // Higher weight for estimate numbers
          transform: (est) => est.estimate_number || ''
        },
        { 
          key: 'title', 
          weight: 1.5, // High weight for titles
          transform: (est) => est.title || ''
        },
        { 
          key: 'client_name', 
          weight: 1.5, // High weight for client names
          transform: (est) => est.client?.name || ''
        },
        { 
          key: 'amount', 
          weight: 1.0,
          transform: (est) => formatCurrency(est.total_amount)
        },
        { 
          key: 'status', 
          weight: 0.8,
          transform: (est) => est.status
        },
        { 
          key: 'description', 
          weight: 0.6,
          transform: (est) => est.description || ''
        }
      ];

      const searchResults = advancedSearch([estimate], searchTerm, searchableFields, {
        minScore: 0.2, // Lower threshold for more inclusive results
        requireAllTerms: false // Allow partial matches
      });

      matchesSearch = searchResults.length > 0;
    }
    
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by selected field and direction
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'amount':
        aValue = a.total_amount;
        bValue = b.total_amount;
        break;
      case 'date':
        aValue = new Date(a.created_at || '').getTime();
        bValue = new Date(b.created_at || '').getTime();
        break;
      case 'estimate_number':
        aValue = a.estimate_number || '';
        bValue = b.estimate_number || '';
        break;
      case 'client':
        aValue = a.client?.name || '';
        bValue = b.client?.name || '';
        break;
      default:
        aValue = a.total_amount;
        bValue = b.total_amount;
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
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

  const handleSort = (field: 'amount' | 'date' | 'estimate_number' | 'client') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection(field === 'amount' ? 'desc' : 'asc'); // Amount defaults to desc (highest first)
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setSortField('amount');
    setSortDirection('desc');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      
      // Check if click is outside all dropdown menus
      const isOutsideDropdown = Object.values(estimateDropdownRefs.current).every(ref => 
        !ref || !ref.contains(event.target as Node)
      );
      
      if (isOutsideDropdown && dropdownOpen) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (loading) {
    return (
      <div>
        <div className="bg-transparent border border-[#333333]">
          <div className="p-6">
            <TableSkeleton rows={5} columns={5} />
          </div>
        </div>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div>
        <div className="bg-transparent border border-[#333333]">
          <div className="text-center py-12 px-8">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Estimates Management</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Create professional estimates to win more business. Track approval status and convert estimates to projects seamlessly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-purple-500">
                <h3 className="text-white font-bold mb-2">Professional Quotes</h3>
                <p className="text-gray-400 text-sm">
                  Create detailed estimates with line items and accurate pricing
                </p>
              </div>
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-blue-500">
                <h3 className="text-white font-bold mb-2">Track Approvals</h3>
                <p className="text-gray-400 text-sm">
                  Monitor estimate status and follow up on pending quotes
                </p>
              </div>
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-green-500">
                <h3 className="text-white font-bold mb-2">Win More Work</h3>
                <p className="text-gray-400 text-sm">
                  Convert accepted estimates to projects and invoices
                </p>
              </div>
            </div>

            <button 
              onClick={onCreateEstimate}
              className="px-6 py-3 bg-white text-black rounded-[8px] font-medium hover:bg-gray-100 transition-colors"
            >
              CREATE FIRST ESTIMATE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Unified Container */}
      <div className="bg-transparent border border-[#333333]">
        {/* Stats Section */}
        <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
          {isConstrained ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL</div>
                <div className="text-base font-semibold mt-1">{estimates.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">VALUE</div>
                <div className="text-base font-semibold text-yellow-400 mt-1">{formatCurrency(estimates.reduce((sum, est) => sum + est.total_amount, 0))}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">ACCEPTED</div>
                <div className="text-base font-semibold text-green-400 mt-1">{statusCounts.accepted || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">PENDING</div>
                <div className="text-base font-semibold text-blue-400 mt-1">{statusCounts.sent || 0}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL ESTIMATES</div>
                <div className="text-lg font-semibold mt-1">{estimates.length}</div>
                <div className="text-xs text-gray-500">all estimates • lifetime business</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL VALUE</div>
                <div className="text-lg font-semibold text-yellow-400 mt-1">{formatCurrency(estimates.reduce((sum, est) => sum + est.total_amount, 0))}</div>
                <div className="text-xs text-gray-500">potential revenue • win rate pending</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">ACCEPTED</div>
                <div className="text-lg font-semibold text-green-400 mt-1">{statusCounts.accepted || 0}</div>
                <div className="text-xs text-gray-500">{Math.round(((statusCounts.accepted || 0) / Math.max(estimates.length, 1)) * 100)}% win rate</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">PENDING</div>
                <div className="text-lg font-semibold text-blue-400 mt-1">{statusCounts.sent || 0}</div>
                <div className="text-xs text-gray-500">{statusCounts.draft || 0} draft • awaiting response</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none pr-10 min-w-[200px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Estimates ({estimates.length})</option>
                  <option value="draft">Drafts ({statusCounts.draft || 0})</option>
                  <option value="sent">Sent ({statusCounts.sent || 0})</option>
                  <option value="opened">Opened ({statusCounts.opened || 0})</option>
                  <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
                  <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
                  <option value="expired">Expired ({statusCounts.expired || 0})</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative" ref={filterMenuRef}>
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`px-3 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#333333] rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2 ${showFilterMenu ? 'bg-[#252525]' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{isConstrained ? '' : 'More Filters'}</span>
                </button>
                
                {/* Filter Menu Dropdown */}
                {showFilterMenu && (
                  <div className={`absolute top-full left-0 mt-1 ${isConstrained ? 'right-0 left-auto w-[280px]' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-3 md:p-4`}>
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                        <select className="w-full px-3 py-2 bg-[#333333] border border-[#404040] rounded-[4px] text-white focus:outline-none focus:border-[#336699]">
                          <option value="all">All Time</option>
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                          <option value="90d">Last 90 Days</option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      <div className="pt-2 md:pt-3 border-t border-[#333333]">
                        <button
                          onClick={() => {
                            resetFilters();
                            setShowFilterMenu(false);
                          }}
                          className="w-full bg-[#333333] hover:bg-[#404040] text-white py-1.5 md:py-2 px-2 md:px-3 rounded-[4px] text-xs md:text-sm font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Compact Table Toggle */}
              <button
                onClick={() => setIsCompactTable(!isCompactTable)}
                className={`p-2 hover:bg-[#333333] rounded-[4px] transition-colors ${isCompactTable ? 'bg-[#333333] text-[#3B82F6]' : 'text-gray-400'}`}
                title="Toggle compact view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              
              {/* Options menu */}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {filteredEstimates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No estimates found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first estimate.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <button
                  onClick={onCreateEstimate}
                  className="flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-[8px] font-medium hover:bg-[#2d5a87] transition-colors mx-auto"
                >
                  <FileText className="w-4 h-4" />
                  Create Estimate
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
                          <table className="min-w-full">
              <thead className="bg-[#1E1E1E]">
                <tr>
                    {isCompactTable ? (
                      <>
                        <th className={`${isCompactTable ? 'px-3 py-1.5' : 'px-6 py-3'} text-left text-xs font-medium text-gray-400 uppercase tracking-wider`}>
                          <button 
                            onClick={() => handleSort('estimate_number')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'estimate_number' ? 'text-white' : ''
                            }`}
                          >
                            ESTIMATE
                            {sortField === 'estimate_number' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className={`${isCompactTable ? 'px-3 py-1.5' : 'px-6 py-3'} text-left text-xs font-medium text-gray-400 uppercase tracking-wider`}>
                          <button 
                            onClick={() => handleSort('amount')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'amount' ? 'text-white' : ''
                            }`}
                          >
                            AMOUNT
                            {sortField === 'amount' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className={`${isCompactTable ? 'px-3 py-1.5' : 'px-6 py-3'} text-left text-xs font-medium text-gray-400 uppercase tracking-wider`}>
                          <button 
                            onClick={() => handleSort('client')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'client' ? 'text-white' : ''
                            }`}
                          >
                            CLIENT
                            {sortField === 'client' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className={`${isCompactTable ? 'px-3 py-1.5' : 'px-6 py-3'} text-left text-xs font-medium text-gray-400 uppercase tracking-wider`}>
                          STATUS
                        </th>
                        <th className={`${isCompactTable ? 'px-3 py-1.5' : 'px-6 py-3'} text-left text-xs font-medium text-gray-400 uppercase tracking-wider`}>
                          <button 
                            onClick={() => handleSort('date')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'date' ? 'text-white' : ''
                            }`}
                          >
                            DATE
                            {sortField === 'date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className={`${isCompactTable ? 'px-3 py-1.5' : 'px-6 py-3'} text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-12`}>
                          
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-2/5">
                          <button 
                            onClick={() => handleSort('estimate_number')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'estimate_number' ? 'text-white' : ''
                            }`}
                          >
                            ESTIMATE
                            {sortField === 'estimate_number' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/5">
                          <button 
                            onClick={() => handleSort('amount')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'amount' ? 'text-white' : ''
                            }`}
                          >
                            AMOUNT
                            {sortField === 'amount' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/5">
                          <button 
                            onClick={() => handleSort('date')}
                            className={`text-left hover:text-white transition-colors flex items-center gap-1 ${
                              sortField === 'date' ? 'text-white' : ''
                            }`}
                          >
                            DATE
                            {sortField === 'date' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                          
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {filteredEstimates.map((estimate) => (
                    <tr
                      key={estimate.id}
                      onClick={() => navigate(`/estimates/${estimate.id}`)}
                      className="group hover:bg-[#1E1E1E] cursor-pointer transition-colors"
                    >
                      {isCompactTable ? (
                        <>
                          <td className="px-3 py-1.5">
                            <div className="font-medium text-white text-sm">{estimate.estimate_number}</div>
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="font-mono text-white font-medium text-sm">{formatCurrency(estimate.total_amount)}</div>
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="text-sm text-white truncate">{estimate.client?.name || 'No Client'}</div>
                          </td>
                          <td className="px-3 py-1.5">
                            <span className={`text-xs px-2 py-0.5 font-medium ${getStatusColor(estimate.status)}`}>
                              {estimate.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="text-sm text-white">{estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'No date'}</div>
                          </td>
                          <td className="px-3 py-1.5 text-center w-12">
                            <div className="relative flex justify-center" ref={(el) => estimateDropdownRefs.current[estimate.id!] = el}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownOpen(dropdownOpen === estimate.id ? null : estimate.id);
                                }}
                                className="w-6 h-6 flex items-center justify-center hover:bg-[#333333] transition-all opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="w-3 h-3 text-gray-400" />
                              </button>

                              {dropdownOpen === estimate.id && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/estimates/${estimate.id}`);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                  >
                                    <Eye className="w-3 h-3 mr-3 text-gray-400" />
                                    View Estimate
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditEstimate(estimate);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                  >
                                    <Edit className="w-3 h-3 mr-3 text-gray-400" />
                                    Edit Estimate
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSharingEstimate(estimate);
                                      setShowShareModal(true);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                  >
                                    <Share2 className="w-3 h-3 mr-3 text-gray-400" />
                                    Share Estimate
                                  </button>
                                  {estimate.status === 'draft' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(estimate.id, 'sent');
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                    >
                                      <Send className="w-3 h-3 mr-3 text-gray-400" />
                                      Send to Client
                                    </button>
                                  )}
                                  {estimate.status === 'sent' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(estimate.id, 'accepted');
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-3 text-gray-400" />
                                      Mark as Accepted
                                    </button>
                                  )}
                                  <div className="border-t border-[#333333] mt-1 pt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEstimate(estimate.id);
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#333333] transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3 mr-3" />
                                      Delete Estimate
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2.5 py-1 font-medium ${getStatusColor(estimate.status)}`}>
                                {estimate.status.toUpperCase()}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-white">{estimate.estimate_number}</div>
                                <div className="text-sm text-gray-400 truncate">{estimate.client?.name || 'No Client'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-mono text-white font-medium">{formatCurrency(estimate.total_amount)}</div>
                              <div className="text-sm text-gray-400">Estimate</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-white">{estimate.created_at ? new Date(estimate.created_at).toLocaleDateString() : 'No date'}</div>
                              {estimate.status === 'sent' && estimate.created_at && (
                                <div className="text-xs text-gray-400">
                                  {Math.floor((new Date().getTime() - new Date(estimate.created_at).getTime()) / (1000 * 60 * 60 * 24))} days pending
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center w-12">
                            <div className="relative flex justify-center" ref={(el) => estimateDropdownRefs.current[estimate.id!] = el}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDropdownOpen(dropdownOpen === estimate.id ? null : estimate.id);
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#333333] transition-all opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>

                              {dropdownOpen === estimate.id && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/estimates/${estimate.id}`);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                  >
                                    <Eye className="w-3 h-3 mr-3 text-gray-400" />
                                    View Estimate
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditEstimate(estimate);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                  >
                                    <Edit className="w-3 h-3 mr-3 text-gray-400" />
                                    Edit Estimate
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSharingEstimate(estimate);
                                      setShowShareModal(true);
                                      setDropdownOpen(null);
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                  >
                                    <Share2 className="w-3 h-3 mr-3 text-gray-400" />
                                    Share Estimate
                                  </button>
                                  {estimate.status === 'draft' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(estimate.id, 'sent');
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                    >
                                      <Send className="w-3 h-3 mr-3 text-gray-400" />
                                      Send to Client
                                    </button>
                                  )}
                                  {estimate.status === 'sent' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusUpdate(estimate.id, 'accepted');
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-3 text-gray-400" />
                                      Mark as Accepted
                                    </button>
                                  )}
                                  <div className="border-t border-[#333333] mt-1 pt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEstimate(estimate.id);
                                        setDropdownOpen(null);
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#333333] transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3 mr-3" />
                                      Delete Estimate
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Estimate Drawer */}
      <CreateEstimateDrawer
        isOpen={showEditDrawer}
        onClose={() => {
          setShowEditDrawer(false);
          setEditingEstimate(null);
        }}
        editingEstimate={editingEstimate}
        onSave={async (data) => {
          try {
            if (editingEstimate) {
              // Update the estimate
              await EstimateService.update(editingEstimate.id, {
                ...data,
                organization_id: selectedOrg?.id || '',
              });
              await loadEstimates();
              setShowEditDrawer(false);
              setEditingEstimate(null);
            }
          } catch (error) {
            console.error('Error updating estimate:', error);
          }
        }}
      />

      {/* Share Modal */}
      {showShareModal && sharingEstimate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
            setShowShareModal(false);
            setSharingEstimate(null);
          }} />
          <div className="relative bg-[#1E1E1E] rounded-lg border border-[#333333] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Share Estimate</h3>
            <p className="text-gray-400 mb-4">
              Generate a shareable link for this estimate. Clients can view the estimate without needing to log in.
            </p>
            
            <div className="bg-[#121212] border border-[#333333] rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">Shareable Link</div>
              <div className="text-sm text-white break-all">
                {`${window.location.origin}/share/estimate/${sharingEstimate.id}`}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSharingEstimate(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/share/estimate/${sharingEstimate.id}`;
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Share link copied to clipboard!');
                  } catch (err) {
                    console.error('Failed to copy link:', err);
                    const textArea = document.createElement('textarea');
                    textArea.value = shareUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Share link copied to clipboard!');
                  }
                  setShowShareModal(false);
                  setSharingEstimate(null);
                }}
                className="px-4 py-2 bg-[#336699] hover:bg-[#2A5580] text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={() => {
                  window.open(`/share/estimate/${sharingEstimate.id}`, '_blank');
                  setShowShareModal(false);
                  setSharingEstimate(null);
                }}
                className="px-4 py-2 bg-[#EAB308] hover:bg-[#D97706] text-black rounded-lg transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};