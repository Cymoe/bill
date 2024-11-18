import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Download, Printer, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from '../../utils/format';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropdown } from '../common/Dropdown';
import { EditInvoiceModal } from './EditInvoiceModal';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { generatePDF } from '../../utils/pdfGenerator';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invoice = useQuery(api.invoices.getInvoiceById, { id: id as Id<"invoices"> });
  const client = useQuery(api.clients.getClientById, { id: invoice?.clientId as Id<"clients"> });
  const products = useQuery(api.products.getProducts) || [];
  const updateInvoice = useMutation(api.invoices.updateInvoice);
  const deleteInvoice = useMutation(api.invoices.deleteInvoice);

  if (!invoice || !client) return null;

  const handleMarkAsPaid = async () => {
    try {
      await updateInvoice({
        ...invoice,
        id: invoice._id,
        status: 'paid'
      });
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
    }
  };

  const handlePrint = () => {
    if (invoice && client) {
      const items = invoice.items.map(item => {
        const product = products.find(p => p._id === item.productId);
        return {
          product_name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price
        };
      });

      generatePDF({
        invoice,
        client,
        items,
        totalAmount: invoice.total_amount
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice({ id: invoice._id });
      navigate('/invoices');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    }
  };

  const getStatusStyle = (status: string) => {
    const baseStyle = "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ";
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
      label: 'Mark as Paid',
      onClick: handleMarkAsPaid,
      className: 'flex items-center gap-2',
      icon: <CheckCircle className="w-4 h-4" />,
      show: invoice.status === 'sent'
    },
    {
      label: 'Download PDF',
      onClick: handlePrint,
      className: 'flex items-center gap-2',
      icon: <Download className="w-4 h-4" />
    },
    {
      label: 'Print Invoice',
      onClick: handlePrint,
      className: 'flex items-center gap-2',
      icon: <Printer className="w-4 h-4" />
    },
    {
      label: 'Edit',
      onClick: () => setShowEditModal(true)
    },
    {
      label: 'Delete',
      onClick: () => setShowDeleteModal(true),
      className: 'text-red-600 hover:text-red-700'
    }
  ].filter(item => !item.show || item.show === true);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Mobile Back Button */}
        <button
          onClick={() => navigate('/invoices')}
          className="md:hidden flex items-center text-gray-600 dark:text-gray-400"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Invoices
        </button>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block">
          <Breadcrumbs 
            items={[
              { label: 'Invoices', href: '/invoices' },
              { label: `Invoice ${invoice.number}` }
            ]} 
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Invoice {invoice.number}
                </h1>
                <span className={getStatusStyle(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              <Dropdown
                trigger={
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400">
                    <MoreVertical className="w-6 h-6" />
                  </button>
                }
                items={getDropdownItems()}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Bill To
                </h2>
                <div className="text-gray-900 dark:text-white">
                  <p className="font-medium">{client.company}</p>
                  <p>{client.name}</p>
                  <p>{client.email}</p>
                  {client.phone && <p>{client.phone}</p>}
                  {client.address && <p className="whitespace-pre-line">{client.address}</p>}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Invoice Details
                </h2>
                <div className="space-y-2 text-gray-900 dark:text-white">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Issue Date:</span>
                    <span>{new Date(invoice.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                    <span className="font-medium">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Items
              </h2>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items.map((item, index) => {
                      const product = products.find(p => p._id === item.productId);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {product?.name || 'Unknown Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {invoice.items.map((item, index) => {
                  const product = products.find(p => p._id === item.productId);
                  return (
                    <div 
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {product?.name || 'Unknown Product'}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                        <span className="text-gray-900 dark:text-white">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Price</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(item.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-500 dark:text-gray-400">Total</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
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
          onSave={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          title="Delete Invoice"
          message="Are you sure you want to delete this invoice? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          error={error}
        />
      )}
    </DashboardLayout>
  );
};