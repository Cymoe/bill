import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Product, ProductService } from '../../services/ProductService';
import { formatCurrency } from '../../utils/format';
import { PRODUCT_COLLECTIONS } from '../../constants/collections';
import { SERVICE_TYPES } from '../../constants/serviceTypes';

interface EditProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product;
}

export const EditProductDrawer: React.FC<EditProductDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    unit: 'each',
    type: 'service',
    category: 'residential',
    service_type: 'service_call',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        unit: product.unit,
        type: product.type,
        category: product.category || 'residential',
        service_type: product.service_type || 'service_call',
        status: product.status
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ProductService.update(product.id, {
        ...formData,
        organization_id: product.organization_id || ''
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#1a1a1a] shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#333333] px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Edit Product</h2>
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
                  Product Name
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

              {/* Price & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="each">Each</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="sqft">Square Foot</option>
                    <option value="lnft">Linear Foot</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>

              {/* Type & Service Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="service">Service</option>
                    <option value="material">Material</option>
                    <option value="equipment">Equipment</option>
                    <option value="labor">Labor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Service Type
                  </label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#336699]"
                  >
                    {SERVICE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#336699]"
                >
                  {Object.keys(PRODUCT_COLLECTIONS).map(key => (
                    <option key={key} value={key}>
                      {PRODUCT_COLLECTIONS[key as keyof typeof PRODUCT_COLLECTIONS].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#222222] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#336699]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Quality Tier (if applicable) */}
              {product.quality_tier && (
                <div className="bg-[#222222] rounded-lg p-4">
                  <p className="text-sm text-gray-400">
                    Quality Tier: <span className="text-white font-medium capitalize">{product.quality_tier}</span>
                  </p>
                  {product.tier_multiplier && (
                    <p className="text-sm text-gray-400 mt-1">
                      Price Multiplier: <span className="text-white font-medium">{product.tier_multiplier}x</span>
                    </p>
                  )}
                </div>
              )}
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
                disabled={isLoading || !formData.name || formData.price <= 0}
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