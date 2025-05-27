import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, ChevronRight, Share2, Copy, Filter, MoreVertical, ChevronDown, Calendar, DollarSign, FileText, Clock, CheckCircle, AlertCircle, Search, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import TabMenu from '../common/TabMenu';
import { NewInvoiceModal } from './NewInvoiceModal';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { Dropdown } from '../common/Dropdown';
import { exportInvoicesToCSV } from '../../utils/exportData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../common/PageHeader';
import InvoiceDetailsDrawer from './InvoiceDetailsDrawer';
import { NewButton } from '../common/NewButton';

type Invoice = {
  id: string;
  number: string;
  client_id: string;
  date: string;
  issue_date: string;
  due_date: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  amount: number;
  user_id: string;
  created_at: string;
};
type InvoiceStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';

export const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [paidPeriod, setPaidPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // Advanced filter states
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [amountSort, setAmountSort] = useState<'asc' | 'desc'>('desc');
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
      const [invoicesRes, clientsRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', user?.id),
        supabase
          .from('products')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;

      setInvoices(invoicesRes.data || []);
      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((invoice) => {
    const displayNumber = `INV-${invoice.id.slice(0, 8)}`;
        const client = clients.find(c => c.id === invoice.client_id);
        const clientName = client?.name || '';
        return (
          displayNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus);
    }

    // Client filter
    if (selectedClientId !== 'all') {
      filtered = filtered.filter(invoice => invoice.client_id === selectedClientId);
    }

    // Amount range filter
    if (minAmount !== '') {
      filtered = filtered.filter(invoice => invoice.amount >= parseFloat(minAmount));
    }
    if (maxAmount !== '') {
      filtered = filtered.filter(invoice => invoice.amount <= parseFloat(maxAmount));
    }

    // Date range filters
    if (dateFrom) {
      filtered = filtered.filter(invoice => new Date(invoice.issue_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(invoice => new Date(invoice.issue_date) <= new Date(dateTo));
    }
    if (dueDateFrom) {
      filtered = filtered.filter(invoice => new Date(invoice.due_date) >= new Date(dueDateFrom));
    }
    if (dueDateTo) {
      filtered = filtered.filter(invoice => new Date(invoice.due_date) <= new Date(dueDateTo));
    }

    // Quick date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (selectedDateRange === '7d') cutoff.setDate(now.getDate() - 7);
      if (selectedDateRange === '30d') cutoff.setDate(now.getDate() - 30);
      if (selectedDateRange === '90d') cutoff.setDate(now.getDate() - 90);
      filtered = filtered.filter(invoice => new Date(invoice.issue_date) >= cutoff);
    }

    // Sort by amount
    return filtered.sort((a, b) => {
      if (amountSort === 'asc') {
        return a.amount - b.amount;
      } else {
        return b.amount - a.amount;
      }
    });
  }, [invoices, searchTerm, selectedStatus, selectedClientId, minAmount, maxAmount, dateFrom, dateTo, dueDateFrom, dueDateTo, selectedDateRange, amountSort, clients]);

  const toggleAmountSort = () => {
    setAmountSort(amountSort === 'asc' ? 'desc' : 'asc');
  };

  // Reset filters function
  const resetFilters = () => {
    setSelectedClientId('all');
    setMinAmount('');
    setMaxAmount('');
    setDateFrom('');
    setDateTo('');
    setDueDateFrom('');
    setDueDateTo('');
    setSelectedDateRange('all');
    setSearchInput('');
    setSelectedStatus('all');
  };

  // Functions for the options menu
  const handleImportInvoices = () => {
    console.log('Import invoices clicked');
  };

  const handleExportToCSV = () => {
    exportInvoicesToCSV(filteredInvoices, clients, products);
  };

  const handlePrintInvoices = () => {
    console.log('Print invoices clicked');
  };

  const getStatusStyle = (status: string) => {
    const baseStyle = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full ";
    switch (status) {
      case 'paid':
        return baseStyle + "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'overdue':
        return baseStyle + "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'sent':
        return baseStyle + "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return baseStyle + "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const statusFilters: { value: InvoiceStatus; label: string }[] = [
    { value: 'all', label: 'All Invoices' },
    { value: 'draft', label: 'Drafts' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
  ];

  // Bulk select logic
  const allSelected = filteredInvoices.length > 0 && selectedRows.length === filteredInvoices.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedRows([]);
    else setSelectedRows(filteredInvoices.map(inv => inv.id));
  };
  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const rowDropdownItems = (invoice: any) => [
    {
      label: 'View Details',
      onClick: () => setViewInvoiceId(invoice.id),
      className: 'font-bold text-white',
    },
    {
      label: '',
      onClick: () => {},
      className: 'pointer-events-none border-t border-[#35384A] my-1',
    },
    {
      label: (
        <span className="flex items-center gap-2 font-bold text-white">
          <Copy className="w-4 h-4" />
          Duplicate
        </span>
      ),
      onClick: () => {/* duplicate logic placeholder */},
      className: '',
    },
    {
      label: (
        <span className="flex items-center gap-2 font-bold text-white">
          <Download className="w-4 h-4" />
          Download
        </span>
      ),
      onClick: () => {/* download logic placeholder */},
      className: '',
    },
    {
      label: (
        <span className="flex items-center gap-2 font-bold text-white">
          <Share2 className="w-4 h-4" />
          Share
        </span>
      ),
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/invoices/${invoice.id}`);
      },
      className: '',
    },
    {
      label: '',
      onClick: () => {},
      className: 'pointer-events-none border-t border-[#35384A] my-1',
    },
    {
      label: 'Delete',
      onClick: () => {/* delete logic placeholder */},
      className: 'font-bold text-[#FF4B4B]',
    },
  ];

  // Helper to get start date for each period
  const getPeriodStart = (period: 'month' | 'quarter' | 'year' | 'all') => {
    const now = new Date();
    if (period === 'all') return new Date(0);
    if (period === 'year') return new Date(now.getFullYear(), 0, 1);
    if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), q * 3, 1);
    }
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(0);
  };

  const paidInvoices = useMemo(() => invoices.filter(inv => inv.status === 'paid'), [invoices]);
  const paidInvoicesForPeriod = useMemo(() => {
    const start = getPeriodStart(paidPeriod);
    return paidInvoices.filter(inv => new Date(inv.issue_date) >= start);
  }, [paidInvoices, paidPeriod]);
  const paidAmountForPeriod = paidInvoicesForPeriod.reduce((sum, inv) => sum + inv.amount, 0);

  // Contextual Onboarding Component
  const ContextualOnboarding = () => {
    // Show onboarding if no invoices OR if tutorial=true in URL
    if (invoices.length > 0 && !showTutorial) return null;

  return (
      <div className="max-w-4xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💰</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Invoice Management</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Invoices are how you get paid. Create professional invoices, track payments, and manage 
            your cash flow all in one place. Let's get your first invoice set up.
          </p>
        </div>

        {/* Video Section */}
        <div className="mb-8">
          <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center">
                <span className="text-[#336699] mr-2">🎥</span>
                Watch: Invoice Management Walkthrough
              </h3>
              <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">5 min</span>
            </div>
            
            {/* Video Embed Container */}
            <div className="relative w-full h-0 pb-[56.25%] bg-[#333333] rounded-[4px] overflow-hidden">
              {/* Replace this iframe src with your actual Loom video URL */}
              <iframe
                src="https://www.loom.com/embed/0c9786a7fd61445bbb23b6415602afe4"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                title="Invoice Management Walkthrough"
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
              Watch me create a professional invoice from scratch and show you how to track 
              payments and manage your cash flow like a pro.
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
              <h3 className="text-white font-bold">Create Your First Invoice</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Generate a professional invoice for completed work or upcoming projects.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="w-full bg-[#336699] text-white py-2 px-4 rounded-[4px] hover:bg-[#2A5580] transition-colors font-medium"
            >
              CREATE INVOICE
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                2
              </div>
              <h3 className="text-gray-400 font-bold">Send & Track</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Send invoices to clients and track when they're viewed and paid.
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
              <h3 className="text-gray-400 font-bold">Get Paid</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Accept payments online and automatically mark invoices as paid.
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
            Pro Tips for Invoice Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Set clear payment terms</p>
                  <p className="text-gray-400 text-xs">Net 30, Net 15, or Due on Receipt - be specific</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Include detailed line items</p>
                  <p className="text-gray-400 text-xs">Break down labor, materials, and any additional costs</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Follow up on overdue invoices</p>
                  <p className="text-gray-400 text-xs">Set reminders and maintain professional communication</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Accept multiple payment methods</p>
                  <p className="text-gray-400 text-xs">Make it easy for clients to pay you quickly</p>
                </div>
              </div>
                </div>
              </div>
            </div>

        {/* Invoice Templates */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-4">
            Need help getting started? Try our invoice templates:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              💼 Service Invoice
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              🏗️ Construction Invoice
            </button>
              <button 
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
              >
              🔧 Repair Invoice
              </button>
              <button 
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
              >
              📋 Estimate Invoice
              </button>
            </div>
          </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-[#333333]">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Invoices</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="w-10 h-10 bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Invoices:</span>
            <span className="font-mono font-medium">{invoices.length}</span>
            <span className="text-gray-500 text-xs">({formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))})</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Outstanding:</span>
            <span className="font-mono font-medium text-[#D32F2F]">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.amount : 0), 0))}</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Paid:</span>
            <span className="font-mono font-medium text-[#388E3C]">{formatCurrency(paidAmountForPeriod)}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium text-white min-w-[180px] hover:bg-[#252525] transition-colors appearance-none cursor-pointer"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus)}
              >
                <option value="all">All Invoices ({invoices.length})</option>
                <option value="draft">Drafts ({invoices.filter(inv => inv.status === 'draft').length})</option>
                <option value="sent">Sent ({invoices.filter(inv => inv.status === 'sent').length})</option>
                <option value="paid">Paid ({invoices.filter(inv => inv.status === 'paid').length})</option>
                <option value="overdue">Overdue ({invoices.filter(inv => inv.status === 'overdue').length})</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[#252525] transition-colors ${
                  showFilterMenu ? 'bg-[#252525]' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
              
              {/* More Filters Dropdown */}
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-4">
                  <div className="space-y-4">
                    {/* Client Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Client
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                      >
                        <option value="all">All Clients</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Amount Range Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Amount Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min Amount"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          className="w-1/2 bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        />
                        <input
                          type="number"
                          placeholder="Max Amount"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          className="w-1/2 bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        />
                      </div>
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
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1E1E1E] border border-[#333333] rounded-[4px] overflow-hidden">
              <button
                className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewMode === 'list' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-[#252525]'
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewMode === 'cards' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-[#252525]'
                }`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
            </div>
            <div className="relative" ref={optionsMenuRef}>
              <button
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] w-8 h-8 flex items-center justify-center hover:bg-[#252525] transition-colors"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handleImportInvoices(); }}
                  >
                    Import Invoices
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handleExportToCSV(); }}
                  >
                    Export to CSV
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handlePrintInvoices(); }}
                  >
                    Print Invoices
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Show contextual onboarding if no invoices and not loading */}
        {!isLoading && (invoices.length === 0 || showTutorial) ? (
          <ContextualOnboarding />
        ) : (
          <>
        {/* Desktop table */}
        <div className="hidden md:flex flex-col min-h-[calc(100vh-64px)]">
          <div className="flex-1 flex flex-col">
            {isLoading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#232323] text-left text-xs uppercase tracking-wider text-white border-b border-gray-700 font-['Roboto_Condensed']">
                      <th className="py-3 px-3 w-12">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="py-3 px-3 w-[15%]">INVOICE #</th>
                      <th className="py-3 px-3 w-[20%]">CLIENT</th>
                      <th className="py-3 px-3 w-[12%]">DATE</th>
                      <th className="py-3 px-3 w-[12%]">DUE</th>
                      <th className="py-3 px-3 w-[15%]">STATUS</th>
                      <th 
                        className="py-3 px-3 text-right w-[15%] cursor-pointer hover:text-[#336699] transition-colors"
                        onClick={toggleAmountSort}
                      >
                        AMOUNT {amountSort === 'desc' ? '▼' : '▲'}
                      </th>
                      <th className="py-3 px-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <tr
                        key={invoice.id}
                        className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-[#181818]' : 'bg-[#1E1E1E]'} hover:bg-[#232323] cursor-pointer transition-colors ${selectedRows.includes(invoice.id) ? 'bg-[#232323]' : ''}`}
                        onClick={() => toggleSelectRow(invoice.id)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center h-full" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                              checked={selectedRows.includes(invoice.id)}
                              onChange={() => toggleSelectRow(invoice.id)}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-white">{`INV-${invoice.id.slice(0, 8)}`}</td>
                        <td className="py-3 px-3 text-gray-300">{clients.find(c => c.id === invoice.client_id)?.name || ''}</td>
                        <td className="py-3 px-3 text-gray-300">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-gray-300">{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-1 bg-[#336699] text-xs text-white rounded">
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-white">{formatCurrency(invoice.amount)}</td>
                        <td className="py-3 px-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              trigger={
                                <button className="hover:text-[#F9D71C]">
                                  <span className="sr-only">Actions</span>
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                </button>
                              }
                              items={rowDropdownItems(invoice)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Cards View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                {filteredInvoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.client_id);
                  const isSelected = selectedRows.includes(invoice.id);
                  const isOverdue = invoice.status === 'overdue';
                  const isPaid = invoice.status === 'paid';
                  const isDraft = invoice.status === 'draft';
                  
                  return (
                    <div
                      key={invoice.id}
                      className={`bg-[#333333] rounded-[4px] border-l-4 ${
                        isPaid ? 'border-[#388E3C]' :
                        isOverdue ? 'border-[#D32F2F]' :
                        isDraft ? 'border-[#9E9E9E]' :
                        'border-[#336699]'
                      } p-4 cursor-pointer transition-all hover:bg-[#3A3A3A] ${isSelected ? 'bg-[#3A3A3A]' : ''}`}
                      onClick={() => toggleSelectRow(invoice.id)}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(invoice.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-gray-400 font-mono">{`INV-${invoice.id.slice(0, 8)}`}</span>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Dropdown
                            trigger={
                              <button className="hover:text-[#F9D71C] p-1">
                                <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                            }
                            items={rowDropdownItems(invoice)}
                          />
                        </div>
                      </div>

                      {/* Client Name - Prominent */}
                      <div className="mb-3">
                        <h3 className="text-white font-medium text-base leading-tight">
                          {client?.name || 'Unknown Client'}
                        </h3>
                        {client?.company && client.company !== client.name && (
                          <p className="text-gray-400 text-sm">{client.company}</p>
                        )}
                      </div>

                      {/* Amount - Large and prominent */}
                      <div className="mb-3">
                        <div className="text-xl font-bold text-white font-mono">
                          {formatCurrency(invoice.amount)}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isPaid ? 'bg-[#388E3C] text-white' :
                          isOverdue ? 'bg-[#D32F2F] text-white' :
                          isDraft ? 'bg-[#9E9E9E] text-white' :
                          'bg-[#336699] text-white'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>

                      {/* Dates - Aligned left like sidebar */}
                      <div className="space-y-1 text-sm mb-3">
                        <div className="flex justify-between text-gray-400">
                          <span>Issued:</span>
                          <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Due:</span>
                          <span className={isOverdue ? 'text-[#D32F2F] font-medium' : ''}>
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-3 border-t border-gray-600 flex gap-2">
                        <button
                          className="flex-1 bg-[#336699] text-white text-xs py-2 px-3 rounded-[2px] hover:bg-[#2851A3] transition-colors font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewInvoiceId(invoice.id);
                          }}
                        >
                          View
                        </button>
                        {isDraft && (
                          <button
                            className="flex-1 bg-[#F9D71C] text-[#121212] text-xs py-2 px-3 rounded-[2px] hover:bg-opacity-90 transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle finalize action
                            }}
                          >
                            Finalize
                          </button>
                        )}
                        {!isPaid && !isDraft && (
                          <button
                            className="flex-1 bg-[#388E3C] text-white text-xs py-2 px-3 rounded-[2px] hover:bg-opacity-90 transition-colors font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle mark as paid action
                            }}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Fixed bottom bulk actions bar */}
            {selectedRows.length > 0 && (
              <div
                className="fixed bottom-0 z-50 bg-[#121212] border-t border-[#333333] flex items-center px-8 py-4 gap-4 shadow-lg"
                style={{ left: 256, width: 'calc(100vw - 256px)' }}
              >
                <span className="text-white font-medium font-['Roboto']">{selectedRows.length} invoice{selectedRows.length > 1 ? 's' : ''} selected</span>
                <button className="bg-[#336699] text-white font-medium rounded-[4px] px-6 py-2 h-10 font-['Roboto'] uppercase tracking-wider hover:bg-opacity-80">Finalize</button>
                <button className="bg-[#1E1E1E] border border-[#336699] border-opacity-40 text-white font-medium rounded-[4px] px-6 py-2 h-10 font-['Roboto'] uppercase tracking-wider hover:bg-[#1E1E1E]">Download</button>
                <button className="bg-[#D32F2F] text-white font-medium rounded-[4px] px-6 py-2 h-10 font-['Roboto'] uppercase tracking-wider hover:bg-opacity-80">Delete</button>
                <button className="ml-auto text-[#F9D71C] font-medium font-['Roboto'] hover:text-opacity-80" onClick={() => setSelectedRows([])}>Clear</button>
              </div>
            )}
          </div>
          <div className="flex-grow" />
          <div className="flex flex-col items-center mt-auto pb-8">
            <div className="text-lg font-medium text-white font-['Roboto_Condensed'] uppercase mb-2">Ready to create more invoices?</div>
            <div className="text-sm text-[#9E9E9E] mb-6 font-['Roboto']">Use the "+ New Invoice" button to get started.</div>
            <button
              className="bg-[#F9D71C] text-[#121212] px-8 py-3 rounded-[4px] font-medium font-['Roboto'] uppercase tracking-wider hover:bg-opacity-90 h-12"
              onClick={() => navigate('/packages')}
            >
              View Invoice Templates
            </button>
          </div>
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
            <div className="space-y-4 pb-20">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {`INV-${invoice.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={getStatusStyle(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2" />
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
        <NewInvoiceModal
          onClose={() => setShowNewModal(false)}
          onSave={() => {
            setShowNewModal(false);
            fetchData();
          }}
        />
      )}

      {showNewModal && (
        <NewInvoiceModal
          onClose={() => setShowNewModal(false)}
          onSave={() => {
            setShowNewModal(false);
            fetchData();
          }}
        />
      )}

      {/* Invoice Details Drawer */}
      {viewInvoiceId && (
        <InvoiceDetailsDrawer
          invoice={invoices.find(inv => inv.id === viewInvoiceId)}
          client={clients.find(c => c.id === invoices.find(inv => inv.id === viewInvoiceId)?.client_id)}
          onClose={() => setViewInvoiceId(null)}
        />
      )}
    </div>
  );
};