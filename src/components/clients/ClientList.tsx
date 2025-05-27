import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, MoreVertical, Filter, ChevronDown, Search, Plus } from 'lucide-react';
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

type Client = {
  id: string;
  name: string;
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
  
  // Filter states
  const [selectedState, setSelectedState] = useState('all');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [minProjects, setMinProjects] = useState('');
  const [maxProjects, setMaxProjects] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'projects' | 'recent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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

    // State filter
    if (selectedState !== 'all') {
      filtered = filtered.filter(client => client.state === selectedState);
    }

    // Value range filter
    if (minValue !== '') {
      filtered = filtered.filter(client => (client.totalValue || 0) >= parseFloat(minValue));
    }
    if (maxValue !== '') {
      filtered = filtered.filter(client => (client.totalValue || 0) <= parseFloat(maxValue));
    }

    // Project count filter
    if (minProjects !== '') {
      filtered = filtered.filter(client => (client.projectCount || 0) >= parseInt(minProjects));
    }
    if (maxProjects !== '') {
      filtered = filtered.filter(client => (client.projectCount || 0) <= parseInt(maxProjects));
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
  }, [clients, searchTerm, selectedDateRange, sortBy, sortOrder, selectedState, minValue, maxValue, minProjects, maxProjects]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedDateRange('all');
    setSortBy('name');
    setSortOrder('asc');
    setSearchInput('');
    setSelectedState('all');
    setMinValue('');
    setMaxValue('');
    setMinProjects('');
    setMaxProjects('');
  };

  // Get unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    const states = clients.map(c => c.state).filter(Boolean);
    return [...new Set(states)].sort();
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
    <>
      {/* Compact Header - Price Book Style */}
      <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-[#1E1E1E] rounded-[4px] transition-colors">
              <Search className="h-5 w-5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] p-2 rounded-full transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-gray-400">Clients: </span>
            <span className="text-white font-medium">{clients.length}</span>
            <span className="text-gray-500 ml-1">({formatCurrency(totalClientRevenue)})</span>
          </div>
          <div>
            <span className="text-gray-400">Avg Value: </span>
            <span className="text-[#336699] font-medium">{formatCurrency(averageClientValue)}</span>
          </div>
          <div>
            <span className="text-gray-400">Top Client: </span>
            <span className="text-[#10b981] font-medium">{formatCurrency(topClientValue)}</span>
          </div>
          <div>
            <span className="text-gray-400">Recent: </span>
            <span className="text-white font-medium">{recentClients.length} this month</span>
          </div>
        </div>
      </div>
      
      {/* Client Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#333333]">
        {/* Total Clients */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Total Clients</div>
          <div className="text-3xl font-bold text-white mb-1">{clients.length}</div>
          <div className="text-sm text-gray-400">Total Revenue: {formatCurrency(totalClientRevenue)}</div>
        </div>
        
        {/* New This Month */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#10b981]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">New This Month</div>
          <div className="text-3xl font-bold text-[#10b981] mb-1">{recentClients.length}</div>
          <div className="text-sm text-gray-400">Last 30 days</div>
        </div>
        
        {/* Average Client Value */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Avg Client Value</div>
          <div className="text-3xl font-bold text-[#3b82f6] mb-1">${averageClientValue > 0 ? (averageClientValue / 1000).toFixed(1) : '0'}k</div>
          <div className="text-sm text-gray-400">Per client lifetime</div>
        </div>
        
        {/* Top Client Value */}
        <div className="relative bg-[#1a1a1a] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#F9D71C]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Top Client</div>
          <div className="text-3xl font-bold text-[#F9D71C] mb-1">${topClientValue > 0 ? (topClientValue / 1000).toFixed(1) : '0'}k</div>
          <div className="text-sm text-gray-400">Highest value client</div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
        {/* Left side - View Mode and Primary Filter */}
        <div className="flex items-center gap-4">
          {/* View Mode Toggles - More Prominent */}
          <div className="flex bg-[#333333] border border-gray-700 rounded overflow-hidden">
            <button
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`px-4 py-2 ${viewMode === 'cards' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
          </div>

          {/* Primary Sort Filter - More Prominent */}
          <div className="relative">
            <select
              className="bg-[#232323] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#336699] appearance-none cursor-pointer pr-10 min-w-[200px]"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'value' | 'projects' | 'recent');
                setSortOrder(order as 'asc' | 'desc');
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="value-asc">Value Ascending</option>
              <option value="value-desc">Value Descending</option>
              <option value="projects-asc">Projects Ascending</option>
              <option value="projects-desc">Projects Descending</option>
              <option value="recent-asc">Recent Ascending</option>
              <option value="recent-desc">Recent Descending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>

          {/* More Filters Button */}
          <div className="relative" ref={filterMenuRef}>
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-[#232323] border border-gray-700 rounded text-white hover:bg-[#2A2A2A] transition-colors"
            >
              <Filter size={16} />
              More Filters
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#232323] border border-gray-700 rounded shadow-lg z-50">
                <div className="p-4 space-y-4">
                  {/* State Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    >
                      <option value="all">All States</option>
                      {uniqueStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Client Value Range Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Client Value Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min Value"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max Value"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Project Count Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Project Count Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min Projects"
                        value={minProjects}
                        onChange={(e) => setMinProjects(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max Projects"
                        value={maxProjects}
                        onChange={(e) => setMaxProjects(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Last Project Activity</label>
                    <select
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="1y">Last Year</option>
                      <option value="never">No Recent Projects</option>
                    </select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-between pt-2">
                    <button 
                      className="px-4 py-2 bg-[#232323] text-gray-400 rounded text-sm hover:bg-[#2A2A2A]"
                      onClick={resetFilters}
                    >
                      Reset All
                    </button>
                    <button 
                      className="px-4 py-2 bg-[#336699] text-white rounded text-sm hover:bg-[#2851A3]"
                      onClick={() => setShowFilterMenu(false)}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Options Menu */}
        <div className="flex items-center">
          <div className="relative" ref={optionsMenuRef}>
            <button
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#232323] transition-colors"
              onClick={() => setShowOptionsMenu(v => !v)}
              aria-label="More options"
            >
              <MoreVertical size={20} className="text-gray-400" />
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-[#232323] border border-gray-700 rounded shadow-lg z-50">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                  onClick={() => { setShowOptionsMenu(false); handleImportClients(); }}
                >
                  Import Clients
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                  onClick={() => { setShowOptionsMenu(false); handleExportToCSV(); }}
                >
                  Export to CSV
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                  onClick={() => { setShowOptionsMenu(false); handlePrintClients(); }}
                >
                  Print Client List
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
                <table className="min-w-full divide-y divide-[#333333]">
                  <thead className="bg-[#1E1E1E] sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                            NAME
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                        EMAIL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FFFFFF] uppercase tracking-wider font-['Roboto_Condensed'] font-bold">
                        PHONE
                      </th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#9E9E9E] font-['Roboto']">{client.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#9E9E9E] font-['Roboto_Mono'] font-medium">{client.phone}</div>
                        </td>
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

      {deletingClient && (
        <DeleteConfirmationModal
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
          onConfirm={() => handleDelete(deletingClient.id)}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </>
  );
};
