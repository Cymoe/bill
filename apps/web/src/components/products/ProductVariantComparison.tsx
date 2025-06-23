import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { Check, X } from 'lucide-react';

interface LineItem {
  id: string;
  product_id: string;
  line_item_id: string;
  quantity: number;
  price: number;
  unit: string;
  name?: string;
  description?: string;
  type?: string;
}

interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  variant_name: string;
  lineItems: LineItem[];
}

interface BaseProduct {
  id: string;
  name: string;
  description: string;
  variants: ProductVariant[];
}

interface ProductVariantComparisonProps {
  baseProductId: string;
  onSelectVariant?: (variantId: string) => void;
}

export const ProductVariantComparison: React.FC<ProductVariantComparisonProps> = ({
  baseProductId,
  onSelectVariant
}) => {
  const [baseProduct, setBaseProduct] = useState<BaseProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch base product
        const { data: baseProductData, error: baseProductError } = await supabase
          .from('products')
          .select('*')
          .eq('id', baseProductId)
          .single();
          
        if (baseProductError) throw baseProductError;
        
        // Fetch variants
        const { data: variantsData, error: variantsError } = await supabase
          .from('products')
          .select('*')
          .eq('parent_product_id', baseProductId)
          .order('price');
          
        if (variantsError) throw variantsError;
        
        // Fetch line items for each variant
        const variantsWithLineItems = await Promise.all(
          variantsData.map(async (variant) => {
            const { data: lineItemsData, error: lineItemsError } = await supabase
              .from('product_line_items')
              .select(`
                *,
                line_item:line_item_id (
                  name,
                  description,
                  type
                )
              `)
              .eq('product_id', variant.id);
              
            if (lineItemsError) throw lineItemsError;
            
            // Transform line items data
            const lineItems = lineItemsData.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              line_item_id: item.line_item_id,
              quantity: item.quantity,
              price: item.price,
              unit: item.unit,
              name: item.line_item?.name,
              description: item.line_item?.description,
              type: item.line_item?.type
            }));
            
            return {
              ...variant,
              lineItems
            };
          })
        );
        
        setBaseProduct({
          id: baseProductData.id,
          name: baseProductData.name,
          description: baseProductData.description,
          variants: variantsWithLineItems
        });
        
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };
    
    if (baseProductId) {
      fetchProductData();
    }
  }, [baseProductId]);
  
  // Group line items by type for better comparison
  const getLineItemsByType = (variant: ProductVariant) => {
    const groupedItems: Record<string, LineItem[]> = {};
    
    variant.lineItems.forEach(item => {
      if (item.type) {
        if (!groupedItems[item.type]) {
          groupedItems[item.type] = [];
        }
        groupedItems[item.type].push(item);
      }
    });
    
    return groupedItems;
  };
  
  // Get unique features for each variant
  const getUniqueFeatures = (variant: ProductVariant, otherVariants: ProductVariant[]) => {
    const otherLineItemIds = new Set(
      otherVariants.flatMap(v => v.lineItems.map(item => item.line_item_id))
    );
    
    return variant.lineItems.filter(item => !otherLineItemIds.has(item.line_item_id));
  };
  
  if (loading) return <div className="p-8 text-center text-gray-400">Loading product variants...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!baseProduct) return <div className="p-8 text-center text-gray-400">No product found</div>;
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-2">{baseProduct.name}</h2>
      <p className="text-gray-400 mb-6">{baseProduct.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {baseProduct.variants.map((variant) => {
          const uniqueFeatures = getUniqueFeatures(
            variant, 
            baseProduct.variants.filter(v => v.id !== variant.id)
          );
          
          return (
            <div 
              key={variant.id} 
              className={`bg-[#1A1F2C] rounded-lg overflow-hidden border-2 ${
                variant.variant_name === 'Standard' 
                  ? 'border-gray-600' 
                  : variant.variant_name === 'Medium' 
                    ? 'border-blue-600' 
                    : 'border-purple-600'
              }`}
            >
              <div 
                className={`p-4 ${
                  variant.variant_name === 'Standard' 
                    ? 'bg-gray-700' 
                    : variant.variant_name === 'Medium' 
                      ? 'bg-blue-700' 
                      : 'bg-purple-700'
                }`}
              >
                <h3 className="text-xl font-bold text-white">{variant.variant_name}</h3>
                <p className="text-2xl font-bold text-white mt-2">{formatCurrency(variant.price)}</p>
              </div>
              
              <div className="p-4">
                <p className="text-gray-300 mb-4">{variant.description}</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">What's Included</h4>
                    <ul className="space-y-2">
                      {Object.entries(getLineItemsByType(variant)).map(([type, items]) => (
                        <li key={type} className="text-gray-300">
                          <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}:</span>
                          <ul className="ml-4 space-y-1 mt-1">
                            {items.map(item => (
                              <li key={item.id} className="flex items-start">
                                <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                                <span>
                                  {item.quantity} {item.unit} - {item.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {uniqueFeatures.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Unique Features</h4>
                      <ul className="space-y-1">
                        {uniqueFeatures.map(item => (
                          <li key={item.id} className="flex items-start text-gray-300">
                            <Check size={16} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                            <span>{item.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => onSelectVariant && onSelectVariant(variant.id)}
                  className={`w-full py-2 rounded-lg font-medium ${
                    variant.variant_name === 'Standard' 
                      ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                      : variant.variant_name === 'Medium' 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  Select {variant.variant_name} Package
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
