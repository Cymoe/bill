import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Filter, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { NewInvoiceModal } from './NewInvoiceModal';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { Dropdown } from '../common/Dropdown';
import { exportInvoicesToCSV } from '../../utils/exportData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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

  const handleExport = () => {
    if (invoices && clients && products) {
      exportInvoicesToCSV(invoices, clients, products);
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

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Invoices', href: '/invoices' }]} />
        
        {/* Desktop Header */}
        <div className="hidden md:flex md:justify-between md:items-center gap-4">
          <div className="flex gap-4 flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <Dropdown
              trigger={
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Filter className="w-5 h-5" />
                  <span>{statusFilters.find(f => f.value === selectedStatus)?.label}</span>
                </button>
              }
              items={statusFilters.map(filter => ({
                label: filter.label,
                onClick: () => setSelectedStatus(filter.value),
                className: selectedStatus === filter.value ? 'bg-gray-100 dark:bg-gray-700' : ''
              }))}
            />

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Export to CSV"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>New Invoice</span>
          </button>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 w-full"
          >
            <Plus className="w-5 h-5" />
            <span>New Invoice</span>
          </button>

          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as InvoiceStatus)}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Export to CSV"
            >
              <Download className="w-5 h-5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          {isLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {`INV-${invoice.id.slice(0, 8)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusStyle(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(invoice.amount)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </DashboardLayout>
  );
};