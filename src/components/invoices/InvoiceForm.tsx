import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';



interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceFormData {
  invoiceNumber: string;
  client: string;
  dueDate: string;
  description: string;
  items: InvoiceItem[];
}

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<InvoiceFormData>;
  submitLabel?: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Save'
}) => {
  const { user } = useAuth();
  const [clients, setClients] = React.useState<any[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || [{ description: '', quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id);
      if (error) console.error('Error fetching clients:', error);
      else setClients(data || []);
    };
    fetchClients();
  }, [user]);

  const [formData, setFormData] = useState<Omit<InvoiceFormData, 'items'>>({
    invoiceNumber: initialData?.invoiceNumber || 'INV-001',
    client: initialData?.client || '',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    description: initialData?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({ ...formData, items });
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
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company_name} - {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Line Items</label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)}
                className="w-20 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
              />
              <input
                type="number"
                placeholder="Price"
                value={item.unit_price}
                onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
              />
              <button type="button" onClick={() => removeItem(index)} className="text-red-500">X</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem} className="mt-2 px-3 py-1 bg-[#336699] text-white rounded-[4px]">
          <Plus className="w-4 h-4 inline-block mr-1" />
          Add Item
        </button>
      </div>

      {/* Total Amount */}
      <div className="text-right">
        <span className="text-gray-300">Total: </span>
        <span className="font-bold text-white">${totalAmount.toFixed(2)}</span>
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