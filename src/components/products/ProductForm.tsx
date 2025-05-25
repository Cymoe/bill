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
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-[#121212] overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-4 border-b border-[#333333] bg-[#121212] flex-shrink-0">
        <h2 className="text-xl font-bold text-white font-['Roboto_Condensed'] uppercase">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-[#F9D71C]"
        >
          <span className="sr-only">Close</span>
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
        {error && (
          <div className="p-4 bg-[#333333] border-l-4 border-[#D32F2F] rounded-[4px]">
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
              className="mt-1 block w-full rounded-[4px] border border-[#555555] shadow-sm focus:border-[#0D47A1] focus:ring focus:ring-[#0D47A1] focus:ring-opacity-40 bg-[#333333] text-white h-10 px-3"
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
              className="mt-1 block w-full rounded-[4px] border border-[#555555] shadow-sm focus:border-[#0D47A1] focus:ring focus:ring-[#0D47A1] focus:ring-opacity-40 bg-[#333333] text-white font-['Roboto'] p-3"
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
              className="mt-1 block w-full rounded-[4px] border border-[#555555] shadow-sm focus:border-[#0D47A1] focus:ring focus:ring-[#0D47A1] focus:ring-opacity-40 bg-[#333333] text-white font-['Roboto_Mono'] h-10 px-3"
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
              className="mt-1 block w-full rounded-[4px] border border-[#555555] shadow-sm focus:border-[#0D47A1] focus:ring focus:ring-[#0D47A1] focus:ring-opacity-40 bg-[#333333] text-white h-10 px-3"
            >
              {UNIT_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-[#333333] text-white">
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
              className="mt-1 block w-full rounded-[4px] border border-[#555555] shadow-sm focus:border-[#0D47A1] focus:ring focus:ring-[#0D47A1] focus:ring-opacity-40 bg-[#333333] text-white h-10 px-3"
            >
              {PRODUCT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-[#333333] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="border-t border-[#333333] p-4 bg-[#121212] flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 border border-[#336699] border-opacity-40 rounded-[4px] bg-transparent hover:bg-[#1E1E1E] text-white font-['Roboto'] font-medium uppercase tracking-wider h-10"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#F9D71C] text-[#121212] rounded-[4px] hover:bg-opacity-90 disabled:opacity-50 font-['Roboto'] font-medium uppercase tracking-wider h-10"
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