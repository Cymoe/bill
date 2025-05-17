import React from 'react';

interface InvoiceDetailsDrawerProps {
  invoice: any;
  client: any;
  onClose: () => void;
}

const InvoiceDetailsDrawer: React.FC<InvoiceDetailsDrawerProps> = ({ invoice, client, onClose }) => {
  if (!invoice) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-[#232635] z-50 shadow-xl flex flex-col border-l border-[#35384A] animate-slide-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#35384A]">
        <span className="text-xl font-bold text-white">Invoice Details</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">×</button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mb-4">
          <div className="text-2xl font-bold text-white mb-2">{`INV-${invoice.id.slice(0, 8)}`}</div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-[#35384A] rounded-full flex items-center justify-center">
              <span className="block w-3 h-3 bg-[#6C6FE4] rounded-full"></span>
            </span>
            <span className="text-gray-400 text-base">{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
          </div>
          <div className="flex gap-2 mb-4">
            <button className="bg-[#6C6FE4] text-white font-medium rounded-md px-8 py-2">Edit</button>
            <button className="bg-[#35384A] text-white font-medium rounded-md px-8 py-2">Finalize</button>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-sm font-bold text-white mb-1">CLIENT</div>
          <div className="text-base text-white mb-1">{client?.name}</div>
          <div className="text-sm text-gray-400 mb-1">{client?.email}</div>
          <div className="text-sm text-gray-400 mb-1">{client?.phone}</div>
        </div>
        <div className="mb-6">
          <div className="text-sm font-bold text-white mb-1">INVOICE DETAILS</div>
          <div className="flex flex-col gap-1 text-sm text-gray-400">
            <div><span className="font-bold text-white">Issue Date</span> <span className="ml-2">{new Date(invoice.issue_date).toLocaleDateString()}</span></div>
            <div><span className="font-bold text-white">Due Date</span> <span className="ml-2">{new Date(invoice.due_date).toLocaleDateString()}</span></div>
            <div><span className="font-bold text-white">Reference</span> <span className="ml-2">{invoice.reference || '-'}</span></div>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-sm font-bold text-white mb-2">ITEMS</div>
          <div className="bg-[#1A1C28] rounded-md p-3 mb-2 flex justify-between items-center">
            <span className="text-white">{invoice.items?.[0]?.description || invoice.items?.[0]?.product_id || 'Item'}</span>
            <span className="text-white">{invoice.items?.[0] ? `$${invoice.items[0].price.toFixed(2)}` : ''}</span>
          </div>
          {/* Add more items if needed */}
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-gray-400 text-sm mb-1">
            <span>Subtotal</span>
            <span>${invoice.amount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between text-gray-400 text-sm mb-1">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between text-white text-lg font-bold mt-2">
            <span>Total</span>
            <span>${invoice.amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-8">
          <button className="bg-[#35384A] text-white font-medium rounded-md px-8 py-3">Download PDF</button>
          <button className="bg-[#35384A] text-white font-medium rounded-md px-8 py-3">Send to Client</button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsDrawer; 