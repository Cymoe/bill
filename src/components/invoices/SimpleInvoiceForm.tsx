import React, { useState } from 'react';

interface InvoiceFormData {
  invoiceNumber: string;
  client: string;
  amount: number;
  dueDate: string;
  description: string;
}

interface SimpleInvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<InvoiceFormData>;
  submitLabel?: string;
}

export const SimpleInvoiceForm: React.FC<SimpleInvoiceFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Save'
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: initialData?.invoiceNumber || 'INV-001',
    client: initialData?.client || '',
    amount: initialData?.amount || 0,
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    description: initialData?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Invoice Number */}
      <div>
        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-300 mb-1">
          Invoice Number
        </label>
        <input
          type="text"
          id="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          required
        />
      </div>

      {/* Client */}
      <div>
        <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-1">
          Client
        </label>
        <select
          id="client"
          value={formData.client}
          onChange={(e) => setFormData({ ...formData, client: e.target.value })}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          required
        >
          <option value="">Select a client</option>
          <option value="Acme Corp">Acme Corp</option>
          <option value="Johnson Home">Johnson Home</option>
          <option value="Smith Family">Smith Family</option>
        </select>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full pl-8 pr-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40 resize-none"
          rows={4}
          placeholder="Enter invoice description..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[#336699]/40 rounded-[4px] text-white hover:bg-[#333333] transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
                        className="flex-1 px-4 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}; 