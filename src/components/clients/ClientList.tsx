import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Phone, Mail, Calendar, Building, 
  Plus, Search, Filter, Edit2, Trash2, Eye,
  ChevronDown, List, LayoutGrid, Rows3, MapPin, TrendingUp, MoreVertical,
  Download, FileText, FileSpreadsheet, Upload, Sparkles, FileImage, Mic, Link2, Merge
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { advancedSearch, SearchableField } from '../../utils/searchUtils';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { supabase } from '../../lib/supabase';
import { Modal } from '../common/Modal';
import { ClientFormSimple } from './ClientFormSimple';
import { EditClientDrawer } from './EditClientDrawer';
import { CreateClientModal } from './CreateClientModal';
import { ActivityLogService } from '../../services/ActivityLogService';
import { ClientExportService } from '../../services/ClientExportService';
import { ClientImportService } from '../../services/ClientImportService';
import { DuplicateDetectionModal } from './DuplicateDetectionModal';

type Client = {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  user_id: string;
  organization_id: string;
  created_at: string;
  // Calculated fields
  totalValue?: number;
  projectCount?: number;
  lastProjectDate?: string;
};

interface ClientListProps {
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  hideAddButton?: boolean;
  searchTerm?: string;
}

export const ClientList: React.FC<ClientListProps> = ({ 
  showAddModal: externalShowAddModal, 
  setShowAddModal: externalSetShowAddModal, 
  hideAddButton = false,
  searchTerm = ''
}) => {
  const { user } = useAuth();
  const { isConstrained } = useContext(LayoutContext);
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('compact');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'value' | 'projects'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterByCity, setFilterByCity] = useState<string>('all');
  const [filterByValue, setFilterByValue] = useState<string>('all');
  const [internalShowNewModal, setInternalShowNewModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showQuickImportMenu, setShowQuickImportMenu] = useState(false);
  const [showDuplicateDetection, setShowDuplicateDetection] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const quickImportMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Use external modal state if provided, otherwise use internal state
  const showNewModal = externalShowAddModal !== undefined ? externalShowAddModal : internalShowNewModal;
  const setShowNewModal = externalSetShowAddModal ? externalSetShowAddModal : setInternalShowNewModal;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside filter menu
      if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
        setShowFilterMenu(false);
      }
      
      // Check if click is outside options menu
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(target)) {
        setShowOptionsMenu(false);
      }
      
      // Check if click is outside quick import menu
      if (quickImportMenuRef.current && !quickImportMenuRef.current.contains(target)) {
        setShowQuickImportMenu(false);
      }
      
      // Check if click is outside all dropdown menus
      const isOutsideDropdown = Object.values(dropdownRefs.current).every(ref => 
        !ref || !ref.contains(target)
      );
      
      if (isOutsideDropdown && openDropdownId) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  // Load clients from database
  const loadClients = async () => {
    if (!selectedOrg?.id) {
      setClients([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrg.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Load projects to calculate stats
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', selectedOrg.id);

      if (projectsError) throw projectsError;

      // Calculate client values and project counts
      const enrichedClients = (clientsData || []).map(client => {
        const clientProjects = (projectsData || []).filter(p => p.client_id === client.id);
        const totalValue = clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const lastProject = clientProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        return {
          ...client,
          totalValue,
          projectCount: clientProjects.length,
          lastProjectDate: lastProject?.created_at || null
        };
      });

      setClients(enrichedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [selectedOrg?.id]);

  // Get unique cities for filter
  const uniqueCities = [...new Set(clients.map(c => c.city).filter(Boolean))].sort();

  const filteredClients = clients.filter(client => {
    // Advanced search filter
    let matchesSearch = true;
    if (searchTerm) {
      const searchableFields: SearchableField[] = [
        { 
          key: 'name', 
          weight: 2.0, // Higher weight for client names
          transform: (client) => client.name || ''
        },
        { 
          key: 'company_name', 
          weight: 1.5, // High weight for company names
          transform: (client) => client.company_name || ''
        },
        { 
          key: 'email', 
          weight: 1.2,
          transform: (client) => client.email || ''
        },
        { 
          key: 'phone', 
          weight: 0.8,
          transform: (client) => client.phone || ''
        },
        { 
          key: 'city', 
          weight: 0.6,
          transform: (client) => client.city || ''
        },
        { 
          key: 'total_value', 
          weight: 1.0,
          transform: (client) => formatCurrency(client.totalValue || 0)
        }
      ];

      const searchResults = advancedSearch([client], searchTerm, searchableFields, {
        minScore: 0.2, // Lower threshold for more inclusive results
        requireAllTerms: false // Allow partial matches
      });

      matchesSearch = searchResults.length > 0;
    }
    
    let matchesStatus = true;
    if (selectedStatus !== 'all') {
      const hasRecentProject = !!(client.lastProjectDate && 
        new Date(client.lastProjectDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
      
      switch (selectedStatus) {
        case 'active':
          matchesStatus = hasRecentProject;
          break;
        case 'completed':
          matchesStatus = (client.projectCount || 0) > 0 && !hasRecentProject;
          break;
        case 'new':
          matchesStatus = (client.projectCount || 0) === 0;
          break;
      }
    }
    
    // City filter
    let matchesCity = true;
    if (filterByCity !== 'all') {
      matchesCity = client.city === filterByCity;
    }
    
    // Value filter
    let matchesValue = true;
    if (filterByValue !== 'all') {
      const value = client.totalValue || 0;
      switch (filterByValue) {
        case 'high':
          matchesValue = value >= 100000;
          break;
        case 'medium':
          matchesValue = value >= 10000 && value < 100000;
          break;
        case 'low':
          matchesValue = value < 10000;
          break;
        case 'none':
          matchesValue = value === 0;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesCity && matchesValue;
  }).sort((a, b) => {
    // Apply sorting
    let result = 0;
    switch (sortBy) {
      case 'name':
        result = (a.name || '').localeCompare(b.name || '');
        break;
      case 'recent':
        result = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      case 'value':
        result = (b.totalValue || 0) - (a.totalValue || 0);
        break;
      case 'projects':
        result = (b.projectCount || 0) - (a.projectCount || 0);
        break;
    }
    
    return sortOrder === 'asc' ? result : -result;
  });

  // Calculate metrics
  const activeClients = clients.filter(c => {
    const hasRecentProject = !!(c.lastProjectDate && 
      new Date(c.lastProjectDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    return hasRecentProject;
  }).length;
  
  const totalValue = clients.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const totalProjects = clients.reduce((sum, c) => sum + (c.projectCount || 0), 0);
  const repeatClients = clients.filter(c => (c.projectCount || 0) > 1).length;

  const resetFilters = () => {
    setSelectedStatus('all');
    setSortBy('recent');
    setSortOrder('desc');
    setFilterByCity('all');
    setFilterByValue('all');
  };

  const handleDeleteClick = (client: Client) => {
    setDeletingClient(client);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClient) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deletingClient.id);

      if (error) throw error;

      // Log the activity
      if (deletingClient.organization_id) {
        await ActivityLogService.log({
          organizationId: deletingClient.organization_id,
          entityType: 'client',
          entityId: deletingClient.id,
          action: 'deleted',
          description: `deleted client ${deletingClient.name}`,
          metadata: {
            client_name: deletingClient.name,
            company_name: deletingClient.company_name,
            email: deletingClient.email
          }
        });
      }

      await loadClients();
      setShowDeleteConfirm(false);
      setDeletingClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingClient(null);
  };

  const handleExportToCSV = async () => {
    try {
      await ClientExportService.exportToCSV(filteredClients);
      console.log('CSV export completed');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV');
    }
  };

  const handleExportToExcel = async () => {
    try {
      await ClientExportService.exportToExcel(filteredClients);
      console.log('Excel export completed');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const handleImportClients = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedOrg?.id) return;
      
      try {
        const result = await ClientExportService.importFromFile(file, selectedOrg.id);
        
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
          alert(`Import completed with errors:\n- ${result.success} clients imported successfully\n- ${result.errors.length} errors\n\nCheck console for details.`);
        } else {
          alert(`Successfully imported ${result.success} clients!`);
        }
        
        // Refresh the clients list
        await loadClients();
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Failed to import file. Please check the format and try again.');
      }
    };
    input.click();
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-transparent border border-[#333333] rounded-[8px] flex flex-col h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col">
              {/* Stats Section */}
              <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
                {isConstrained ? (
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">CLIENTS</div>
                      <div className="text-base font-semibold mt-1">{clients.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">ACTIVE</div>
                      <div className="text-base font-semibold text-green-400 mt-1">{activeClients}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">VALUE</div>
                      <div className="text-base font-semibold text-blue-400 mt-1">{formatCurrency(totalValue)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">PROJECTS</div>
                      <div className="text-base font-semibold text-yellow-400 mt-1">{totalProjects}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL CLIENTS</div>
                      <div className="text-lg font-semibold mt-1">{clients.length}</div>
                      <div className="text-xs text-gray-500">business relationships</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">ACTIVE</div>
                      <div className="text-lg font-semibold text-green-400 mt-1">{activeClients}</div>
                      <div className="text-xs text-gray-500">recent projects</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL VALUE</div>
                      <div className="text-lg font-semibold text-blue-400 mt-1">{formatCurrency(totalValue)}</div>
                      <div className="text-xs text-gray-500">project revenue</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">REPEAT CLIENTS</div>
                      <div className="text-lg font-semibold text-yellow-400 mt-1">{repeatClients}</div>
                      <div className="text-xs text-gray-500">multiple projects</div>
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
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">All Clients ({clients.length})</option>
                        <option value="active">Active ({activeClients})</option>
                        <option value="completed">Completed</option>
                        <option value="new">New</option>
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
                        {(selectedStatus !== 'all' || filterByCity !== 'all' || filterByValue !== 'all' || sortBy !== 'recent') && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-[#336699] text-white text-xs rounded-full">
                            {[
                              selectedStatus !== 'all' && 'Status',
                              filterByCity !== 'all' && 'City', 
                              filterByValue !== 'all' && 'Value',
                              sortBy !== 'recent' && 'Sort'
                            ].filter(Boolean).length}
                          </span>
                        )}
                      </button>
                      
                      {/* Filter Menu Dropdown */}
                      {showFilterMenu && (
                        <div className={`absolute top-full left-0 mt-1 ${isConstrained ? 'right-0 left-auto w-[280px]' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-3 md:p-4`}>
                          <div className="space-y-3 md:space-y-4">
                            {/* Sort By */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                                Sort By
                              </label>
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full bg-[#2a2a2a] border border-[#404040] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                              >
                                <option value="recent">Recently Added</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="value">Total Value</option>
                                <option value="projects">Project Count</option>
                              </select>
                            </div>

                            {/* Sort Order */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSortOrder('asc')}
                                className={`flex-1 px-3 py-2 rounded-[4px] text-sm font-medium transition-colors ${
                                  sortOrder === 'asc' 
                                    ? 'bg-[#336699] text-white' 
                                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                                }`}
                              >
                                Ascending
                              </button>
                              <button
                                onClick={() => setSortOrder('desc')}
                                className={`flex-1 px-3 py-2 rounded-[4px] text-sm font-medium transition-colors ${
                                  sortOrder === 'desc' 
                                    ? 'bg-[#336699] text-white' 
                                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                                }`}
                              >
                                Descending
                              </button>
                            </div>

                            {/* Filter by City */}
                            {uniqueCities.length > 0 && (
                              <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                                  City
                                </label>
                                <select
                                  value={filterByCity}
                                  onChange={(e) => setFilterByCity(e.target.value)}
                                  className="w-full bg-[#2a2a2a] border border-[#404040] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                                >
                                  <option value="all">All Cities</option>
                                  {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Filter by Value */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                                Project Value
                              </label>
                              <select
                                value={filterByValue}
                                onChange={(e) => setFilterByValue(e.target.value)}
                                className="w-full bg-[#2a2a2a] border border-[#404040] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                              >
                                <option value="all">All Values</option>
                                <option value="high">High ($100k+)</option>
                                <option value="medium">Medium ($10k-$100k)</option>
                                <option value="low">Low (&lt; $10k)</option>
                                <option value="none">No Projects</option>
                              </select>
                            </div>

                            {/* Active Filters Count */}
                            {(selectedStatus !== 'all' || filterByCity !== 'all' || filterByValue !== 'all' || sortBy !== 'recent') && (
                              <div className="bg-[#336699]/20 border border-[#336699]/30 rounded-[4px] px-3 py-2">
                                <p className="text-xs text-[#66aaff]">
                                  {[
                                    selectedStatus !== 'all' && 'Status',
                                    filterByCity !== 'all' && 'City',
                                    filterByValue !== 'all' && 'Value',
                                    sortBy !== 'recent' && 'Sort'
                                  ].filter(Boolean).length} active filters
                                </p>
                              </div>
                            )}

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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('compact')}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === 'compact' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Compact View"
                      >
                        <Rows3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === 'list' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="relative" ref={optionsMenuRef}>
                      <button
                        onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                        className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showOptionsMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] py-2">
                          <button
                            onClick={handleImportClients}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Import Clients
                          </button>
                          {/* Duplicate detection removed - needs proper implementation for existing clients */}
                          {/* <button
                            onClick={() => {
                              setShowDuplicateDetection(true);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                          >
                            <Merge className="w-4 h-4" />
                            Find Duplicates
                          </button> */}
                          <div className="border-t border-[#333333] my-1" />
                          <button
                            onClick={handleExportToCSV}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Export to CSV
                          </button>
                          <button
                            onClick={handleExportToExcel}
                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export to Excel
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {!hideAddButton && (
                      <>
                        <div className="relative" ref={quickImportMenuRef}>
                          <button
                            onClick={() => setShowQuickImportMenu(!showQuickImportMenu)}
                            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-3 py-2 rounded-[8px] text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                          >
                            <Sparkles className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {showQuickImportMenu && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] py-2 rounded-lg">
                              <button
                                onClick={() => {
                                  setShowQuickImportMenu(false);
                                  // Open modal with voice mode
                                  setShowNewModal(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 flex items-center gap-3 transition-colors"
                              >
                                <Mic className="w-4 h-4 text-yellow-400" />
                                <div>
                                  <p className="font-medium">Voice Entry</p>
                                  <p className="text-xs text-gray-400">Speak to add clients</p>
                                </div>
                              </button>
                              <button
                                onClick={() => {
                                  setShowQuickImportMenu(false);
                                  // Open modal with scan mode
                                  setShowNewModal(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 flex items-center gap-3 transition-colors"
                              >
                                <FileImage className="w-4 h-4 text-purple-400" />
                                <div>
                                  <p className="font-medium">Scan Cards</p>
                                  <p className="text-xs text-gray-400">Upload business cards</p>
                                </div>
                              </button>
                              <button
                                onClick={() => {
                                  setShowQuickImportMenu(false);
                                  // Open modal with AI mode
                                  setShowNewModal(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 flex items-center gap-3 transition-colors"
                              >
                                <Mail className="w-4 h-4 text-blue-400" />
                                <div>
                                  <p className="font-medium">Email Import</p>
                                  <p className="text-xs text-gray-400">Parse email threads</p>
                                </div>
                              </button>
                              <button
                                onClick={() => {
                                  setShowQuickImportMenu(false);
                                  // Open modal with integration mode
                                  setShowNewModal(true);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 flex items-center gap-3 transition-colors"
                              >
                                <Link2 className="w-4 h-4 text-green-400" />
                                <div>
                                  <p className="font-medium">Integrations</p>
                                  <p className="text-xs text-gray-400">QuickBooks, Procore</p>
                                </div>
                              </button>
                              <div className="border-t border-[#333333] my-2" />
                              <button
                                onClick={() => {
                                  setShowQuickImportMenu(false);
                                  setShowNewModal(true);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-[#333333] flex items-center gap-3 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                                Manual Entry
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => setShowNewModal(true)}
                          className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-[8px] text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Client</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {viewMode === 'compact' ? (
                  <div className="bg-[#121212] border-b border-[#333333] overflow-hidden">
                    <div className="space-y-0">
                      {filteredClients.map((client, index) => (
                        <div key={client.id} className="relative">
                          <div 
                            className="w-full text-left p-2 hover:bg-[#333333] transition-all border-b border-gray-700/30 group cursor-pointer"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <div 
                                    className="text-sm font-medium text-white hover:text-blue-400 truncate"
                                  >
                                    {client.name}
                                  </div>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-400/10 text-green-400 flex-shrink-0">
                                    Active
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  {client.company_name && <span className="truncate">{client.company_name}</span>}
                                  {client.city && client.state && <span className="flex-shrink-0">{client.city}, {client.state}</span>}
                                  {client.email && <span className="text-blue-400 truncate">{client.email}</span>}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-400">
                                    {formatCurrency(client.totalValue || 0)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {client.projectCount || 0} projects
                                  </div>
                                </div>
                                
                                <div className="relative" ref={(el) => dropdownRefs.current[client.id] = el}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                                    title="More options"
                                  >
                                    <MoreVertical className="w-3 h-3 text-gray-400" />
                                  </button>
                                  
                                  {openDropdownId === client.id && (
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#2A2A2A] border border-[#404040] shadow-lg z-[10001] py-1 rounded-[4px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/clients/${client.id}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <Eye className="w-3 h-3 mr-2" />
                                        View Details
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingClient(client);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <Edit2 className="w-3 h-3 mr-2" />
                                        Edit
                                      </button>
                                      <div className="border-t border-[#404040] my-1"></div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(client);
                                        }}
                                        className="w-full text-left px-3 py-2 text-red-400 text-xs hover:bg-red-600/20 transition-colors flex items-center"
                                      >
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredClients.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">No clients match your filters</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#121212] border-b border-[#333333] overflow-hidden">
                    <div className="space-y-0">
                      {filteredClients.map((client, index) => (
                        <div key={client.id} className="relative">
                          <div 
                            className="w-full text-left p-3 md:p-4 hover:bg-[#333333] transition-all border-b border-gray-700/30 group cursor-pointer"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div 
                                    className="text-sm font-medium text-white hover:text-blue-400"
                                  >
                                    {client.name}
                                  </div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-400/10 text-green-400">
                                    Active
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-1">
                                  {client.company_name && <span>{client.company_name}</span>}
                                  {client.city && client.state && <span>{client.city}, {client.state}</span>}
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  {client.email && <span className="text-blue-400">{client.email}</span>}
                                  {client.phone && <span>{client.phone}</span>}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-green-400">
                                    {formatCurrency(client.totalValue || 0)}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {client.projectCount || 0} projects
                                  </div>
                                </div>
                                
                                <div className="relative" ref={(el) => dropdownRefs.current[client.id] = el}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === client.id ? null : client.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                                    title="More options"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                  </button>
                                  
                                  {openDropdownId === client.id && (
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-[#2A2A2A] border border-[#404040] shadow-lg z-[10001] py-1 rounded-[4px]">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/clients/${client.id}`);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <Eye className="w-3 h-3 mr-2" />
                                        View Details
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingClient(client);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-[#336699] transition-colors flex items-center"
                                      >
                                        <Edit2 className="w-3 h-3 mr-2" />
                                        Edit
                                      </button>
                                      <div className="border-t border-[#404040] my-1"></div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(client);
                                        }}
                                        className="w-full text-left px-3 py-2 text-red-400 text-xs hover:bg-red-600/20 transition-colors flex items-center"
                                      >
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {filteredClients.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">No clients match your filters</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateClientModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onClientCreated={(newClient) => {
          if (newClient) {
            // Add the new client to the list immediately (optimistic update)
            setClients(prevClients => {
              // Calculate values for the new client
              const enrichedClient = {
                ...newClient,
                totalValue: 0,
                projectCount: 0,
                lastProjectDate: null
              };
              return [enrichedClient, ...prevClients];
            });
          } else {
            // Fallback to full reload if no client data returned
            loadClients();
          }
        }}
      />

      {editingClient && (
        <EditClientDrawer
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => {
            loadClients();
            setEditingClient(null);
          }}
          onDelete={(clientId) => {
            setClients(clients.filter(c => c.id !== clientId));
            setEditingClient(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0a0a] rounded-xl max-w-md w-full border border-white/10 shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Client</h3>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete "{deletingClient?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDeleteCancel}
                  className="h-12 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="h-12 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all font-medium flex items-center gap-3 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Detection Modal - Commented out until proper implementation for existing clients */}
      {/* <DuplicateDetectionModal
        isOpen={showDuplicateDetection}
        onClose={() => setShowDuplicateDetection(false)}
        newClients={[]} // No new clients to check - this is for finding duplicates in existing list
        existingClients={clients}
        onProceed={(clientsToImport, clientsToMerge) => {
          // Handle the results
          console.log('Clients to import:', clientsToImport);
          console.log('Clients to merge:', clientsToMerge);
          setShowDuplicateDetection(false);
          loadClients();
        }}
      /> */}
    </div>
  );
};

export default ClientList;
