import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { SlideOutDrawer } from '../../components/common/SlideOutDrawer';
import { SimpleInvoiceForm } from '../../components/invoices/SimpleInvoiceForm';

export const ModalAndDrawerExample: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Mock data
  const mockInvoices = [
    { id: 1, invoiceNumber: 'INV-001', client: 'Acme Corp', amount: 2450.00, dueDate: '2024-12-01', description: 'Web development services for Q4 2024' },
    { id: 2, invoiceNumber: 'INV-002', client: 'Johnson Home', amount: 5200.00, dueDate: '2024-12-15', description: 'Kitchen renovation project' },
  ];

  const handleCreateInvoice = async (data: any) => {
    console.log('Creating invoice:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowCreateModal(false);
  };

  const handleEditInvoice = async (data: any) => {
    console.log('Updating invoice:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowEditDrawer(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Modal & Drawer Pattern Example</h1>

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
            <div>
              <h3 className="text-white font-medium">{invoice.invoiceNumber}</h3>
              <p className="text-gray-400 text-sm">{invoice.client} - ${invoice.amount.toFixed(2)}</p>
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

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Line Item"
        size="md"
      >
        <SimpleInvoiceForm
          onSubmit={handleCreateInvoice}
          onCancel={() => setShowCreateModal(false)}
          submitLabel="Add Item"
        />
      </Modal>

      {/* Edit Drawer */}
      <SlideOutDrawer
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        title="Edit Invoice"
        width="md"
      >
        <SimpleInvoiceForm
          onSubmit={handleEditInvoice}
          onCancel={() => setShowEditDrawer(false)}
          initialData={selectedInvoice}
          submitLabel="Save Changes"
        />
      </SlideOutDrawer>
    </div>
  );
}; 