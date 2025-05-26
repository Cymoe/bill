import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, ChevronRight, Share2, Copy, Filter, MoreVertical, ChevronDown, Calendar, DollarSign, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import TabMenu from '../common/TabMenu';
import { PageHeaderBar } from '../common/PageHeaderBar';
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
    <>
      <PageHeaderBar 
        title="Invoices"
        searchPlaceholder="Search invoices..."
        searchValue={searchInput}
        onSearch={setSearchInput}
        onAddClick={() => navigate('/invoices/new')}
        addButtonLabel="Invoice"
      />
      
      {/* Invoice summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#333333]">
        {/* Total Outstanding */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D32F2F]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Total Outstanding</div>
          <div className="text-3xl font-bold text-[#D32F2F] mb-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.amount : 0), 0))}</div>
          <div className="text-sm text-gray-400">{invoices.filter(inv => inv.status !== 'paid').length} invoices</div>
        </div>
        
        {/* Draft Invoices */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#9E9E9E]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Draft Invoices</div>
          <div className="text-3xl font-bold text-[#9E9E9E] mb-1">{invoices.filter(inv => inv.status === 'draft').length}</div>
          <div className="text-sm text-gray-400">
            <button className="bg-[#336699] text-white text-xs font-medium rounded-full px-4 py-1 hover:bg-[#2851A3] transition-colors">
              Finalize
            </button>
          </div>
        </div>
        
        {/* Overdue */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#F9D71C]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Overdue</div>
          <div className="text-3xl font-bold text-[#F9D71C] mb-1">{formatCurrency(invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0))}</div>
          <div className="text-sm text-gray-400">{invoices.filter(inv => inv.status === 'overdue').length} invoices</div>
        </div>
        
        {/* Paid */}
        <div className="relative bg-[#1a1a1a] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#388E3C]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Paid</div>
          <div className="text-3xl font-bold text-[#388E3C] mb-1">{formatCurrency(paidAmountForPeriod)}</div>
          <div className="text-sm text-gray-400">{paidInvoicesForPeriod.length} invoices</div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
        {/* Left side - View Mode and Primary Filter */}
        <div className="flex items-center gap-4">
          {/* View Mode Toggles - More Prominent */}
          <div className="flex bg-[#333333] border border-gray-700 rounded overflow-hidden">
            <button
              className="px-4 py-2 bg-[#336699] text-white"
            >
              List
            </button>
            <button
              className="px-4 py-2 text-gray-400 hover:bg-gray-700"
            >
              Cards
            </button>
          </div>

          {/* Primary Client Filter - More Prominent */}
          <div className="relative">
            <select
              className="bg-[#232323] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#336699] appearance-none cursor-pointer pr-10 min-w-[200px]"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
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
              <div className="absolute left-0 top-full mt-2 w-80 bg-[#232323] border border-gray-700 rounded shadow-lg z-50">
                <div className="p-4 space-y-4">
                  {/* Quick Date Range Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Quick Date Range</label>
                    <select
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value)}
                      className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                  </div>

                  {/* Custom Date Range Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Custom Date Range</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        placeholder="From"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="date"
                        placeholder="To"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Due Date Range Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Due Date Range</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        placeholder="From"
                        value={dueDateFrom}
                        onChange={(e) => setDueDateFrom(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="date"
                        placeholder="To"
                        value={dueDateTo}
                        onChange={(e) => setDueDateTo(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Amount Range Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      />
                    </div>
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
                  onClick={() => { setShowOptionsMenu(false); handleImportInvoices(); }}
                >
                  Import Invoices
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                  onClick={() => { setShowOptionsMenu(false); handleExportToCSV(); }}
                >
                  Export to CSV
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                  onClick={() => { setShowOptionsMenu(false); handlePrintInvoices(); }}
                >
                  Print Invoices
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Global subnav tabs (now below summary cards, above table) */}
      <TabMenu
        items={statusFilters.map(filter => ({
          id: filter.value,
          label: filter.label,
          count: filter.value === 'all' 
            ? invoices.length 
            : invoices.filter(inv => inv.status === filter.value).length
        }))}
        activeItemId={selectedStatus}
        onItemClick={(id) => setSelectedStatus(id as InvoiceStatus)}
      />
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
            ) : (
              <div className="bg-[#121212] rounded-[4px] shadow overflow-hidden border border-[#333333]">
                <table className="min-w-full bg-[#121212]">
                  <thead>
                    <tr className="bg-[#1E1E1E] sticky top-0 z-10">
                      <th className="w-12 px-3 py-4 align-middle">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">INVOICE #</th>
                      <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">CLIENT</th>
                      <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">DATE</th>
                      <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">DUE</th>
                      <th className="text-left px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase">STATUS</th>
                          <th 
                            className="text-right px-3 py-4 font-bold text-white font-['Roboto_Condensed'] uppercase cursor-pointer hover:text-[#336699] transition-colors"
                            onClick={toggleAmountSort}
                          >
                            AMOUNT {amountSort === 'desc' ? '▼' : '▲'}
                          </th>
                      <th className="w-8 px-3 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className={`transition-colors ${selectedRows.includes(invoice.id) ? 'bg-[#1E1E1E]' : 'hover:bg-[#1E1E1E]'} cursor-pointer`}
                        onClick={() => toggleSelectRow(invoice.id)}
                      >
                        <td className="px-3 py-4 align-middle">
                          <div className="flex items-center h-full" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-[#336699] bg-transparent border-[#555555] rounded-sm focus:ring-[#0D47A1] focus:ring-opacity-40"
                              checked={selectedRows.includes(invoice.id)}
                              onChange={() => toggleSelectRow(invoice.id)}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-4 font-medium text-white font-['Roboto']">{`INV-${invoice.id.slice(0, 8)}`}</td>
                        <td className="px-3 py-4 text-white font-['Roboto']">{clients.find(c => c.id === invoice.client_id)?.name || ''}</td>
                        <td className="px-3 py-4 text-white font-['Roboto']">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                        <td className="px-3 py-4 text-white font-['Roboto']">{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center">
                              <span className="w-5 h-5 bg-[#333333] rounded-[4px] flex items-center justify-center mr-2">
                                <span className="block w-2 h-2 bg-[#336699] rounded-[4px]"></span>
                              </span>
                              <span className="text-white text-sm font-['Roboto']">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-right font-bold text-white font-['Roboto_Mono']">{formatCurrency(invoice.amount)}</td>
                        <td className="px-3 py-4">
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

      {/* Invoice Details Drawer */}
      {viewInvoiceId && (
        <InvoiceDetailsDrawer
          invoice={invoices.find(inv => inv.id === viewInvoiceId)}
          client={clients.find(c => c.id === invoices.find(inv => inv.id === viewInvoiceId)?.client_id)}
          onClose={() => setViewInvoiceId(null)}
        />
      )}
    </>
  );
};