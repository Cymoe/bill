import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UNIT_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../../constants';

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
}

export interface ProductFormProps {
  title: string;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
  error?: string | null;
  initialData?: Partial<ProductFormData>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  title,
  onClose,
  onSubmit,
  submitLabel,
  error,
  initialData = {
    name: '',
    description: '',
    price: 0,
    unit: 'hour',
    type: 'material'
  }
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    unit: initialData.unit || 'hour',
    type: initialData.type || 'material'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price.toString()),
        unit: formData.unit,
        type: formData.type
      });
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-[#121212]">
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#121212]">
        <h2 className="text-xl font-bold text-white font-['Roboto_Condensed'] uppercase">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          <span className="sr-only">Close</span>
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
        {error && (
          <div className="p-4 bg-[#333333] border-l-4 border-[#D32F2F] rounded">
            <p className="text-sm text-white font-['Roboto']">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white font-['Roboto_Condensed'] uppercase">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded border-gray-700 shadow-sm focus:border-[#336699] focus:ring-[#336699] bg-[#333333] text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white font-['Roboto_Condensed'] uppercase">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded border-gray-700 shadow-sm focus:border-[#336699] focus:ring-[#336699] bg-[#333333] text-white font-['Roboto']"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-white font-['Roboto_Condensed'] uppercase">
              Price
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded border-gray-700 shadow-sm focus:border-[#336699] focus:ring-[#336699] bg-[#333333] text-white font-['Roboto_Mono']"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-white font-['Roboto_Condensed'] uppercase">
              Unit
            </label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="mt-1 block w-full rounded border-gray-700 shadow-sm focus:border-[#336699] focus:ring-[#336699] bg-[#333333] text-white"
            >
              {UNIT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-white font-['Roboto_Condensed'] uppercase">
              Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded border-gray-700 shadow-sm focus:border-[#336699] focus:ring-[#336699] bg-[#333333] text-white"
            >
              {PRODUCT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 p-4 bg-[#121212]">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-700 rounded hover:bg-[#1E1E1E] text-white font-['Roboto'] font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 disabled:opacity-50 font-['Roboto'] font-medium"
            disabled={loading}
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;