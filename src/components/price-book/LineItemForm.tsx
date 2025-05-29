import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { UNIT_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../../constants';

interface LineItemFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
  trade_id: string;
}

interface Trade {
  id: string;
  name: string;
}

interface LineItemFormProps {
  onSubmit: (data: LineItemFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<LineItemFormData>;
  submitLabel?: string;
}

export const LineItemForm: React.FC<LineItemFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Save'
}) => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '0',
      unit: initialData?.unit || 'hour',
      type: initialData?.type || 'material',
      trade_id: initialData?.trade_id || ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    fetchTrades();
  }, [user]);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const onFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Ensure price is a valid number and never null
      const price = data.price ? parseFloat(data.price) : 0;
      
      await onSubmit({
        name: data.name,
        description: data.description,
        price: isNaN(price) ? 0 : price,
        unit: data.unit,
        type: data.type,
        trade_id: data.trade_id
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
      <div>
        <label htmlFor="trade_id" className="block text-sm font-medium text-gray-300 mb-1">
          Trade
        </label>
        <select
          {...register('trade_id', { required: 'Trade selection is required' })}
          id="trade_id"
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
        >
          <option value="" className="bg-[#333333] text-white">Select Trade</option>
          {trades.map(trade => (
            <option key={trade.id} value={trade.id} className="bg-[#333333] text-white">
              {trade.name}
            </option>
          ))}
        </select>
        {errors.trade_id && (
          <p className="mt-1 text-sm text-[#D32F2F]">{errors.trade_id.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Item Name
        </label>
        <input
          {...register('name', { required: 'Name is required' })}
          type="text"
          id="name"
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          placeholder="Enter name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-[#D32F2F]">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40 resize-none"
          placeholder="Enter description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
            Type
          </label>
          <select
            {...register('type')}
            id="type"
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          >
            {PRODUCT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className="bg-[#333333] text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-300 mb-1">
            Unit
          </label>
          <select
            {...register('unit')}
            id="unit"
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          >
            {UNIT_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className="bg-[#333333] text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
          Price
        </label>
        <input
          {...register('price', {
            required: 'Price is required',
            pattern: {
              value: /^\d*\.?\d*$/,
              message: 'Please enter a valid number',
            },
            setValueAs: value => value === '' ? '0' : value,
          })}
          type="text"
          id="price"
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40 font-mono"
          placeholder="0.00"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-[#D32F2F]">{errors.price.message as string}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[#336699]/40 rounded-[4px] text-white hover:bg-[#333333] transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}; 