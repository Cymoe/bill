import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, BarChart3, Copy, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProductDrawer } from '../../contexts/ProductDrawerContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  unit?: string;
  variant_name?: string;
  items?: any[];
  trade?: { id: string; name: string };
  category?: string;
  user_id?: string;
  status?: string;
  is_base_product?: boolean;
  parent_product_id?: string;
  variant?: boolean;
}

export const ProductVariantComparisonPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openProductDrawer } = useProductDrawer();
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProductAndVariants();
    }
  }, [productId]);

  const fetchProductAndVariants = async () => {
    try {
      // Fetch base product
      const { data: baseData, error: baseError } = await supabase
        .from('products')
        .select('*, trade:trades(id, name)')
        .eq('id', productId)
        .single();

      if (baseError) throw baseError;
      setBaseProduct(baseData);

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('products')
        .select('*, trade:trades(id, name)')
        .eq('parent_product_id', productId)
        .order('price', { ascending: false });

      if (variantsError) throw variantsError;

      // Fetch line items for each variant
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .from('product_line_items')
        .select('*')
        .in('product_id', variantsData.map(v => v.id));

      if (lineItemsError) throw lineItemsError;

      // Attach line items to variants
      const variantsWithItems = variantsData.map(variant => ({
        ...variant,
        items: lineItemsData.filter(item => item.product_id === variant.id)
      }));

      setVariants(variantsWithItems);
    } catch (error) {
      console.error('Error fetching product variants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantTextColor = (variantName: string) => {
    const name = variantName.toLowerCase();
    if (name.includes('premium') || name.includes('high') || name.includes('deluxe')) {
      return 'text-[#FF8C00]';
    }
    if (name.includes('medium') || name.includes('regular')) {
      return 'text-[#4A90E2]';
    }
    if (name.includes('standard') || name.includes('basic') || name.includes('economy')) {
      return 'text-[#8E8E93]';
    }
    return 'text-white';
  };

  const handleEditVariant = (variant: Product) => {
    // Open the product drawer with the variant for editing
    openProductDrawer(variant);
  };

  const handleCloneVariant = (variant: Product) => {
    // Create a new variant based on the existing one
    const clonedVariant = {
      id: '',
      name: `${variant.name} (Copy)`,
      description: variant.description,
      user_id: user?.id || '',
      status: 'draft',
      is_base_product: false,
      parent_product_id: productId,
      parent_name: baseProduct?.name,
      price: variant.price,
      unit: variant.unit,
      trade_id: variant.trade?.id,
      category: baseProduct?.category,
      variant: true,
      variant_name: `${variant.variant_name || variant.name} (Copy)`
    };
    openProductDrawer(clonedVariant);
  };

  const handleAddVariant = () => {
    // Create a new variant for this base product
    const newVariant = {
      id: '',
      name: '',
      description: '',
      user_id: user?.id || '',
      status: 'draft',
      is_base_product: false,
      parent_product_id: productId,
      parent_name: baseProduct?.name,
      category: baseProduct?.category,
      variant: true
    };
    openProductDrawer(newVariant);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#336699] border-t-transparent rounded animate-spin"></div>
      </div>
    );
  }

  if (!baseProduct) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#336699] text-white px-4 py-2 rounded hover:bg-opacity-80"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-[#336699] hover:text-[#4A90E2] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Products
            </button>
            <div className="w-px h-6 bg-[#333333]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Compare {baseProduct.name} Variants</h1>
              <p className="text-gray-400 text-sm">{baseProduct.description}</p>
            </div>
          </div>
          <button
            onClick={handleAddVariant}
            className="bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] px-4 py-2 rounded transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#1A1A1A] border-b border-[#333333] px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Variants:</span>
            <span className="font-mono font-medium text-[#336699]">{variants.length}</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Price Range:</span>
            <span className="font-mono font-medium text-[#388E3C]">
              {variants.length > 0 ? 
                `${formatCurrency(Math.min(...variants.map(v => v.price || 0)))} - ${formatCurrency(Math.max(...variants.map(v => v.price || 0)))}` :
                'No variants'
              }
            </span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Trade:</span>
            <span className="font-mono font-medium text-[#9E9E9E]">{baseProduct.trade?.name || 'General'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {variants.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#333333] rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Variants Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create different versions of {baseProduct.name} with varying features, pricing, or specifications.
            </p>
            <button
              onClick={handleAddVariant}
              className="bg-[#336699] hover:bg-opacity-80 text-white px-6 py-3 rounded transition-colors font-medium"
            >
              Create First Variant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {variants.map((variant, index) => (
              <div
                key={variant.id}
                className="bg-[#1A1A1A] rounded-[4px] border border-[#333333] overflow-hidden hover:border-[#336699] transition-colors"
              >
                {/* Variant Header */}
                <div className="p-6 border-b border-[#333333]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#336699] flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${getVariantTextColor(variant.variant_name || variant.name)}`}>
                          {variant.variant_name || variant.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{variant.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-3xl font-bold text-white tabular-nums mb-4">
                    {formatCurrency(variant.price || 0)}
                    {variant.unit && <span className="text-lg text-gray-400 ml-2">/ {variant.unit}</span>}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{variant.items?.length || 0} items</span>
                    <span>•</span>
                    <span>{variant.trade?.name || 'General'}</span>
                  </div>
                </div>

                {/* Variant Details */}
                <div className="p-6">
                  {variant.items && variant.items.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium text-sm uppercase tracking-wide">Included Items</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {variant.items.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">{item.description || `Item ${idx + 1}`}</span>
                            <span className="text-gray-400">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                        {variant.items.length > 5 && (
                          <div className="text-gray-500 text-xs">
                            +{variant.items.length - 5} more items
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-500 text-sm">No items configured</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-[#333333] bg-[#1E1E1E]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVariant(variant)}
                      className="flex-1 bg-[#336699] hover:bg-opacity-80 text-white px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCloneVariant(variant)}
                      className="flex-1 bg-[#1E1E1E] hover:bg-[#333333] text-white border border-[#404040] hover:border-[#555555] px-3 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      Clone
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 