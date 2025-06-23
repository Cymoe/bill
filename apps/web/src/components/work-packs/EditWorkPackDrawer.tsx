import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { WorkPack, WorkPackService } from '../../services/WorkPackService';
import { formatCurrency } from '../../utils/format';

interface EditWorkPackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workPack: WorkPack;
}

export const EditWorkPackDrawer: React.FC<EditWorkPackDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workPack
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tier: 'standard' as 'basic' | 'standard' | 'premium',
    base_price: 0,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workPack) {
      setFormData({
        name: workPack.name,
        description: workPack.description || '',
        tier: workPack.tier,
        base_price: workPack.base_price,
        is_active: workPack.is_active
      });
    }
  }, [workPack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await WorkPackService.update(workPack.id, {
        ...formData,
        organization_id: workPack.organization_id || ''
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating work pack:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-600 text-gray-100';
      case 'standard':
        return 'bg-blue-600 text-blue-100';
      case 'premium':
        return 'bg-purple-600 text-purple-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#1a1a1a] shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#333333] px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Edit Work Pack</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Work Pack Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                />
              </div>

              {/* Tier & Base Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'basic' | 'standard' | 'premium' })}
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Price
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: true })}
                      className="text-[#336699] focus:ring-[#336699]"
                    />
                    <span className="text-sm text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={!formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: false })}
                      className="text-[#336699] focus:ring-[#336699]"
                    />
                    <span className="text-sm text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Work Pack Info */}
              <div className="bg-[#222222] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Products</span>
                  <span className="text-white">{workPack.product_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tasks</span>
                  <span className="text-white">{workPack.task_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Documents</span>
                  <span className="text-white">{workPack.document_count || 0}</span>
                </div>
                {workPack.calculated_price !== undefined && (
                  <div className="flex justify-between text-sm pt-2 border-t border-[#333333]">
                    <span className="text-gray-400">Calculated Price</span>
                    <span className="text-white font-mono">{formatCurrency(workPack.calculated_price)}</span>
                  </div>
                )}
              </div>

              {/* Current Tier Badge */}
              <div className="bg-[#222222] rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Current Tier</p>
                <span className={`px-3 py-1 text-sm rounded-full ${getTierColor(formData.tier)}`}>
                  {formData.tier.charAt(0).toUpperCase() + formData.tier.slice(1)}
                </span>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-[#333333] px-6 py-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !formData.name || formData.base_price < 0}
                className="flex-1 px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#4477aa] transition-colors disabled:bg-[#555555] disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};