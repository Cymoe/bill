import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronRight, Share2, Copy } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import TabMenu from '../common/TabMenu';
import { DashboardLayout } from '../layouts/DashboardLayout';
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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredInvoices = invoices.filter((invoice) => {
    const displayNumber = `INV-${invoice.id.slice(0, 8)}`;
    const matchesSearch = displayNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <DashboardLayout>
      <PageHeader
        title="Invoices"
        subtitle="Manage all your invoices in one place"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        showSearch
        onFilter={() => setShowFilterMenu(!showFilterMenu)}
        onMenu={() => setIsMenuOpen(!isMenuOpen)}
        searchPlaceholder="Search invoices by number..."
        actionButton={
          <NewButton
            label="New Invoice"
            onClick={() => setShowNewModal(true)}
            color="blue"
          />
        }
      />
      {/* Filter Menu */}
      {showFilterMenu && (
        <div className="p-4 bg-[#1E2130] border border-gray-800 rounded-lg mx-4 mt-4 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4">Filter By</h3>
          
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedStatus(filter.value)}
                    className={`px-3 py-2 text-sm rounded-lg ${selectedStatus === filter.value ? 'bg-blue-600 text-white' : 'bg-[#232635] text-gray-400 hover:bg-[#2A2F40]'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Amount Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between pt-2">
              <button 
                className="px-6 py-2 bg-[#232635] text-gray-400 rounded-lg hover:bg-[#2A2F40]"
                onClick={() => setShowFilterMenu(false)}
              >
                Reset
              </button>
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowFilterMenu(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Invoice summary cards */}
      <div className="hidden md:flex gap-0">
        {/* Total Outstanding */}
        <div className="flex-1 border border-[#35384A] border-r-0 p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1">Total Outstanding</span>
          <span className="text-2xl font-bold text-white">{formatCurrency(invoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.amount : 0), 0))}</span>
          <span className="text-xs text-gray-500">{invoices.filter(inv => inv.status !== 'paid').length} invoices</span>
        </div>
        {/* Draft Invoices */}
        <div className="flex-1 border border-[#35384A] border-r-0 p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1">Draft Invoices</span>
          <span className="text-2xl font-bold text-white">{invoices.filter(inv => inv.status === 'draft').length}</span>
          <button className="mt-2 bg-[#35384A] text-gray-400 text-xs font-medium rounded-full px-4 py-1 cursor-not-allowed" disabled>Finalize</button>
        </div>
        {/* Overdue */}
        <div className="flex-1 border border-[#35384A] border-r-0 p-4 flex flex-col justify-center min-w-[180px]">
          <span className="text-sm text-gray-400 mb-1">Overdue</span>
          <span className="text-2xl font-bold text-white">{formatCurrency(invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0))}</span>
          <span className="text-xs text-gray-500">{invoices.filter(inv => inv.status === 'overdue').length} invoices</span>
        </div>
        {/* Paid */}
        <div className="flex-1 border border-[#35384A] p-4 flex flex-col justify-center min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Paid</span>
            <select
              value={paidPeriod}
              onChange={e => setPaidPeriod(e.target.value as any)}
              className="bg-[#35384A] text-xs text-[#6BFF90] rounded px-2 py-1 outline-none border-none"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <span className="text-2xl font-bold" style={{ color: '#6BFF90' }}>{formatCurrency(paidAmountForPeriod)}</span>
          <span className="text-xs text-gray-500">{paidInvoicesForPeriod.length} invoices</span>
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
        {/* Desktop table */}
        <div className="hidden md:flex flex-col min-h-[calc(100vh-64px)]">
          <div className="flex-1 flex flex-col">
            {isLoading ? (
              <TableSkeleton rows={5} columns={7} />
            ) : (
              <div className="bg-transparent shadow-[0_2px_8px_0_rgba(20,20,40,0.12)] border border-[#232635]">
                <table className="min-w-full bg-transparent">
                  <thead>
                    <tr className="bg-[#232635] sticky top-0 z-10">
                      <th className="w-12 px-2 py-3 align-middle">
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-[#6C6FE4] bg-transparent border-[#6C6FE4] rounded-sm"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="text-left px-2 py-3 font-bold">INVOICE #</th>
                      <th className="text-left px-2 py-3 font-bold">CLIENT</th>
                      <th className="text-left px-2 py-3 font-bold">DATE</th>
                      <th className="text-left px-2 py-3 font-bold">DUE</th>
                      <th className="text-left px-2 py-3 font-bold">STATUS</th>
                      <th className="text-right px-2 py-3 font-bold">AMOUNT</th>
                      <th className="w-8 px-2 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className={`transition-colors ${selectedRows.includes(invoice.id) ? 'bg-[#232635]' : 'hover:bg-[#232635]/80'} cursor-pointer`}
                        onClick={() => toggleSelectRow(invoice.id)}
                      >
                        <td className="px-2 py-3 align-middle">
                          <div className="flex items-center h-full" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-[#6C6FE4] bg-transparent border-[#6C6FE4] rounded-sm"
                              checked={selectedRows.includes(invoice.id)}
                              onChange={() => toggleSelectRow(invoice.id)}
                            />
                          </div>
                        </td>
                        <td className="px-2 py-3 font-medium">{`INV-${invoice.id.slice(0, 8)}`}</td>
                        <td className="px-2 py-3">{clients.find(c => c.id === invoice.client_id)?.name || ''}</td>
                        <td className="px-2 py-3">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                        <td className="px-2 py-3">{new Date(invoice.due_date).toLocaleDateString()}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center">
                              <span className="w-5 h-5 bg-[#35384A] rounded-full flex items-center justify-center mr-2">
                                <span className="block w-2 h-2 bg-[#6C6FE4] rounded-full"></span>
                              </span>
                              <span className="text-gray-400 text-sm">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right font-bold">{formatCurrency(invoice.amount)}</td>
                        <td className="px-2 py-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              trigger={
                                <button>
                                  <span className="sr-only">Actions</span>
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
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
                className="fixed bottom-0 z-50 bg-[#232635] border-t border-[#35384A] flex items-center px-8 py-4 gap-4 shadow-lg"
                style={{ left: 256, width: 'calc(100vw - 256px)' }}
              >
                <span className="text-white font-medium">{selectedRows.length} invoice{selectedRows.length > 1 ? 's' : ''} selected</span>
                <button className="bg-[#35384A] text-white font-medium rounded-md px-6 py-2">Finalize</button>
                <button className="bg-[#35384A] text-white font-medium rounded-md px-6 py-2">Download</button>
                <button className="bg-[#FF4B4B] text-white font-medium rounded-md px-6 py-2">Delete</button>
                <button className="ml-auto text-[#6C6FE4] font-medium" onClick={() => setSelectedRows([])}>Clear</button>
              </div>
            )}
          </div>
          <div className="flex-grow" />
          <div className="flex flex-col items-center mt-auto pb-8">
            <div className="text-lg font-medium text-gray-400 mb-2">Ready to create more invoices?</div>
            <div className="text-sm text-gray-500 mb-6">Use the "+ New Invoice" button to get started.</div>
            <button
              className="bg-[#232635] text-[#6C6FE4] px-8 py-3 rounded-lg font-medium"
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
    </DashboardLayout>
  );
};