import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle, Pencil, MoreVertical } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { EditInvoiceModal } from './EditInvoiceModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { generatePDF } from '../../utils/pdfGenerator';
import { DetailSkeleton } from '../skeletons/DetailSkeleton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    try {
      const [invoiceRes, productsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, invoice_items(*)')
          .eq('id', id)
          .eq('user_id', user?.id)
          .single(),
        supabase
          .from('products')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (invoiceRes.error) throw invoiceRes.error;
      if (productsRes.error) throw productsRes.error;

      if (invoiceRes.data) {
        setInvoice(invoiceRes.data);
        // Fetch client data
        const clientRes = await supabase
          .from('clients')
          .select('*')
          .eq('id', invoiceRes.data.client_id)
          .eq('user_id', user?.id)
          .single();

        if (clientRes.error) throw clientRes.error;
        setClient(clientRes.data);
      }

      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load invoice details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !invoice || !client) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="hidden md:block">
            <Breadcrumbs 
              items={[
                { label: 'Invoices', href: '/invoices' },
                { label: 'Loading...' }
              ]} 
            />
          </div>
          <DetailSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  const handleMarkAsPaid = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'paid'
        })
        .eq('id', invoice.id);

      if (error) throw error;
      await fetchData(); // Refresh the data
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      setError('Failed to mark invoice as paid');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);

      if (error) throw error;
      navigate('/invoices');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    }
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

  const getDropdownItems = () => [
    {
      label: 'Edit',
      onClick: () => setShowEditModal(true),
      icon: <Pencil className="w-4 h-4" />
    },
    {
      label: 'Mark as Paid',
      onClick: handleMarkAsPaid,
      icon: <CheckCircle className="w-4 h-4" />,
      disabled: invoice.status === 'paid'
    },
    {
      label: 'Download PDF',
      onClick: () => {
        const items = invoice.invoice_items.map((item: any) => ({
          product_name: products.find(p => p.id === item.product_id)?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.unit_price
        }));
        generatePDF({ invoice, client, items, totalAmount: invoice.amount });
      },
      icon: <Download className="w-4 h-4" />
    },
    {
      label: 'Print',
      onClick: () => window.print(),
      icon: <Printer className="w-4 h-4" />
    },
    {
      label: 'Delete',
      onClick: () => setShowDeleteModal(true),
      icon: <Pencil className="w-4 h-4" />,
      className: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs 
            items={[
              { label: 'Invoices', href: '/invoices' },
              { label: `INV-${invoice.id.slice(0, 8)}` }
            ]} 
          />
        </div>

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between">
          <button
            onClick={() => navigate('/invoices')}
            className="flex items-center text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <Dropdown
            trigger={<MoreVertical className="w-6 h-6" />}
            items={getDropdownItems()}
          />
        </div>

        {/* Invoice details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-6 pb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoice {`INV-${invoice.id.slice(0, 8)}`}
            </h1>
            <div className="flex items-center gap-4">
              <span className={getStatusStyle(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
              <Dropdown
                trigger={<MoreVertical className="w-6 h-6" />}
                items={getDropdownItems()}
              />
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Client info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Bill To
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{client.company}</p>
                  <p>{client.name}</p>
                  <p>{client.email}</p>
                  {client.phone && <p>{client.phone}</p>}
                  {client.address && <p>{client.address}</p>}
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Invoice Date: </span>
                    {new Date(invoice.issue_date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Due Date: </span>
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(invoice.invoice_items || []).map((item: any, index: number) => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Total: {formatCurrency(invoice.amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditInvoiceModal
          invoice={invoice}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            fetchData();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          title="Delete Invoice"
          message="Are you sure you want to delete this invoice? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </DashboardLayout>
  );
};