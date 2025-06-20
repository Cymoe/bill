import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CostCodeService } from '../../services/CostCodeService';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { UNIT_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../../constants';

interface LineItemFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
  cost_code_id: string;
}

interface CostCode {
  id: string;
  name: string;
  code: string;
  industry?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
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
  const { selectedOrg } = useContext(OrganizationContext);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '0',
      unit: initialData?.unit || 'hour',
      type: initialData?.type || 'material',
      cost_code_id: initialData?.cost_code_id || ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [groupedCostCodes, setGroupedCostCodes] = useState<Map<string, CostCode[]>>(new Map());

  useEffect(() => {
    fetchCostCodes();
  }, [user]);

  const fetchCostCodes = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      // Use CostCodeService to get industry-filtered cost codes
      const costCodes = await CostCodeService.list(selectedOrg.id);
      setCostCodes(costCodes.map(cc => ({ 
        id: cc.id, 
        name: cc.name, 
        code: cc.code,
        industry: cc.industry 
      })));
      
      // Also get grouped version for dropdown
      const grouped = await CostCodeService.listGroupedByIndustry(selectedOrg.id);
      setGroupedCostCodes(grouped);
    } catch (error) {
      console.error('Error fetching cost codes:', error);
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
        cost_code_id: data.cost_code_id
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
      <div>
        <label htmlFor="cost_code_id" className="block text-sm font-medium text-gray-300 mb-1">
          Cost Code
        </label>
        <select
          {...register('cost_code_id', { required: 'Cost Code selection is required' })}
          id="cost_code_id"
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
        >
          <option value="" className="bg-[#333333] text-white">Select Cost Code</option>
          {Array.from(groupedCostCodes.entries()).map(([industryName, codes]) => (
            <optgroup 
              key={industryName} 
              label={`━━━  ${industryName.toUpperCase()}  ━━━`}
              className="bg-[#1E1E1E] text-gray-400 font-bold"
            >
              {codes.map(code => (
                <option 
                  key={code.id} 
                  value={code.id} 
                  className="bg-[#333333] text-white pl-4"
                >
                  {code.code} — {code.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.cost_code_id && (
          <p className="mt-1 text-sm text-[#D32F2F]">{errors.cost_code_id.message as string}</p>
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
                        className="flex-1 px-4 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}; 