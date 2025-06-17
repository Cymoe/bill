import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Share2, Copy, Filter, MoreVertical, FileText, Eye, Edit, Trash2, CreditCard, LayoutGrid, ChevronUp, ChevronDown, FileSpreadsheet, FileDown } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { advancedSearch, SearchableField } from '../../utils/searchUtils';
import { Modal } from '../common/Modal';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { InvoiceFormSimple } from './InvoiceFormSimple';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { exportInvoicesToCSV } from '../../utils/exportData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { InvoiceExportService } from '../../services/InvoiceExportService';


import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import { CreateInvoiceDrawer } from './CreateInvoiceDrawer';
import { PaymentTracker } from './PaymentTracker';
import { ProgressBillingModal } from './ProgressBillingModal';

type Invoice = {
  id: string;
  number: string;
  invoice_number?: string;
  client_id: string;
  date: string;
  issue_date: string;
  due_date: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  status: 'draft' | 'sent' | 'opened' | 'paid' | 'overdue' | 'signed';
  amount: number;
  user_id: string;
  created_at: string;
  // New contractor properties
  total_paid?: number;
  balance_due?: number;
  payment_terms?: string;
  is_progress_billing?: boolean;
  project_milestone?: string;
  milestone_percentage?: number;
  payments?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
  }>;
};
type InvoiceStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue';

interface InvoiceListProps {
  searchTerm?: string;
  refreshTrigger?: number;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ searchTerm = '', refreshTrigger }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const { isConstrained, isMinimal, isCompact, availableWidth } = React.useContext(LayoutContext);
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
  const [sortField, setSortField] = useState<'amount' | 'date' | 'invoice_number' | 'client'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Add state for invoice dropdown menus
  const [openInvoiceDropdown, setOpenInvoiceDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  
  // New contractor features state
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPaymentTracker, setShowPaymentTracker] = useState(false);
  const [showProgressBilling, setShowProgressBilling] = useState(false);
  
  // Compact table toggle state
  const [isCompactTable, setIsCompactTable] = useState(false);
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const invoiceDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';

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

  // Debounce search to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (user && selectedOrg?.id) {
      fetchData();
    } else if (user && selectedOrg?.name === 'Loading...') {
      // Still loading organization, keep loading state
      setIsLoading(true);
    } else {
      setInvoices([]);
      setClients([]);
      setProducts([]);
      setIsLoading(false);
    }
  }, [user, selectedOrg?.id, selectedOrg?.name, refreshTrigger]);

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
    if (!selectedOrg?.id) {
      setInvoices([]);
      setClients([]);
      setProducts([]);
      setIsLoading(false);
      return;
    }

    console.log('InvoiceList: Starting fetchData for org:', selectedOrg.id);
    setIsLoading(true);

    try {
      // Load invoices with only essential fields for better performance
      const [invoicesRes, clientsRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            client_id,
            amount,
            status,
            issue_date,
            due_date,
            created_at,
            organization_id,
            payments:invoice_payments(amount)
          `)
          .eq('organization_id', selectedOrg.id)
          .order('created_at', { ascending: false })
          .limit(500), // Limit to prevent excessive data loading
        supabase
          .from('clients')
          .select('id, name, organization_id')
          .eq('organization_id', selectedOrg.id),
        supabase
          .from('products')
          .select('id, name, price, organization_id')
          .eq('organization_id', selectedOrg.id)
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;

      // Calculate payment totals for each invoice (optimized)
      const processedInvoices = (invoicesRes.data || []).map(invoice => {
        const totalPaid = invoice.payments?.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0) || 0;
        return {
          ...invoice,
          number: invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`,
          date: invoice.issue_date,
          items: [], // Will be loaded separately if needed
          user_id: '', // Not needed for list view
          payments: [], // Simplified for list view
          total_paid: totalPaid,
          balance_due: invoice.amount - totalPaid
        } as Invoice;
      });

      console.log('InvoiceList: Data loaded successfully', {
        invoices: processedInvoices.length,
        clients: clientsRes.data?.length || 0,
        products: productsRes.data?.length || 0
      });

      setInvoices(processedInvoices);
      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('InvoiceList: Error fetching data:', err);
      // Set empty arrays on error to prevent infinite loading
      setInvoices([]);
      setClients([]);
      setProducts([]);
    } finally {
      console.log('InvoiceList: Setting loading to false');
      setIsLoading(false);
    }
  };

  // Create a client lookup map for better performance
  const clientMap = useMemo(() => {
    const map = new Map();
    clients.forEach(client => map.set(client.id, client));
    return map;
  }, [clients]);

  const filteredInvoices = useMemo(() => {
    if (invoices.length === 0) return [];
    
    console.log('InvoiceList: Filtering invoices', { 
      total: invoices.length, 
      searchTerm: debouncedSearchTerm,
      filters: { selectedStatus, selectedCashFlowStatus, selectedValueTier, selectedUrgency, selectedDateRange }
    });
    
    const now = new Date().getTime();
    
    // Single pass filtering for better performance
    let filtered = invoices.filter(invoice => {
      // Status filter
      if (selectedStatus !== 'all' && invoice.status !== selectedStatus) {
        return false;
      }

      // Cash flow status filter
      if (selectedCashFlowStatus !== 'all') {
        const daysPastDue = Math.floor((now - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
        
        switch (selectedCashFlowStatus) {
          case 'critical': 
            if (!(invoice.status === 'overdue' && daysPastDue > 30)) return false;
            break;
          case 'overdue': 
            if (invoice.status !== 'overdue') return false;
            break;
          case 'due-soon': 
            if (!(invoice.status === 'sent' && daysPastDue >= -7 && daysPastDue <= 0)) return false;
            break;
          case 'paid': 
            if (invoice.status !== 'paid') return false;
            break;
          case 'draft': 
            if (invoice.status !== 'draft') return false;
            break;
        }
      }

      // Value tier filter
      if (selectedValueTier !== 'all') {
        const amount = invoice.amount;
        switch (selectedValueTier) {
          case 'large': if (amount < 10000) return false; break;
          case 'medium': if (amount < 5000 || amount >= 10000) return false; break;
          case 'small': if (amount < 1000 || amount >= 5000) return false; break;
          case 'minimal': if (amount >= 1000) return false; break;
        }
      }

      // Urgency filter
      if (selectedUrgency !== 'all') {
        const daysPastDue = Math.floor((now - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
        const isHighValue = invoice.amount >= 5000;
        
        switch (selectedUrgency) {
          case 'urgent': 
            if (!((daysPastDue > 0 && isHighValue) || daysPastDue > 30)) return false;
            break;
          case 'important': 
            if (!(daysPastDue > 0 || (daysPastDue >= -7 && isHighValue))) return false;
            break;
          case 'routine': 
            if (!(daysPastDue <= 0 && !isHighValue)) return false;
            break;
        }
      }

      // Date range filter
      if (selectedDateRange !== 'all') {
        const cutoffTime = now - (
          selectedDateRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
          selectedDateRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
          selectedDateRange === '90d' ? 90 * 24 * 60 * 60 * 1000 : 0
        );
        if (new Date(invoice.issue_date).getTime() < cutoffTime) return false;
      }

      return true;
    });

    // Apply search filter if needed (more expensive operation)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(invoice => {
        const client = clientMap.get(invoice.client_id);
        const invoiceNumber = invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`;
        
        return (
          invoiceNumber.toLowerCase().includes(searchLower) ||
          (client?.name || '').toLowerCase().includes(searchLower) ||
          invoice.status.toLowerCase().includes(searchLower) ||
          formatCurrency(invoice.amount).toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort the results
    console.log('InvoiceList: Filtered to', filtered.length, 'invoices');
    
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'invoice_number':
          aValue = a.invoice_number || '';
          bValue = b.invoice_number || '';
          break;
        case 'client':
          aValue = clientMap.get(a.client_id)?.name || '';
          bValue = clientMap.get(b.client_id)?.name || '';
          break;
        default:
          aValue = a.amount;
          bValue = b.amount;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [invoices, debouncedSearchTerm, selectedStatus, selectedCashFlowStatus, selectedValueTier, selectedUrgency, selectedDateRange, sortField, sortDirection, clientMap]);

  const handleSort = (field: 'amount' | 'date' | 'invoice_number' | 'client') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection(field === 'amount' ? 'desc' : 'asc'); // Amount defaults to desc (highest first)
    }
    
    // Update legacy amountSort for backward compatibility
    if (field === 'amount') {
      setAmountSort(sortDirection === 'asc' ? 'desc' : 'asc');
    }
  };

  const resetFilters = () => {
    setSelectedCashFlowStatus('all');
    setSelectedValueTier('all');
    setSelectedUrgency('all');
    setSelectedClientType('all');
    setSelectedDateRange('all');
    setSelectedStatus('all');
    setSortField('date');
    setSortDirection('desc');
    setAmountSort('desc');
  };


  const handleExportToCSV = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      const invoiceIds = filteredInvoices.map(inv => inv.id);
      await InvoiceExportService.export({
        format: 'csv',
        invoiceIds,
        includeLineItems: true,
        includePayments: true,
        organizationId: selectedOrg.id
      });
    } catch (error) {
      console.error('Error exporting invoices:', error);
      alert('Failed to export invoices. Please try again.');
    }
  };

  const handleExportToExcel = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      const invoiceIds = filteredInvoices.map(inv => inv.id);
      await InvoiceExportService.export({
        format: 'excel',
        invoiceIds,
        includeLineItems: true,
        includePayments: true,
        organizationId: selectedOrg.id
      });
    } catch (error) {
      console.error('Error exporting invoices:', error);
      alert('Failed to export invoices. Please try again.');
    }
  };

  const handleExportToPDF = async (invoiceId: string) => {
    if (!selectedOrg?.id) return;
    
    try {
      await InvoiceExportService.exportInvoiceToPDF(invoiceId, selectedOrg.id);
    } catch (error) {
      console.error('Error exporting invoice to PDF:', error);
      alert('Failed to export invoice. Please try again.');
    }
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
          total_price: item.price * item.quantity,
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
              className="w-full bg-white text-black py-2 px-4 rounded-[8px] hover:bg-gray-100 transition-colors font-medium"
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

  // New contractor features functions
  const handleViewPayments = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentTracker(true);
  };

  const handleCreateProgressInvoice = () => {
    setShowProgressBilling(true);
  };

  const getPaymentProgress = (invoice: any) => {
    if (invoice.amount <= 0) return 0;
    const totalPaid = invoice.total_paid || 0;
    return Math.min((totalPaid / invoice.amount) * 100, 100);
  };

  const getStatusBadge = (invoice: any) => {
    const balanceDue = invoice.amount - (invoice.total_paid || 0);
    
    if (balanceDue <= 0) {
      return { text: 'PAID', color: 'bg-[#388E3C] text-white' };
    }
    
    if (invoice.total_paid > 0) {
      return { text: 'PARTIAL', color: 'bg-[#F9D71C] text-black' };
    }
    
    const isOverdue = new Date(invoice.due_date) < new Date();
    if (isOverdue) {
      return { text: 'OVERDUE', color: 'bg-[#D32F2F] text-white' };
    }
    
    // Check for opened status
    if (invoice.status === 'opened') {
      return { text: 'OPENED', color: 'bg-[#1976D2] text-white' };
    }
    
    // Check for sent status
    if (invoice.status === 'sent') {
      return { text: 'SENT', color: 'bg-[#757575] text-white' };
    }
    
    // Check for draft status
    if (invoice.status === 'draft') {
      return { text: 'DRAFT', color: 'bg-[#424242] text-white' };
    }
    
    return { text: 'UNPAID', color: 'bg-gray-600 text-white' };
  };

  return (
          <div>
        {/* Unified Stats + Content Container */}
        <div className="bg-transparent border border-[#333333]">
        {/* Stats Section */}
        <div className={`${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
          {isMinimal || isConstrained ? (
            // Compact 4-column row for constrained/minimal
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL INVOICED</div>
                <div className="text-base font-semibold mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</div>
                <div className="text-xs text-gray-500">{invoices.length} invoices</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL PAID</div>
                <div className="text-base font-semibold text-[#388E3C] mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_paid || 0), 0))}</div>
                <div className="text-xs text-gray-500">collected</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">OUTSTANDING</div>
                <div className="text-base font-semibold text-[#F9D71C] mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.amount - (inv.total_paid || 0)), 0))}</div>
                <div className="text-xs text-gray-500">owed</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">OVERDUE</div>
                <div className="text-base font-semibold text-[#D32F2F] mt-1">{formatCurrency(invoices.reduce((sum, inv) => {
                  const isOverdue = new Date(inv.due_date) < new Date() && (inv.total_paid || 0) < inv.amount;
                  return sum + (isOverdue ? (inv.amount - (inv.total_paid || 0)) : 0);
                }, 0))}</div>
                <div className="text-xs text-gray-500">past due</div>
              </div>
            </div>
          ) : (
            // Full 4-column layout for desktop
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL INVOICED</div>
                <div className="text-lg font-semibold mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</div>
                <div className="text-xs text-gray-500">({invoices.length} invoices • lifetime business)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL PAID</div>
                <div className="text-lg font-semibold text-[#388E3C] mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_paid || 0), 0))}</div>
                <div className="text-xs text-gray-500">(cash collected • {Math.round((invoices.reduce((sum, inv) => sum + (inv.total_paid || 0), 0) / Math.max(invoices.reduce((sum, inv) => sum + inv.amount, 0), 1)) * 100)}% collection rate)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">OUTSTANDING</div>
                <div className="text-lg font-semibold text-[#F9D71C] mt-1">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.amount - (inv.total_paid || 0)), 0))}</div>
                <div className="text-xs text-gray-500">({invoices.filter(inv => (inv.amount - (inv.total_paid || 0)) > 0).length} invoices owed)</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">OVERDUE</div>
                <div className="text-lg font-semibold text-[#D32F2F] mt-1">{formatCurrency(invoices.reduce((sum, inv) => {
                  const isOverdue = new Date(inv.due_date) < new Date() && (inv.total_paid || 0) < inv.amount;
                  return sum + (isOverdue ? (inv.amount - (inv.total_paid || 0)) : 0);
                }, 0))}</div>
                <div className="text-xs text-gray-500">({invoices.filter(inv => {
                  const isOverdue = new Date(inv.due_date) < new Date() && (inv.total_paid || 0) < inv.amount;
                  return isOverdue;
                }).length} past due • requires action)</div>
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
                  className={`px-3 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#333333] rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2 ${showFilterMenu ? 'bg-[#252525]' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{isConstrained ? '' : 'More Filters'}</span>
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

            {/* Right side - Compact toggle and Options menu */}
            <div className="flex items-center gap-3">
              {/* Compact Table Toggle */}
              <button
                onClick={() => setIsCompactTable(!isCompactTable)}
                className={`p-2 bg-[#1E1E1E] border border-[#333333] hover:bg-[#333333] rounded-[4px] transition-colors ${isCompactTable ? 'bg-[#333333] text-[#3B82F6]' : 'text-gray-400'}`}
                title="Toggle compact view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              
              <div className="relative" ref={optionsMenuRef}>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 bg-[#1E1E1E] border border-[#333333] hover:bg-[#333333] rounded-[4px] transition-colors text-gray-400"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      handleCreateProgressInvoice();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-3 text-gray-400" />
                    Progress Invoice
                  </button>
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333] border-t border-[#333333] mt-1">
                    Export Options
                  </div>
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
                  <button
                    onClick={() => {
                      handleExportToExcel();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3 mr-3 text-gray-400" />
                    Export to Excel
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className={`${isCompactTable ? 'px-3 py-1.5' : isMinimal ? 'px-4 py-2' : isConstrained ? 'px-4 py-2' : 'px-6 py-3'} border-b border-[#333333]/50 bg-[#1E1E1E]/50`}>
          <div className={`grid ${
            isCompactTable 
              ? 'grid-cols-6' 
              : isMinimal ? 'grid-cols-8' : isConstrained ? 'grid-cols-8' : 'grid-cols-12'
          } gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider items-center`}>
            <button 
              onClick={() => handleSort('invoice_number')}
              className={`${
                isCompactTable 
                  ? 'col-span-2' 
                  : isMinimal ? 'col-span-3' : isConstrained ? 'col-span-5' : 'col-span-6'
              } text-left hover:text-white transition-colors flex items-center gap-1 ${
                sortField === 'invoice_number' ? 'text-white' : ''
              }`}
            >
              INVOICE
              {sortField === 'invoice_number' && (
                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
              )}
            </button>
            <button 
              onClick={() => handleSort('amount')}
              className={`${
                isCompactTable 
                  ? 'col-span-2 text-center' 
                  : isMinimal ? 'col-span-3' : isConstrained ? 'col-span-2' : 'col-span-3'
              } text-center hover:text-white transition-colors flex items-center justify-center gap-1 ${
                sortField === 'amount' ? 'text-white' : ''
              }`}
            >
              AMOUNT
              {sortField === 'amount' && (
                sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {!isCompactTable && !isMinimal && !isConstrained && (
              <button 
                onClick={() => handleSort('date')}
                className={`col-span-2 text-left hover:text-white transition-colors flex items-center gap-1 ${
                  sortField === 'date' ? 'text-white' : ''
                }`}
              >
                DUE DATE
                {sortField === 'date' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
            {isCompactTable && <div className="col-span-1 text-center">STATUS</div>}
            <div className={`${
              isCompactTable 
                ? 'col-span-1' 
                : isMinimal ? 'col-span-2' : isConstrained ? 'col-span-1' : 'col-span-1'
            } text-right`}></div>
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
                  <TableSkeleton rows={5} variant="invoice" />
                ) : (
                  <>
                    {filteredInvoices.map((invoice) => {
                      const client = clients.find(c => c.id === invoice.client_id);
                      const daysPastDue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
                      const status = getStatusBadge(invoice);
                      const progress = getPaymentProgress(invoice);
                      
                      return (
                        <div
                          key={invoice.id}
                          className={`group grid ${
                            isCompactTable
                              ? 'grid-cols-6 gap-2 px-3 py-1.5'
                              : isMinimal 
                                ? 'grid-cols-8 gap-4 px-4 py-3' 
                                : isConstrained 
                                  ? 'grid-cols-8 gap-4 px-4 py-3' 
                                  : 'grid-cols-12 gap-4 px-6 py-4'
                          } items-center hover:bg-[#1A1A1A] transition-colors cursor-pointer border-b border-[#333333]/50 last:border-b-0`}
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          {/* Invoice Column */}
                          <div className={`${
                            isCompactTable 
                              ? 'col-span-2' 
                              : isMinimal ? 'col-span-3' : isConstrained ? 'col-span-5' : 'col-span-6'
                          }`}>
                            {isCompactTable ? (
                              // Compact layout - just invoice number and client
                              <div>
                                <div className="font-medium text-white text-sm truncate">
                                  {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {client?.name || 'Unknown Client'}
                                </div>
                              </div>
                            ) : (
                              // Normal layout with status badge and progress
                              <div className={`flex items-center ${isMinimal ? 'gap-2' : 'gap-3'}`}>
                                <span className={`text-xs px-2 py-1 font-medium min-w-[60px] text-center ${status.color}`}>
                                  {status.text}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className={`font-medium text-white truncate ${isMinimal ? 'text-sm' : ''}`}>
                                    {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate mt-0.5">
                                    {client?.name || 'Unknown Client'}
                                  </div>
                                  {/* Payment Progress Bar */}
                                  {(invoice.total_paid || 0) > 0 && (
                                    <div className="mt-1">
                                      <div className="w-full bg-[#333333] rounded-[2px] h-1">
                                        <div 
                                          className="bg-[#388E3C] h-1 rounded-[2px] transition-all duration-300"
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {Math.round(progress)}% paid
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Amount Column */}
                          <div className={`${
                            isCompactTable 
                              ? 'col-span-2 text-center' 
                              : isMinimal ? 'col-span-3' : isConstrained ? 'col-span-2' : 'col-span-3'
                          } text-center`}>
                            <div className={`font-mono font-semibold text-white ${isCompactTable || isMinimal ? 'text-sm' : ''}`}>
                              {formatCurrency(invoice.amount)}
                            </div>
                            {!isCompactTable && (
                              <div className="text-xs text-gray-400 capitalize">Invoice</div>
                            )}
                          </div>
                          
                          {/* Status Column - Only in compact mode */}
                          {isCompactTable && (
                            <div className="col-span-1 text-center">
                              <span className={`text-xs px-1.5 py-0.5 font-medium ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                          )}
                          
                          {/* Client Column - Only shown in full mode */}
                          {!isCompactTable && !isMinimal && !isConstrained && (
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
                          <div className={`${
                            isCompactTable 
                              ? 'col-span-1' 
                              : isMinimal ? 'col-span-2' : isConstrained ? 'col-span-1' : 'col-span-1'
                          } flex justify-end relative`}>
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
                                className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                              >
                                <MoreVertical className={`${isCompactTable ? 'w-3 h-3' : isMinimal ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
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
            console.log('Invoice save started with data:', data);
            
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
                  description: data.description, // Re-enabled - column now exists
                  project_id: data.project_id || null
                })
                .eq('id', editingInvoice.id);

              if (invoiceError) {
                console.error('Error updating invoice:', invoiceError);
                alert(`Error updating invoice: ${invoiceError.message}`);
                throw invoiceError;
              }

              // Delete existing items
              const { error: deleteError } = await supabase
                .from('invoice_items')
                .delete()
                .eq('invoice_id', editingInvoice.id);

              if (deleteError) {
                console.error('Error deleting invoice items:', deleteError);
                throw deleteError;
              }

              // Create new invoice items
              const itemsToInsert = data.items.map(item => ({
                invoice_id: editingInvoice.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price, // Changed back to unit_price
                total_price: item.price * item.quantity, // Add total_price calculation
                description: item.description
              }));

              console.log('Inserting invoice items:', itemsToInsert);

              const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

              if (itemsError) {
                console.error('Error inserting invoice items:', itemsError);
                alert(`Error inserting invoice items: ${itemsError.message}`);
                throw itemsError;
              }
            } else {
              // Create new invoice using InvoiceService
              console.log('Creating new invoice with user_id:', user?.id);
              
              if (!selectedOrg?.id) {
                // If still loading, wait a moment and retry
                if (selectedOrg?.name === 'Loading...') {
                  alert('Organization is still loading. Please wait a moment and try again.');
                  return;
                }
                console.error('No organization selected. Current selectedOrg:', selectedOrg);
                console.error('Available localStorage:', localStorage.getItem('selectedOrgId'));
                alert('No organization selected. Please select an organization and try again.');
                return;
              }
              
              const { InvoiceService } = await import('../../services/InvoiceService');
              
              const invoiceData = {
                user_id: user?.id,
                organization_id: selectedOrg.id,
                client_id: data.client_id,
                project_id: data.project_id || undefined,
                amount: data.total_amount,
                subtotal: data.total_amount,
                status: data.status as 'draft' | 'sent' | 'opened' | 'paid' | 'overdue' | 'signed',
                issue_date: data.issue_date,
                due_date: data.due_date,
                notes: data.description,
                terms: 'Net 30',
                invoice_items: data.items?.map(item => ({
                  description: item.description || '',
                  quantity: item.quantity,
                  unit_price: item.price,
                  total_price: item.price * item.quantity,
                  product_id: item.product_id
                })) || []
              };
              
              console.log('Invoice data to create:', invoiceData);
              
              const newInvoice = await InvoiceService.create(invoiceData);
              
              console.log('Invoice created successfully:', newInvoice);
            }

            // Refresh the data
            await fetchData();
            setShowCreateDrawer(false);
            setEditingInvoice(null);
          } catch (error) {
            console.error('Error saving invoice:', error);
            // Error is already shown via alert
          }
        }}
      />

      {/* Fixed positioned invoice dropdown to prevent clipping */}
      {openInvoiceDropdown && (
        <div 
          className="fixed w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg py-1"
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
              const invoice = invoices.find(inv => inv.id === openInvoiceDropdown);
              if (invoice) handleViewPayments(invoice);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
          >
            <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
            Track Payments
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
          <button
            onClick={() => {
              handleExportToPDF(openInvoiceDropdown);
              setOpenInvoiceDropdown(null);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
          >
            <FileDown className="w-4 h-4 mr-3 text-gray-400" />
            Export as PDF
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
      
      {/* Payment Tracker Modal */}
      {showPaymentTracker && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <h2 className="text-xl font-bold text-white">
                Payment Tracking - {selectedInvoice.invoice_number || `INV-${selectedInvoice.id.slice(-6)}`}
              </h2>
              <button
                onClick={() => setShowPaymentTracker(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-[4px] transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PaymentTracker
                invoiceId={selectedInvoice.id}
                invoiceAmount={selectedInvoice.amount}
                totalPaid={selectedInvoice.total_paid || 0}
                balanceDue={selectedInvoice.amount - (selectedInvoice.total_paid || 0)}
                onPaymentAdded={() => {
                  fetchData(); // Refresh your existing data
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress Billing Modal */}
      <ProgressBillingModal
        isOpen={showProgressBilling}
        onClose={() => setShowProgressBilling(false)}
        onSuccess={(invoiceId) => {
          console.log('Progress invoice created:', invoiceId);
          fetchData(); // Refresh your existing data
        }}
      />
    </div>
  );
};