import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, MoreVertical, Filter, ChevronDown, Search, Plus, Download, Upload, Settings, BarChart3, FileText, Columns, CheckCircle, List, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ClientInput } from '../../lib/database.types';
import { Dropdown } from '../common/Dropdown';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { NewClientModal } from './NewClientModal';
import { EditClientModal } from './EditClientModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { LayoutContext } from '../layouts/DashboardLayout';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { StatsBar } from '../common/StatsBar';
import { ControlsBar } from '../common/ControlsBar';
import TabMenu from '../common/TabMenu';

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
  created_at: string;
  // Calculated fields
  totalValue?: number;
  projectCount?: number;
  lastProjectDate?: string;
};

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isConstrained, availableWidth } = useContext(LayoutContext);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // Filter states - Revenue-driven construction filters
  const [selectedClientType, setSelectedClientType] = useState('all');
  const [selectedValueTier, setSelectedValueTier] = useState('all');
  const [selectedProjectStatus, setSelectedProjectStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'projects' | 'recent'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';

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
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      const clientsData = clientsRes.data || [];
      const projectsData = projectsRes.data || [];

      // Calculate client values and project counts
      const enrichedClients = clientsData.map(client => {
        const clientProjects = projectsData.filter(p => p.client_id === client.id);
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
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.city || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Value tier filter (revenue-driven)
    if (selectedValueTier !== 'all') {
      filtered = filtered.filter(client => {
        const value = client.totalValue || 0;
        switch (selectedValueTier) {
          case 'premium': return value >= 50000;
          case 'high': return value >= 25000 && value < 50000;
          case 'medium': return value >= 10000 && value < 25000;
          case 'small': return value >= 1000 && value < 10000;
          case 'minimal': return value < 1000;
          default: return true;
        }
      });
    }

    // Project status filter (business activity)
    if (selectedProjectStatus !== 'all') {
      filtered = filtered.filter(client => {
        const projectCount = client.projectCount || 0;
        const hasRecentProject = client.lastProjectDate && 
          new Date(client.lastProjectDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days
        
        switch (selectedProjectStatus) {
          case 'active': return hasRecentProject;
          case 'completed': return projectCount > 0 && !hasRecentProject;
          case 'repeat': return projectCount > 1;
          case 'new': return projectCount === 0;
          default: return true;
        }
      });
    }

    // Payment status filter (cash flow management)
    if (selectedPaymentStatus !== 'all') {
      // This would need invoice data to be fully implemented
      // For now, we'll use value as a proxy for payment reliability
      filtered = filtered.filter(client => {
        const value = client.totalValue || 0;
        switch (selectedPaymentStatus) {
          case 'reliable': return value > 5000; // Assume higher value = more reliable
          case 'slow': return value > 0 && value <= 5000;
          case 'issues': return value === 0; // No completed paid work
          default: return true;
        }
      });
    }

    // Date range filter (last project date)
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (selectedDateRange === '30d') cutoff.setDate(now.getDate() - 30);
      if (selectedDateRange === '90d') cutoff.setDate(now.getDate() - 90);
      if (selectedDateRange === '1y') cutoff.setFullYear(now.getFullYear() - 1);
      
      filtered = filtered.filter(client => {
        if (!client.lastProjectDate) return selectedDateRange === 'never';
        return selectedDateRange !== 'never' && new Date(client.lastProjectDate) >= cutoff;
      });
    }

    // Sort clients
    return filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'value':
          aVal = a.totalValue || 0;
          bVal = b.totalValue || 0;
          break;
        case 'projects':
          aVal = a.projectCount || 0;
          bVal = b.projectCount || 0;
          break;
        case 'recent':
          aVal = a.lastProjectDate ? new Date(a.lastProjectDate).getTime() : 0;
          bVal = b.lastProjectDate ? new Date(b.lastProjectDate).getTime() : 0;
          break;
        default: // name
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [clients, searchTerm, selectedDateRange, sortBy, sortOrder, selectedClientType, selectedValueTier, selectedProjectStatus, selectedPaymentStatus, selectedLocation, selectedServiceType]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedDateRange('all');
    setSortBy('value');
    setSortOrder('desc');
    setSearchInput('');
    setSelectedClientType('all');
    setSelectedValueTier('all');
    setSelectedProjectStatus('all');
    setSelectedPaymentStatus('all');
    setSelectedLocation('all');
    setSelectedServiceType('all');
  };

  // Calculate client metrics for revenue-driven insights
  const clientMetrics = useMemo(() => {
    const premiumClients = clients.filter(c => (c.totalValue || 0) >= 50000).length;
    const activeClients = clients.filter(c => {
      const hasRecentProject = c.lastProjectDate && 
        new Date(c.lastProjectDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return hasRecentProject;
    }).length;
    const repeatClients = clients.filter(c => (c.projectCount || 0) > 1).length;
    
    return { premiumClients, activeClients, repeatClients };
  }, [clients]);

  // Helper functions for options menu
  const handleImportClients = () => {
    console.log('Import clients clicked');
  };

  const handleExportToCSV = () => {
    console.log('Export to CSV clicked');
  };

  const handlePrintClients = () => {
    console.log('Print clients clicked');
  };

  const handleSave = async (clientData: ClientInput) => {
    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user?.id
        });

      if (error) throw error;
      setShowNewModal(false);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error('Error creating client:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDeletingClient(null);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Calculate summary metrics
  const recentClients = clients.filter(client => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(client.created_at) >= thirtyDaysAgo;
  });

  // We'll need to fetch invoices to calculate client values
  const [invoices, setInvoices] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  // Calculate client values
  const clientValues = useMemo(() => {
    const values = new Map<string, number>();
    
    invoices.forEach(invoice => {
      const currentValue = values.get(invoice.client_id) || 0;
      values.set(invoice.client_id, currentValue + invoice.amount);
    });
    
    return values;
  }, [invoices]);

  const totalClientRevenue = Array.from(clientValues.values()).reduce((sum, value) => sum + value, 0);
  const averageClientValue = clientValues.size > 0 ? totalClientRevenue / clientValues.size : 0;
  const topClientValue = clientValues.size > 0 ? Math.max(...Array.from(clientValues.values())) : 0;

  // Check if user is new (no clients and account created recently)
  const isNewUser = clients.length === 0 && user?.created_at && 
    new Date().getTime() - new Date(user.created_at).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  // Contextual Onboarding Component
  const ContextualOnboarding = () => {
    // Show onboarding if no clients OR if tutorial=true in URL
    if (clients.length > 0 && !showTutorial) return null;

    return (
      <div className="max-w-4xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Client Management</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your clients are the foundation of your business. Let's get you set up with your first client 
            so you can start tracking projects, sending invoices, and growing your revenue.
          </p>
        </div>

        {/* Video Section */}
        <div className="mb-8">
          <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center">
                <span className="text-[#336699] mr-2">🎥</span>
                Watch: Client Management Walkthrough
              </h3>
              <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">3 min</span>
            </div>
            
            {/* Video Embed Container */}
            <div className="relative w-full h-0 pb-[56.25%] bg-[#333333] rounded-[4px] overflow-hidden">
              {/* Replace this iframe src with your actual Loom video URL */}
              <iframe
                src="https://www.loom.com/embed/0c9786a7fd61445bbb23b6415602afe4"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                title="Client Management Walkthrough"
              ></iframe>
              
              {/* Placeholder for when no video is set */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl">▶</span>
                  </div>
                  <p className="text-gray-400 text-sm">Video coming soon</p>
                  <p className="text-gray-500 text-xs">Replace iframe src with your Loom URL</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mt-3">
              Watch me walk through setting up your first client and explain how client management 
              works in real construction businesses.
            </p>
          </div>
        </div>

        {/* Quick Start Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Step 1 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#336699]">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#336699] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                1
              </div>
              <h3 className="text-white font-bold">Add Your First Client</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Start by adding a client you're currently working with or planning to work with.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="w-full bg-[#336699] text-white py-2 px-4 rounded-[4px] hover:bg-[#2A5580] transition-colors font-medium"
            >
              ADD CLIENT
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                2
              </div>
              <h3 className="text-gray-400 font-bold">Create a Project</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Once you have a client, create your first project to start tracking progress and costs.
            </p>
            <button
              disabled
              className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium"
            >
              COMING NEXT
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                3
              </div>
              <h3 className="text-gray-400 font-bold">Send an Invoice</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Generate professional invoices and start getting paid for your work.
            </p>
            <button
              disabled
              className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium"
            >
              COMING NEXT
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
          <h3 className="text-white font-bold mb-4 flex items-center">
            <span className="text-[#F9D71C] mr-2">💡</span>
            Pro Tips for Client Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Keep detailed contact info</p>
                  <p className="text-gray-400 text-xs">Include phone, email, and full address for easy communication</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Track project history</p>
                  <p className="text-gray-400 text-xs">See all past projects and total value per client</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Use filters and search</p>
                  <p className="text-gray-400 text-xs">Quickly find clients by location, value, or project count</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Monitor client value</p>
                  <p className="text-gray-400 text-xs">Track total revenue and identify your best clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Option */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-4">
            Already have clients in another system?
          </p>
          <button
            onClick={handleImportClients}
            className="text-[#336699] hover:text-white transition-colors font-medium text-sm"
          >
            IMPORT FROM CSV →
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <PageHeaderBar
        title="Clients"
        searchPlaceholder="Search clients..."
        onSearch={(query) => setSearchInput(query)}
        searchValue={searchInput}
        addButtonLabel="Add Client"
        onAddClick={() => setShowNewModal(true)}
      />
        
      {/* Stats Bar */}
      <StatsBar 
        stats={[
          { label: 'Total Revenue', value: formatCurrency(totalClientRevenue), color: 'green', isMonospace: true },
          { label: 'Premium Clients', value: clientMetrics.premiumClients, subValue: '($50k+)', color: 'yellow', isMonospace: true },
          { label: 'Active', value: clientMetrics.activeClients, subValue: '(90 days)', color: 'default', isMonospace: true },
          { label: 'Repeat', value: clientMetrics.repeatClients, subValue: '(2+ jobs)', color: 'default', isMonospace: true }
        ]}
      />

      {/* Controls Bar */}
      <ControlsBar
        primaryFilter={{
          value: selectedValueTier,
          onChange: setSelectedValueTier,
          options: [
            { id: 'all', label: 'All Clients', count: clients.length },
            { id: 'premium', label: 'Premium ($50k+)' },
            { id: 'high', label: 'High Value ($25k-50k)' },
            { id: 'medium', label: 'Medium ($10k-25k)' },
            { id: 'small', label: 'Small Jobs ($1k-10k)' },
            { id: 'minimal', label: 'Leads (Under $1k)' }
          ]
        }}
        showMoreFilters={showFilterMenu}
        onToggleMoreFilters={() => setShowFilterMenu(!showFilterMenu)}
        moreFiltersRef={filterMenuRef}
        moreFiltersContent={
          <div className="space-y-4">
            {/* Project Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Project Status
              </label>
              <select
                className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                value={selectedProjectStatus}
                onChange={(e) => setSelectedProjectStatus(e.target.value)}
              >
                <option value="all">All Clients</option>
                <option value="active">Active Projects (Last 90 Days)</option>
                <option value="completed">Completed Work Only</option>
                <option value="repeat">Repeat Clients (2+ Projects)</option>
                <option value="new">New Leads (No Projects)</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Payment Reliability
              </label>
              <select
                className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                <option value="all">All Payment Types</option>
                <option value="reliable">Reliable Payers ($5k+ History)</option>
                <option value="slow">Small Job Clients</option>
                <option value="issues">No Payment History</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Last Activity
              </label>
              <select
                className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="pt-2 border-t border-[#333333]">
              <button
                onClick={() => {
                  resetFilters();
                  setShowFilterMenu(false);
                }}
                className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 rounded-[4px] text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        }
        viewToggles={{
          value: viewMode,
          onChange: (value: string) => setViewMode(value as 'list' | 'cards'),
          options: [
            { id: 'list', label: 'List', icon: <List className="w-4 h-4" /> },
            { id: 'cards', label: 'Cards', icon: <LayoutGrid className="w-4 h-4" /> }
          ]
        }}
        showOptionsMenu={showOptionsMenu}
        onToggleOptionsMenu={() => setShowOptionsMenu(!showOptionsMenu)}
        optionsMenuRef={optionsMenuRef}
        optionsMenuSections={[
          {
            title: 'Data Management',
            actions: [
              {
                id: 'import',
                label: 'Import Clients',
                icon: <Upload className="w-3 h-3" />,
                onClick: () => {
                  handleImportClients();
                  setShowOptionsMenu(false);
                }
              },
              {
                id: 'export',
                label: 'Export to CSV',
                icon: <Download className="w-3 h-3" />,
                onClick: () => {
                  handleExportToCSV();
                  setShowOptionsMenu(false);
                }
              }
            ]
          },
          {
            title: 'View Options',
            actions: [
              {
                id: 'print',
                label: 'Print Client List',
                icon: <FileText className="w-3 h-3" />,
                onClick: () => {
                  handlePrintClients();
                  setShowOptionsMenu(false);
                }
              }
            ]
          }
        ]}
      />

      <div className="space-y-0 bg-[#121212]">
      {/* Show contextual onboarding if no clients and not loading */}
      {!isLoading && (clients.length === 0 || showTutorial) ? (
        <ContextualOnboarding />
      ) : (
        <>
          {/* Desktop view */}
        <div className="hidden md:block">
          {isLoading ? (
                viewMode === 'list' ? (
            <TableSkeleton rows={5} columns={4} />
          ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                )
              ) : viewMode === 'list' ? (
            <div className="bg-[#121212] rounded-[4px] shadow overflow-hidden">
              <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                <table className={`min-w-full divide-y divide-[#333333] ${isConstrained ? 'text-sm' : ''}`}>
                  <thead className="bg-[#1E1E1E] sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                            NAME
                      </th>
                      {!isConstrained && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                          EMAIL
                        </th>
                      )}
                      {!isConstrained && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                          PHONE
                        </th>
                      )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                            VALUE
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                            PROJECTS
                          </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#121212] divide-y divide-[#333333]">
                    {filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#FFFFFF] font-['Roboto']">
                                {client.name}
                              </div>
                              <div className="text-xs text-[#9E9E9E] font-['Roboto']">
                                {client.city && client.state ? `${client.city}, ${client.state}` : ''}
                          </div>
                        </td>
                        {!isConstrained && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#9E9E9E] font-['Roboto']">{client.email}</div>
                          </td>
                        )}
                        {!isConstrained && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#9E9E9E] font-['Roboto_Mono'] font-medium">{client.phone}</div>
                          </td>
                        )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[#388E3C] font-['Roboto_Mono']">
                                {formatCurrency(client.totalValue || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[#336699] font-['Roboto_Mono'] font-medium">
                                {client.projectCount || 0}
                              </div>
                            </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Dropdown
                            trigger={
                                  <button className="text-[#9E9E9E] hover:text-[#F9D71C] p-1">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            }
                            items={[
                              {
                                label: 'Edit',
                                    onClick: () => setEditingClient(client)
                              },
                              {
                                label: 'Delete',
                                onClick: () => setDeletingClient(client),
                                    className: 'text-[#D32F2F] hover:bg-[#D32F2F]/10 hover:text-[#D32F2F]'
                                  }
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              ) : (
                /* Cards View */
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="bg-[#333333] rounded-[4px] shadow-lg border border-[#404040] hover:border-[#336699] transition-colors"
                      >
                        {/* Card Header */}
                        <div className="p-6 border-b border-[#404040]">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-[#FFFFFF] font-['Roboto_Condensed'] uppercase mb-1">
                                {client.name}
                              </h3>
                              <p className="text-sm text-[#9E9E9E] font-['Roboto']">
                                {client.city && client.state ? `${client.city}, ${client.state}` : 'Location not specified'}
                              </p>
                            </div>
                            <Dropdown
                              trigger={
                                <button className="ml-4 p-2 text-[#9E9E9E] hover:text-[#F9D71C] hover:bg-[#404040] rounded transition-colors">
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                              }
                              items={[
                                {
                                  label: 'Edit',
                                  onClick: () => setEditingClient(client)
                                },
                                {
                                  label: 'Delete',
                                  onClick: () => setDeletingClient(client),
                                  className: 'text-[#D32F2F] hover:bg-[#D32F2F]/10 hover:text-[#D32F2F]'
                                }
                              ]}
                            />
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          {/* Contact Info */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center">
                              <span className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide w-16">Email:</span>
                              <span className="text-sm text-[#336699] font-['Roboto'] ml-2">{client.email}</span>
                            </div>
                            {client.phone && (
                              <div className="flex items-center">
                                <span className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide w-16">Phone:</span>
                                <span className="text-sm text-[#FFFFFF] font-['Roboto_Mono'] ml-2">{client.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#2A2A2A] rounded-[4px] p-4 border-l-4 border-[#388E3C]">
                              <div className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide mb-1">Total Value</div>
                              <div className="text-lg font-bold text-[#388E3C] font-['Roboto_Mono']">
                                {formatCurrency(client.totalValue || 0)}
                              </div>
                            </div>
                            <div className="bg-[#2A2A2A] rounded-[4px] p-4 border-l-4 border-[#336699]">
                              <div className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide mb-1">Projects</div>
                              <div className="text-lg font-bold text-[#336699] font-['Roboto_Mono']">
                                {client.projectCount || 0}
                              </div>
                            </div>
                          </div>

                          {/* Last Activity */}
                          {client.lastProjectDate && (
                            <div className="mt-4 pt-4 border-t border-[#404040]">
                              <div className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide mb-1">Last Project</div>
                              <div className="text-sm text-[#FFFFFF] font-['Roboto']">
                                {new Date(client.lastProjectDate).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          )}
        </div>

        {/* Mobile list */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
                <div className="space-y-4 p-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-[#333333] rounded-[4px] shadow p-4 border-l-4 border-[#336699]"
                >
                      <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#FFFFFF] font-['Roboto_Condensed'] uppercase">
                            {client.name}
                      </h3>
                      <p className="text-xs text-[#9E9E9E] font-['Roboto'] mt-1">
                            {client.city && client.state ? `${client.city}, ${client.state}` : 'Location not specified'}
                      </p>
                      <span className="text-sm text-[#336699] mt-2 block font-['Roboto']">
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="text-xs text-[#9E9E9E] mt-1 block font-['Roboto_Mono'] font-medium">
                          {client.phone}
                        </span>
                      )}
                    </div>
                    <Dropdown
                      trigger={
                        <button className="ml-4 p-1 text-[#9E9E9E] hover:text-[#F9D71C]">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      }
                      items={[
                        {
                          label: 'Edit',
                          onClick: () => setEditingClient(client)
                        },
                        {
                          label: 'Delete',
                          onClick: () => setDeletingClient(client),
                          className: 'text-[#D32F2F] hover:bg-[#D32F2F]/10 hover:text-[#D32F2F]'
                        }
                      ]}
                    />
                  </div>
                      
                      {/* Mobile Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#2A2A2A] rounded-[4px] p-3 border-l-4 border-[#388E3C]">
                          <div className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide mb-1">Value</div>
                          <div className="text-sm font-bold text-[#388E3C] font-['Roboto_Mono']">
                            {formatCurrency(client.totalValue || 0)}
                          </div>
                        </div>
                        <div className="bg-[#2A2A2A] rounded-[4px] p-3 border-l-4 border-[#336699]">
                          <div className="text-xs text-[#9E9E9E] font-['Roboto'] uppercase tracking-wide mb-1">Projects</div>
                          <div className="text-sm font-bold text-[#336699] font-['Roboto_Mono']">
                            {client.projectCount || 0}
                          </div>
                        </div>
                      </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {showNewModal && (
        <NewClientModal
          onClose={() => setShowNewModal(false)}
          onSave={handleSave}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={() => setEditingClient(null)}
        />
      )}

      {showNewModal && (
        <NewClientModal
          onClose={() => setShowNewModal(false)}
          onSave={handleSave}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSave={() => setEditingClient(null)}
        />
      )}

      {deletingClient && (
        <DeleteConfirmationModal
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
          onConfirm={() => handleDelete(deletingClient.id)}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
};
