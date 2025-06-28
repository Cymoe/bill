import React, { useState, useEffect } from 'react';
import { X, Copy, TrendingUp, DollarSign, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { LineItem } from '../../types';

interface CustomizeLineItemPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineItem: LineItem | null;
  organizationId: string;
  onSuccess?: () => void;
}

export const CustomizeLineItemPricingModal: React.FC<CustomizeLineItemPricingModalProps> = ({
  isOpen,
  onClose,
  lineItem,
  organizationId,
  onSuccess
}) => {
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingCustom, setExistingCustom] = useState<LineItem | null>(null);

  useEffect(() => {
    if (lineItem && isOpen) {
      // Check if there's already a custom version
      checkExistingCustomization();
      
      // Set initial values
      setCustomPrice(lineItem.price.toString());
      setError(null);
      setShowSuccess(false);
    }
  }, [lineItem, isOpen]);

  const checkExistingCustomization = async () => {
    if (!lineItem || !organizationId) return;

    try {
      const { data, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('name', lineItem.name)
        .eq('cost_code_id', lineItem.cost_code_id)
        .single();

      if (data && !error) {
        setExistingCustom(data);
        setCustomPrice(data.price.toString());
      }
    } catch (err) {
      // No existing custom version - that's ok
    }
  };

  const handleSave = async () => {
    if (!lineItem || !organizationId) return;

    const price = parseFloat(customPrice);

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (existingCustom) {
        // Update existing custom version
        const { error: updateError } = await supabase
          .from('line_items')
          .update({
            price: price,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustom.id);

        if (updateError) throw updateError;
      } else {
        // Create new custom version
        const customLineItem = {
          ...lineItem,
          id: undefined, // Let database generate new ID
          organization_id: organizationId,
          price: price,
          is_custom: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('line_items')
          .insert(customLineItem);

        if (insertError) throw insertError;
      }

      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving custom pricing:', err);
      setError('Failed to save custom pricing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const priceChange = lineItem ? ((parseFloat(customPrice) - lineItem.price) / lineItem.price * 100) : 0;
  const isHigherPrice = priceChange > 0;

  if (!isOpen || !lineItem) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#1A1A1A] rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#336699]/10 rounded-lg">
                <Copy className="w-5 h-5 text-[#336699]" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {existingCustom ? 'Update Custom Pricing' : 'Customize Line Item Pricing'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Line Item Info */}
          <div className="mb-6 p-4 bg-[#252525] rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-white">{lineItem.name}</h4>
                {lineItem.description && (
                  <p className="text-sm text-gray-400 mt-1">{lineItem.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Industry Standard</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(lineItem.price)}/{lineItem.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Custom Pricing Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Your Custom Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="block w-full pl-10 pr-20 py-2 bg-[#252525] border border-[#333333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#336699] focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">/{lineItem.unit}</span>
                </div>
              </div>
              
              {/* Price Change Indicator */}
              {customPrice && parseFloat(customPrice) !== lineItem.price && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${
                  isHigherPrice ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${!isHigherPrice && 'rotate-180'}`} />
                  <span>
                    {Math.abs(priceChange).toFixed(1)}% {isHigherPrice ? 'higher' : 'lower'} than industry standard
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-[#336699]/10 rounded-lg border border-[#336699]/30">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#336699] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-white mb-1">How Custom Pricing Works</p>
                <ul className="space-y-1">
                  <li>• Your custom price will be used in all estimates</li>
                  <li>• Affects all service options using this line item</li>
                  <li>• Only applies to your organization</li>
                  <li>• You can update or remove customization anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-emerald-400">
                  Custom pricing saved successfully!
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-300 bg-[#252525] rounded-lg hover:bg-[#333333] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || showSuccess}
              className="flex-1 px-4 py-2 text-black bg-[#F59E0B] rounded-lg hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Saving...' : existingCustom ? 'Update Custom Price' : 'Save Custom Price'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};