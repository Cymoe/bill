import React, { useState } from 'react';
import { X, Layers, Shield, Star, Zap } from 'lucide-react';
import { Product } from '../../services/ProductService';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';

interface GenerateVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export const GenerateVariantsModal: React.FC<GenerateVariantsModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [basicMultiplier, setBasicMultiplier] = useState(0.85);
  const [premiumMultiplier, setPremiumMultiplier] = useState(1.25);
  const [previewPrices, setPreviewPrices] = useState({
    basic: 0,
    standard: 0,
    premium: 0
  });

  React.useEffect(() => {
    if (product) {
      setPreviewPrices({
        basic: product.price * basicMultiplier,
        standard: product.price,
        premium: product.price * premiumMultiplier
      });
    }
  }, [product, basicMultiplier, premiumMultiplier]);

  const handleGenerateVariants = async () => {
    if (!product) return;

    setIsGenerating(true);
    try {
      // Call the database function to generate variants
      const { error } = await supabase.rpc('generate_product_variants', {
        p_product_id: product.id,
        p_basic_multiplier: basicMultiplier,
        p_premium_multiplier: premiumMultiplier
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error generating variants:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#333333] px-6 py-4">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-[#336699]" />
              <h2 className="text-xl font-semibold text-white">Generate Product Variants</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-400 mb-2">Creating variants for:</p>
              <p className="text-white font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">Base price: {formatCurrency(product.price)}</p>
            </div>

            {/* Pricing Multipliers */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Basic Tier Multiplier
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={basicMultiplier}
                    onChange={(e) => setBasicMultiplier(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12 text-right">
                    {(basicMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Premium Tier Multiplier
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1.1"
                    max="2.0"
                    step="0.05"
                    value={premiumMultiplier}
                    onChange={(e) => setPremiumMultiplier(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-medium w-12 text-right">
                    {(premiumMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 bg-[#222222] rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Preview Pricing</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Basic</span>
                  </div>
                  <span className="text-white font-medium">
                    {formatCurrency(previewPrices.basic)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-300">Standard</span>
                  </div>
                  <span className="text-white font-medium">
                    {formatCurrency(previewPrices.standard)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-300">Premium</span>
                  </div>
                  <span className="text-white font-medium">
                    {formatCurrency(previewPrices.premium)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
              <p className="text-sm text-blue-300">
                This will create Basic and Premium variants with adjusted pricing. 
                Line items will be copied with proportional price adjustments.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#333333] px-6 py-4">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateVariants}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#4477aa] transition-colors disabled:bg-[#555555] disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Generate Variants
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};