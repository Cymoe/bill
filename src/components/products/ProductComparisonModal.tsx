import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ProductComparisonModalProps {
  baseProduct: any;
  onClose: () => void;
}

const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({ baseProduct, onClose }) => {
  if (!baseProduct || !baseProduct.variants || baseProduct.variants.length === 0) {
    return null;
  }

  // Get all unique line item names across all variants
  const allLineItems = new Set<string>();
  baseProduct.variants.forEach((variant: any) => {
    if (variant.items) {
      variant.items.forEach((item: any) => {
        allLineItems.add(item.name);
      });
    }
  });

  // Convert to array and sort alphabetically
  const lineItemNames = Array.from(allLineItems).sort();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1F2C] rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Compare Variants: {baseProduct.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-[200px_repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {/* Header row */}
            <div className="sticky top-0 bg-[#1A1F2C] z-10 pb-2">
              <div className="font-semibold text-gray-400 text-sm">Features</div>
            </div>
            
            {baseProduct.variants.map((variant: any, index: number) => (
              <div key={index} className="sticky top-0 bg-[#1A1F2C] z-10 pb-2">
                <div className="font-semibold text-white">
                  {variant.variant_name || variant.name}
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatCurrency(variant.price || 0)}
                </div>
              </div>
            ))}
            
            {/* Price row */}
            <div className="border-t border-gray-700 pt-2">
              <div className="font-semibold text-white">Base Price</div>
            </div>
            
            {baseProduct.variants.map((variant: any, index: number) => (
              <div key={`price-${index}`} className="border-t border-gray-700 pt-2">
                <div className="font-semibold text-white">
                  {formatCurrency(variant.price || 0)}
                </div>
              </div>
            ))}
            
            {/* Line items comparison */}
            {lineItemNames.map((itemName: string) => (
              <React.Fragment key={itemName}>
                <div className="border-t border-gray-700 pt-2">
                  <div className="text-gray-300">{itemName}</div>
                </div>
                
                {baseProduct.variants.map((variant: any, variantIndex: number) => {
                  const item = variant.items?.find((i: any) => i.name === itemName);
                  return (
                    <div key={`${itemName}-${variantIndex}`} className="border-t border-gray-700 pt-2">
                      {item ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-white">
                            {item.quantity > 1 ? `${item.quantity}x ` : ''}
                            {item.price ? formatCurrency(item.price) : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-red-500 mr-2 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-500">Not included</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal;
