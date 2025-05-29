import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { SlideOutDrawer } from '../../components/common/SlideOutDrawer';
import { InvoiceFormSimple } from '../../components/invoices/InvoiceFormSimple';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const InvoiceModalDrawerExample: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Mock data for demonstration
  const mockInvoices = [
    { 
      id: '1', 
      number: 'INV-001', 
      client_id: 'client-1', 
      amount: 2450.00, 
      status: 'sent',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      items: [
        { product_id: 'prod-1', quantity: 10, price: 245 }
      ]
    },
    { 
      id: '2', 
      number: 'INV-002', 
      client_id: 'client-2', 
      amount: 5200.00, 
      status: 'paid',
      issue_date: '2024-01-10',
      due_date: '2024-02-10',
      items: [
        { product_id: 'prod-2', quantity: 1, price: 5200 }
      ]
    },
  ];

  const handleCreateInvoice = async (data: any) => {
    console.log('Creating invoice:', data);
    
    try {
      // Calculate total
      const total = data.items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user?.id,
          client_id: data.client_id,
          amount: total,
          status: data.status,
          issue_date: data.issue_date,
          due_date: data.due_date
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (invoice && data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            data.items.map((item: any) => ({
              invoice_id: invoice.id,
              product_id: item.product_id,
              description: item.description || '',
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity
            }))
          );

        if (itemsError) throw itemsError;
      }

      setShowCreateModal(false);
      // In real app, refresh invoice list here
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleEditInvoice = async (data: any) => {
    console.log('Updating invoice:', data);
    
    try {
      if (!selectedInvoice) return;

      // Calculate total
      const total = data.items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          client_id: data.client_id,
          amount: total,
          status: data.status,
          issue_date: data.issue_date,
          due_date: data.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInvoice.id);

      if (invoiceError) throw invoiceError;

      // Delete existing items and insert new ones
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', selectedInvoice.id);

      if (deleteError) throw deleteError;

      // Insert new items
      if (data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            data.items.map((item: any) => ({
              invoice_id: selectedInvoice.id,
              product_id: item.product_id,
              description: item.description || '',
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity
            }))
          );

        if (itemsError) throw itemsError;
      }

      setShowEditDrawer(false);
      // In real app, refresh invoice list here
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-gray-500/20 text-gray-300',
      sent: 'bg-blue-500/20 text-blue-300',
      paid: 'bg-green-500/20 text-green-300',
      overdue: 'bg-red-500/20 text-red-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-[4px] text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Invoice Modal & Drawer Example</h1>

      {/* Create Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
        >
          Create New Invoice (Modal)
        </button>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white mb-4">Existing Invoices</h2>
        {mockInvoices.map(invoice => (
          <div key={invoice.id} className="bg-[#333333] p-4 rounded-[4px] flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-medium">{invoice.number}</h3>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-gray-400 text-sm">
                Amount: {formatCurrency(invoice.amount)} • Due: {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedInvoice(invoice);
                setShowEditDrawer(true);
              }}
              className="px-3 py-1 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors text-sm"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Invoice"
        size="lg"
      >
        <InvoiceFormSimple
          onSubmit={handleCreateInvoice}
          onCancel={() => setShowCreateModal(false)}
          submitLabel="Create Invoice"
        />
      </Modal>

      {/* Edit Invoice Drawer */}
      <SlideOutDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        title="Edit Invoice"
        width="lg"
      >
        {selectedInvoice && (
          <InvoiceFormSimple
            onSubmit={handleEditInvoice}
            onCancel={() => setShowEditDrawer(false)}
            initialData={{
              client_id: selectedInvoice.client_id,
              items: selectedInvoice.items,
              due_date: selectedInvoice.due_date,
              status: selectedInvoice.status,
              issue_date: selectedInvoice.issue_date
            }}
            submitLabel="Save Changes"
          />
        )}
      </SlideOutDrawer>
    </div>
  );
}; 