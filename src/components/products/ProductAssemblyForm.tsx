import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export interface LineItem {
  id: string;
  name: string;
  unit: string;
  price: number;
}

export interface ProductAssemblyFormProps {
  lineItems: LineItem[];
  onClose: () => void;
  onSave: (data: any) => void;
  editingProduct?: any; // Product | null
}

export const ProductAssemblyForm: React.FC<ProductAssemblyFormProps> = ({ lineItems, onClose, onSave, editingProduct }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<{ lineItemId: string; quantity: number }[]>([]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setItems(editingProduct.items || []);
    } else {
      setName('');
      setDescription('');
      setItems([]);
    }
  }, [editingProduct]);

  const addItem = () => setItems([...items, { lineItemId: '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: 'lineItemId' | 'quantity', value: any) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [key]: value } : item));
  };

  const getLineItem = (id: string) => lineItems.find(li => li.id === id);
  const total = items.reduce((sum, item) => {
    const li = getLineItem(item.lineItemId);
    return sum + (li ? li.price * item.quantity : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, items, id: editingProduct?.id });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">{editingProduct ? 'Edit Product / Assembly' : 'New Product / Assembly'}</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-6 w-6" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Product/Assembly Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        rows={2}
      />
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">Line Items</span>
          <button type="button" onClick={addItem} className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        </div>
        {items.length === 0 && <div className="text-gray-400 text-sm">No line items yet.</div>}
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <select
              value={item.lineItemId}
              onChange={e => updateItem(idx, 'lineItemId', e.target.value)}
              className="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Select line item...</option>
              {lineItems.map(li => (
                <option key={li.id} value={li.id}>{li.name} ({formatCurrency(li.price)}/{li.unit})</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
              className="w-16 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <span className="text-gray-500 text-xs">
              {getLineItem(item.lineItemId)?.unit || ''}
            </span>
            <span className="text-gray-700 dark:text-gray-200 text-sm font-mono ml-2">
              {getLineItem(item.lineItemId) ? formatCurrency(getLineItem(item.lineItemId)!.price * item.quantity) : ''}
            </span>
            <button type="button" onClick={() => removeItem(idx)} className="ml-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={onClose} className="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
        <button type="submit" className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
      </div>
    </form>
  );
};

export default ProductAssemblyForm; 