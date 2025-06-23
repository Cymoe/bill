import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
  trade_id: string;
  category?: string;
  is_base_product?: boolean;
  parent_product_id?: string;
  variant_name?: string;
}

interface ProductFormSimpleProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ProductFormData>;
  submitLabel?: string;
  isVariant?: boolean;
  parentProductName?: string;
}

const UNIT_OPTIONS = [
  { value: 'each', label: 'Each' },
  { value: 'sqft', label: 'Square Foot' },
  { value: 'lnft', label: 'Linear Foot' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'ton', label: 'Ton' },
  { value: 'cubic_yard', label: 'Cubic Yard' },
  { value: 'gallon', label: 'Gallon' },
  { value: 'pound', label: 'Pound' }
];

const TYPE_OPTIONS = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'service', label: 'Service' },
  { value: 'other', label: 'Other' }
];

export const ProductFormSimple: React.FC<ProductFormSimpleProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Save',
  isVariant = false,
  parentProductName
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trades, setTrades] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    unit: initialData?.unit || 'each',
    type: initialData?.type || 'material',
    trade_id: initialData?.trade_id || '',
    category: initialData?.category || '',
    is_base_product: initialData?.is_base_product ?? !isVariant,
    parent_product_id: initialData?.parent_product_id || '',
    variant_name: initialData?.variant_name || ''
  });

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTrades(data || []);
    } catch (err) {
      console.error('Error fetching trades:', err);
    }
  };

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
      {/* Variant Header */}
      {isVariant && parentProductName && (
        <div className="bg-[#1E1E1E] rounded-[4px] p-3 mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Creating variant for</div>
          <div className="text-white font-medium">{parentProductName}</div>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {isVariant ? 'Variant Name' : 'Product Name'}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          placeholder={isVariant ? "e.g., Premium Grade, 10ft Length" : "e.g., 2x4 Lumber"}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          rows={3}
          placeholder="Describe the product..."
        />
      </div>

      {/* Price and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Unit
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          >
            {UNIT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type and Trade */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          >
            {TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Trade
          </label>
          <select
            value={formData.trade_id}
            onChange={(e) => setFormData(prev => ({ ...prev, trade_id: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
            required
          >
            <option value="">Select a trade...</option>
            {trades.map(trade => (
              <option key={trade.id} value={trade.id}>
                {trade.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Category (optional)
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          placeholder="e.g., Framing, Electrical, Plumbing"
        />
      </div>

      {/* Base Product Checkbox (only for non-variants) */}
      {!isVariant && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_base_product"
            checked={formData.is_base_product}
            onChange={(e) => setFormData(prev => ({ ...prev, is_base_product: e.target.checked }))}
            className="w-4 h-4 bg-[#333333] border-[#555555] rounded text-[#336699] focus:ring-[#0D47A1] focus:ring-2"
          />
          <label htmlFor="is_base_product" className="text-sm text-gray-300">
            This is a base product (can have variants)
          </label>
        </div>
      )}

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