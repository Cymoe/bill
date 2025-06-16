import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Phone, Mail, Calendar, Building, 
  Plus, Search, Filter, Edit2, Trash2, 
  ChevronDown, List, LayoutGrid, Rows3, MapPin, TrendingUp, MoreVertical, Grid3X3
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
import { ActivityLogService } from '../../services/ActivityLogService';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [internalShowNewModal, setInternalShowNewModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  
  // Use external modal state if provided, otherwise use internal state
  const showNewModal = externalShowAddModal !== undefined ? externalShowAddModal : internalShowNewModal;
  const setShowNewModal = externalSetShowAddModal ? externalSetShowAddModal : setInternalShowNewModal;
  
  console.log('🔧 ClientList render - showNewModal:', showNewModal);
  console.log('🔧 ClientList render - externalShowAddModal:', externalShowAddModal);
  console.log('🔧 ClientList render - internalShowNewModal:', internalShowNewModal);

  // Close filter menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    
    return matchesSearch && matchesStatus;
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
  };

  if (loading) {
    return viewMode === 'list' ? <TableSkeleton /> : <CardSkeleton />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-[8px] flex flex-col h-full">
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
                      </button>
                      
                      {/* Filter Menu Dropdown */}
                      {showFilterMenu && (
                        <div className={`absolute top-full left-0 mt-1 ${isConstrained ? 'right-0 left-auto w-[280px]' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-3 md:p-4`}>
                          <div className="space-y-3 md:space-y-4">
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
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === 'list' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded transition-colors ${
                          viewMode === 'grid' ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Grid View"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {!hideAddButton && (
                      <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-[8px] text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Client</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {viewMode === 'list' ? (
                  <div className="bg-[#121212] border-b border-[#333333] overflow-hidden">
                    <div className="space-y-0">
                      {filteredClients.map((client, index) => (
                        <div key={client.id} className="relative">
                          <div className="w-full text-left p-3 md:p-4 hover:bg-[#333333] transition-all border-b border-gray-700/30 group cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <div 
                                    className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer"
                                    onClick={() => navigate(`/clients/${client.id}`)}
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
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingClient(client);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                                  title="Edit client"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
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
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-[#1E1E1E] border border-[#333333] rounded-[8px] p-6 hover:bg-[#252525] transition-colors cursor-pointer group relative overflow-hidden"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        {/* Header with name and status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate mb-1">
                              {client.name}
                            </h3>
                            {client.company_name && (
                              <p className="text-sm text-gray-400 truncate">
                                {client.company_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400">
                              Active
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClient(client);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                              title="Edit client"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Contact info */}
                        <div className="space-y-2 mb-4">
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-blue-400 truncate">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-300">{client.phone}</span>
                            </div>
                          )}
                          {client.city && client.state && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-gray-300 truncate">{client.city}, {client.state}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="border-t border-[#333333] pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-400 uppercase tracking-wider">Total Value</div>
                              <div className="text-lg font-semibold text-green-400 mt-1">
                                {formatCurrency(client.totalValue || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 uppercase tracking-wider">Projects</div>
                              <div className="text-lg font-semibold text-yellow-400 mt-1">
                                {client.projectCount || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="col-span-full text-center py-12">
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
      {showNewModal && (
        <Modal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          title="Add New Client"
          size="lg"
        >
          <ClientFormSimple
            onSubmit={async (data) => {
              try {
                const { data: newClient, error } = await supabase
                  .from('clients')
                  .insert({
                    ...data,
                    user_id: user?.id,
                    organization_id: selectedOrg?.id
                  })
                  .select()
                  .single();

                if (error) throw error;

                // Log the activity
                if (newClient && selectedOrg?.id) {
                  await ActivityLogService.log({
                    organizationId: selectedOrg.id,
                    entityType: 'client',
                    entityId: newClient.id,
                    action: 'created',
                    description: ActivityLogService.buildDescription(
                      'created',
                      'client',
                      newClient.name
                    ),
                    metadata: {
                      company_name: newClient.company_name,
                      email: newClient.email,
                      phone: newClient.phone,
                      city: newClient.city,
                      state: newClient.state
                    }
                  });
                }
                
                setShowNewModal(false);
                loadClients();
              } catch (error) {
                console.error('Error creating client:', error);
              }
            }}
            onCancel={() => setShowNewModal(false)}
            submitLabel="Add Client"
          />
        </Modal>
      )}

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
    </div>
  );
};

export default ClientList;
