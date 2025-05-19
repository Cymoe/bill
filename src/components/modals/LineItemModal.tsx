import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { UNIT_OPTIONS, PRODUCT_TYPE_OPTIONS } from '../../constants';

interface LineItemModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    price: number;
    unit: string;
    type: string;
  }) => void;
}

export const LineItemModal: React.FC<LineItemModalProps> = ({ onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '0',
      unit: 'hour',
      type: 'material'
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Ensure price is a valid number and never null
      const price = data.price ? parseFloat(data.price) : 0;
      
      await onSave({
        name: data.name,
        description: data.description,
        price: isNaN(price) ? 0 : price, // Default to 0 if NaN
        unit: data.unit,
        type: data.type
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-[#1A1F2C] p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-white">New Line Item</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400">
              Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              id="name"
              className="mt-1 block w-full rounded-lg bg-white/8 p-2.5 text-white placeholder-gray-400"
              placeholder="Enter name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-lg bg-white/8 p-2.5 text-white placeholder-gray-400"
              placeholder="Enter description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-400">
                Price
              </label>
              <input
                {...register('price', {
                  required: 'Price is required',
                  pattern: {
                    value: /^\d*\.?\d*$/,
                    message: 'Please enter a valid number',
                  },
                  setValueAs: value => value === '' ? '0' : value, // Ensure empty values become '0'
                })}
                type="text"
                id="price"
                className="mt-1 block w-full rounded-lg bg-white/8 p-2.5 text-white placeholder-gray-400"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price.message as string}</p>
              )}
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-400">
                Unit
              </label>
              <select
                {...register('unit', { required: 'Unit is required' })}
                id="unit"
                className="mt-1 block w-full rounded-lg bg-white/8 p-2.5 text-white"
              >
                {UNIT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-1 text-sm text-red-500">{errors.unit.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-400">
              Type
            </label>
            <select
              {...register('type', { required: 'Type is required' })}
              id="type"
              className="mt-1 block w-full rounded-lg bg-white/8 p-2.5 text-white"
            >
              {PRODUCT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-500">{errors.type.message as string}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
