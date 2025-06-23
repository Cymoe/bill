import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CostCodeService } from '../../services/CostCodeService';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { UNIT_OPTIONS } from '../../constants';

interface LineItemFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
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
  showSuccessMessage?: boolean;
}

export const LineItemForm: React.FC<LineItemFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Save'
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price?.toString() || '0',
      unit: initialData?.unit || 'hour',
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
    setIsSubmitting(true);
    setSubmitError(null);
    setIsLoading(true);
    
    try {
      // Ensure price is a valid number and never null
      const price = data.price ? parseFloat(data.price) : 0;
      
      await onSubmit({
        name: data.name,
        description: data.description,
        price: isNaN(price) ? 0 : price,
        unit: data.unit,
        cost_code_id: data.cost_code_id
      });
    } catch (error) {
      console.error('Error submitting line item:', error);
      // Set user-friendly error message
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Failed to save line item. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
      {/* Error Alert */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-500 rounded-[4px] p-3 mb-4">
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}
      
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
          {...register('name', { 
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            },
            maxLength: {
              value: 100,
              message: 'Name must be 100 characters or less'
            }
          })}
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
            validate: {
              positive: value => {
                const num = parseFloat(value);
                return num >= 0 || 'Price must be positive';
              },
              reasonable: value => {
                const num = parseFloat(value);
                return num <= 999999.99 || 'Price seems too high. Please verify.';
              },
              decimal: value => {
                const parts = value.toString().split('.');
                if (parts.length > 1 && parts[1].length > 2) {
                  return 'Price can have at most 2 decimal places';
                }
                return true;
              }
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
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-white text-black rounded-[8px] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}; 