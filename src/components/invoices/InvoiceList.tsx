import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Share2, Copy, Filter, MoreVertical, Upload, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Modal } from '../common/Modal';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { InvoiceFormSimple } from './InvoiceFormSimple';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { exportInvoicesToCSV } from '../../utils/exportData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { LayoutContext } from '../layouts/DashboardLayout';
import { CreateInvoiceDrawer } from './CreateInvoiceDrawer';

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
  const { isConstrained, isMinimal, isCompact, availableWidth } = React.useContext(LayoutContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [paidPeriod, setPaidPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('year');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
  // Revenue-driven cash flow filters
  const [selectedCashFlowStatus, setSelectedCashFlowStatus] = useState('all');
  const [selectedValueTier, setSelectedValueTier] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedClientType, setSelectedClientType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [amountSort, setAmountSort] = useState<'asc' | 'desc'>('desc');
  
  // Add state for invoice dropdown menus
  const [openInvoiceDropdown, setOpenInvoiceDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const invoiceDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
      
      // Close invoice dropdown if clicking outside
      if (openInvoiceDropdown) {
        const dropdownRef = invoiceDropdownRefs.current[openInvoiceDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setOpenInvoiceDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openInvoiceDropdown]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle navigation from project page
  useEffect(() => {
    console.log('InvoiceList - location.state:', location.state);
    if (location.state?.createNew) {
      setShowCreateDrawer(true);
      // Clear the state so it doesn't trigger again on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

    // Cash flow status filter (most important for revenue)
    if (selectedCashFlowStatus !== 'all') {
      filtered = filtered.filter(invoice => {
        const daysPastDue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
        
        switch (selectedCashFlowStatus) {
          case 'critical': return invoice.status === 'overdue' && daysPastDue > 30;
          case 'overdue': return invoice.status === 'overdue';
          case 'due-soon': return invoice.status === 'sent' && daysPastDue >= -7 && daysPastDue <= 0;
          case 'paid': return invoice.status === 'paid';
          case 'draft': return invoice.status === 'draft';
          default: return true;
        }
      });
    }

    // Value tier filter (revenue impact)
    if (selectedValueTier !== 'all') {
      filtered = filtered.filter(invoice => {
        const amount = invoice.amount;
        switch (selectedValueTier) {
          case 'large': return amount >= 10000;
          case 'medium': return amount >= 5000 && amount < 10000;
          case 'small': return amount >= 1000 && amount < 5000;
          case 'minimal': return amount < 1000;
          default: return true;
        }
      });
    }

    // Urgency filter (cash flow priority)
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(invoice => {
        const daysPastDue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
        const isHighValue = invoice.amount >= 5000;
        
        switch (selectedUrgency) {
          case 'urgent': return (daysPastDue > 0 && isHighValue) || daysPastDue > 30;
          case 'important': return daysPastDue > 0 || (daysPastDue >= -7 && isHighValue);
          case 'routine': return daysPastDue <= 0 && !isHighValue;
          default: return true;
        }
      });
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
  }, [invoices, searchTerm, selectedStatus, selectedCashFlowStatus, selectedValueTier, selectedUrgency, selectedClientType, selectedDateRange, amountSort, clients]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedCashFlowStatus('all');
    setSelectedValueTier('all');
    setSelectedUrgency('all');
    setSelectedClientType('all');
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

  // Invoice action handlers
  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    // Find the invoice to edit
    const invoiceToEdit = invoices.find(inv => inv.id === invoiceId);
    if (invoiceToEdit) {
      setEditingInvoice(invoiceToEdit);
      setShowCreateDrawer(true);
    }
  };

  const handleDuplicateInvoice = async (invoiceId: string) => {
    try {
      // Find the invoice to duplicate
      const invoiceToDuplicate = invoices.find(inv => inv.id === invoiceId);
      if (!invoiceToDuplicate) return;

      // Get the invoice items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      // Create new invoice with same data but new dates
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user?.id,
          client_id: invoiceToDuplicate.client_id,
          amount: invoiceToDuplicate.amount,
          status: 'draft',
          issue_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Duplicate the items
      if (items && items.length > 0) {
        const newItems = items.map(item => ({
          invoice_id: newInvoice.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          description: item.description
        }));

        const { error: newItemsError } = await supabase
          .from('invoice_items')
          .insert(newItems);

        if (newItemsError) throw newItemsError;
      }

      // Navigate to the new invoice
      navigate(`/invoices/${newInvoice.id}`);
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Failed to duplicate invoice. Please try again.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        // Delete invoice items first
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);

        if (itemsError) throw itemsError;

        // Then delete the invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .delete()
          .eq('id', invoiceId)
          .eq('user_id', user?.id);

        if (invoiceError) throw invoiceError;

        // Refresh the data
        await fetchData();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const handleShareInvoice = async (invoiceId: string) => {
    try {
      // Generate the invoice URL
      const invoiceUrl = `${window.location.origin}/invoices/${invoiceId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(invoiceUrl);
      
      // Show success message (you could use a toast notification here)
      alert('Invoice link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing invoice:', error);
      alert('Failed to copy invoice link. Please try again.');
    }
  };

  const statusFilters: { value: InvoiceStatus; label: string }[] = [
    { value: 'all', label: 'All Invoices' },
    { value: 'draft', label: 'Drafts' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
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
              onClick={() => setShowCreateDrawer(true)}
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
              onClick={() => setShowCreateDrawer(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              💼 Service Invoice
            </button>
            <button
              onClick={() => setShowCreateDrawer(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              🏗️ Construction Invoice
            </button>
              <button 
              onClick={() => setShowCreateDrawer(true)}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
              >
              🔧 Repair Invoice
              </button>
              <button 
              onClick={() => setShowCreateDrawer(true)}
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
      <PageHeaderBar
        title="Invoices"
        searchPlaceholder="Search invoices..."
        onSearch={(query) => setSearchInput(query)}
        searchValue={searchInput}
        addButtonLabel="Add Invoice"
        onAddClick={() => setShowCreateDrawer(true)}
      />
        
      {/* Unified Stats + Content Container */}
      <div className="bg-[#333333]/30 border border-[#333333] rounded-[4px]">
        {/* Stats Section */}
        <div className={`${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50 rounded-t-[4px]`}>
          {isMinimal || isConstrained ? (
            // Compact 4-column row for constrained/minimal
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">OUTSTANDING</div>
                <div className="text-base font-semibold mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.amount : 0), 0))}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">OVERDUE</div>
                <div className="text-base font-semibold text-[#F9D71C] mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status === 'overdue' ? inv.amount : 0), 0))}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">COLLECTED</div>
                <div className="text-base font-semibold mt-1">{formatCurrency(paidAmountForPeriod)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">AVG</div>
                <div className="text-base font-semibold mt-1">{formatCurrency(invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length : 0)}</div>
              </div>
            </div>
          ) : (
            // Full 4-column layout for desktop
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">OUTSTANDING</div>
                <div className="text-lg font-semibold mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.amount : 0), 0))}</div>
                <div className="text-xs text-gray-500">({invoices.filter(inv => inv.status !== 'paid').length} invoices)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">OVERDUE</div>
                <div className="text-lg font-semibold text-[#F9D71C] mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status === 'overdue' ? inv.amount : 0), 0))}</div>
                <div className="text-xs text-gray-500">({invoices.filter(inv => inv.status === 'overdue').length})</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">COLLECTED</div>
                <div className="text-lg font-semibold mt-1">{formatCurrency(paidAmountForPeriod)}</div>
                <div className="text-xs text-gray-500">(this year)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">AVG INVOICE</div>
                <div className="text-lg font-semibold mt-1">{formatCurrency(invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length : 0)}</div>
                <div className="text-xs text-gray-500">(average)</div>
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus)}
              >
                <option value="all">All Invoices ({invoices.length})</option>
                <option value="draft">Drafts ({invoices.filter(inv => inv.status === 'draft').length})</option>
                <option value="sent">Sent ({invoices.filter(inv => inv.status === 'sent').length})</option>
                <option value="paid">Paid ({invoices.filter(inv => inv.status === 'paid').length})</option>
                <option value="overdue">Overdue ({invoices.filter(inv => inv.status === 'overdue').length})</option>
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
                      {/* Cash Flow Status Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Cash Flow Priority
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedCashFlowStatus}
                          onChange={(e) => setSelectedCashFlowStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="critical">Critical (30+ days overdue)</option>
                          <option value="overdue">Overdue</option>
                          <option value="due-soon">Due Soon (7 days)</option>
                          <option value="paid">Paid</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>

                      {/* Value Tier Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Value Tier
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedValueTier}
                          onChange={(e) => setSelectedValueTier(e.target.value)}
                        >
                          <option value="all">All Values</option>
                          <option value="large">Large ($10,000+)</option>
                          <option value="medium">Medium ($5,000-$10,000)</option>
                          <option value="small">Small ($1,000-$5,000)</option>
                          <option value="minimal">Minimal (&lt;$1,000)</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Date Range
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
                      handleImportInvoices();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Upload className="w-3 h-3 mr-3 text-gray-400" />
                    Import Invoices
                  </button>
                  <button
                    onClick={() => {
                      handleExportToCSV();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Download className="w-3 h-3 mr-3 text-gray-400" />
                    Export to CSV
                  </button>
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333] border-t border-[#333333] mt-1">
                    View Options
                  </div>
                  <button
                    onClick={() => {
                      handlePrintInvoices();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-3 text-gray-400" />
                    Print Invoices
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className={`${isMinimal ? 'px-4 py-2' : isConstrained ? 'px-4 py-2' : 'px-6 py-3'} border-b border-[#333333]/50 bg-[#1E1E1E]/50`}>
          <div className={`grid ${isMinimal ? 'grid-cols-8' : isConstrained ? 'grid-cols-8' : 'grid-cols-12'} gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider items-center`}>
            <div className={`${isMinimal ? 'col-span-3' : isConstrained ? 'col-span-5' : 'col-span-6'}`}>INVOICE</div>
            <div className={`${isMinimal ? 'col-span-3' : isConstrained ? 'col-span-2' : 'col-span-3'} text-center`}>AMOUNT</div>
            {!isMinimal && !isConstrained && <div className="col-span-2">CLIENT</div>}
            <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-1' : 'col-span-1'} text-right`}></div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="overflow-hidden rounded-b-[4px]">
          {!isLoading && (invoices.length === 0 || showTutorial) ? (
            <ContextualOnboarding />
          ) : (
            <>
              {/* Table Rows */}
              <div>
                {isLoading ? (
                  <div className="p-6">
                    <TableSkeleton rows={5} columns={7} />
                  </div>
                ) : (
                  <>
                    {filteredInvoices.map((invoice) => {
                      const client = clients.find(c => c.id === invoice.client_id);
                      const daysPastDue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div
                          key={invoice.id}
                          className={`grid ${
                            isMinimal 
                              ? 'grid-cols-8 gap-4 px-4 py-3' 
                              : isConstrained 
                                ? 'grid-cols-8 gap-4 px-4 py-3' 
                                : 'grid-cols-12 gap-4 px-6 py-4'
                          } items-center hover:bg-[#1A1A1A] transition-colors cursor-pointer border-b border-[#333333]/50 last:border-b-0`}
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          {/* Invoice Column with Status Badge */}
                          <div className={`${isMinimal ? 'col-span-3' : isConstrained ? 'col-span-5' : 'col-span-6'}`}>
                            <div className={`flex items-center ${isMinimal ? 'gap-2' : 'gap-3'}`}>
                              <span className={`text-xs px-2 py-1 rounded-[2px] font-medium min-w-[60px] text-center ${
                                invoice.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                                invoice.status === 'overdue' ? 'bg-red-500/20 text-red-300' :
                                invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {invoice.status === 'overdue' ? 'overdue' : invoice.status}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className={`font-medium text-white truncate ${isMinimal ? 'text-sm' : ''}`}>
                                  {`INV-${invoice.id.slice(0, 8)}`}
                                </div>
                                <div className="text-xs text-gray-400 truncate mt-0.5">
                                  {client?.name || 'Unknown Client'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Amount Column */}
                          <div className={`${isMinimal ? 'col-span-3' : isConstrained ? 'col-span-2' : 'col-span-3'} text-center`}>
                            <div className={`font-mono font-semibold text-white ${isMinimal ? 'text-sm' : ''}`}>
                              {formatCurrency(invoice.amount)}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">Invoice</div>
                          </div>
                          
                          {/* Client Column - Only shown in full mode */}
                          {!isMinimal && !isConstrained && (
                            <div className="col-span-2 text-sm text-gray-300">
                              <div>{new Date(invoice.due_date).toLocaleDateString()}</div>
                              {daysPastDue > 0 && (
                                <div className="text-xs text-red-400">
                                  {daysPastDue} days overdue
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions Column */}
                          <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-1' : 'col-span-1'} text-right relative`}>
                            <div
                              ref={(el) => {
                                invoiceDropdownRefs.current[invoice.id] = el;
                              }}
                              className="relative"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (openInvoiceDropdown === invoice.id) {
                                    setOpenInvoiceDropdown(null);
                                  } else {
                                    // Calculate position for fixed dropdown
                                    const buttonRect = e.currentTarget.getBoundingClientRect();
                                    const viewportWidth = window.innerWidth;
                                    const dropdownWidth = 192; // w-48 = 192px
                                    
                                    setDropdownPosition({
                                      top: buttonRect.bottom + 4,
                                      right: viewportWidth - buttonRect.right
                                    });
                                    setOpenInvoiceDropdown(invoice.id);
                                  }
                                }}
                                className={`${isMinimal ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-[2px] hover:bg-[#333333] transition-colors`}
                              >
                                <MoreVertical className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Invoice Drawer */}
      <CreateInvoiceDrawer
        isOpen={showCreateDrawer}
        onClose={() => {
          setShowCreateDrawer(false);
          setEditingInvoice(null);
        }}
        editingInvoice={editingInvoice}
        projectContext={location.state?.projectId ? {
          projectId: location.state.projectId,
          clientId: location.state.clientId,
          projectName: location.state.projectName,
          projectBudget: location.state.projectBudget
        } : undefined}
        onSave={async (data) => {
          try {
            if (editingInvoice) {
              // Update existing invoice
              const { error: invoiceError } = await supabase
                .from('invoices')
                .update({
                  client_id: data.client_id,
                  amount: data.total_amount,
                  status: data.status,
                  issue_date: data.issue_date,
                  due_date: data.due_date,
                  description: data.description,
                  project_id: data.project_id || null // Add project_id
                })
                .eq('id', editingInvoice.id);

              if (invoiceError) throw invoiceError;

              // Delete existing items
              const { error: deleteError } = await supabase
                .from('invoice_items')
                .delete()
                .eq('invoice_id', editingInvoice.id);

              if (deleteError) throw deleteError;

              // Create new invoice items
              const itemsToInsert = data.items.map(item => ({
                invoice_id: editingInvoice.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price,
                description: item.description
              }));

              const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

              if (itemsError) throw itemsError;
            } else {
              // Create new invoice
              const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                  user_id: user?.id,
                  client_id: data.client_id,
                  amount: data.total_amount,
                  status: data.status,
                  issue_date: data.issue_date,
                  due_date: data.due_date,
                  description: data.description,
                  project_id: data.project_id || null // Add project_id
                })
                .select()
                .single();

              if (invoiceError) throw invoiceError;

              // Create invoice items
              const itemsToInsert = data.items.map(item => ({
                invoice_id: invoice.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price,
                description: item.description
              }));

              const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

              if (itemsError) throw itemsError;
            }

            // Refresh the data
            await fetchData();
            setShowCreateDrawer(false);
            setEditingInvoice(null);
          } catch (error) {
            console.error('Error saving invoice:', error);
            // You might want to show an error toast here
          }
        }}
      />

      {/* Fixed positioned invoice dropdown to prevent clipping */}
      {openInvoiceDropdown && (
        <div 
          className="fixed w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg py-1"
          style={{
            top: dropdownPosition.top,
            right: dropdownPosition.right,
            zIndex: 10000
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleViewInvoice(openInvoiceDropdown);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
          >
            <Eye className="w-4 h-4 mr-3 text-gray-400" />
            View Details
          </button>
          <button
            onClick={() => {
              handleEditInvoice(openInvoiceDropdown);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
          >
            <Edit className="w-4 h-4 mr-3 text-gray-400" />
            Edit Invoice
          </button>
          <button
            onClick={() => {
              handleDuplicateInvoice(openInvoiceDropdown);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
          >
            <Copy className="w-4 h-4 mr-3 text-gray-400" />
            Duplicate
          </button>
          <button
            onClick={() => {
              handleShareInvoice(openInvoiceDropdown);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
          >
            <Share2 className="w-4 h-4 mr-3 text-gray-400" />
            Share Invoice
          </button>
          <div className="border-t border-[#333333] my-1"></div>
          <button
            onClick={() => {
              handleDeleteInvoice(openInvoiceDropdown);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#333333] transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-3 text-red-400" />
            Delete Invoice
          </button>
        </div>
      )}
    </div>
  );
};