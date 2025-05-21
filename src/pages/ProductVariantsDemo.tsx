import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { ProductVariantComparison } from '../components/products/ProductVariantComparison';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

interface BaseProduct {
  id: string;
  name: string;
  description: string;
}

const ProductVariantsDemo = () => {
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantDetails, setSelectedVariantDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchBaseProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all base products
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_base_product', true)
          .order('name');
          
        if (error) throw error;
        
        setBaseProducts(data || []);
      } catch (err) {
        console.error('Error fetching base products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBaseProducts();
  }, []);
  
  const handleSelectVariant = async (variantId: string) => {
    try {
      setSelectedVariantId(variantId);
      
      // Fetch variant details
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', variantId)
        .single();
        
      if (error) throw error;
      
      setSelectedVariantDetails(data);
    } catch (err) {
      console.error('Error fetching variant details:', err);
    }
  };
  
  const handleBackToList = () => {
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setSelectedVariantDetails(null);
  };
  
  const handleBackToComparison = () => {
    setSelectedVariantId(null);
    setSelectedVariantDetails(null);
  };
  
  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center text-gray-400">Loading products...</div>
    </DashboardLayout>
  );
  
  if (error) return (
    <DashboardLayout>
      <div className="p-8 text-center text-red-500">{error}</div>
    </DashboardLayout>
  );
  
  return (
    <DashboardLayout>
      <div className="p-8">
        {selectedVariantId ? (
          // Show selected variant details
          <div>
            <button 
              onClick={handleBackToComparison}
              className="flex items-center text-blue-500 hover:text-blue-400 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Comparison
            </button>
            
            <div className="bg-[#1A1F2C] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedVariantDetails?.name}
              </h2>
              <p className="text-gray-400 mb-4">{selectedVariantDetails?.description}</p>
              
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedVariantDetails?.variant_name}
                </div>
                <div className="ml-4 text-2xl font-bold text-white">
                  ${selectedVariantDetails?.price.toLocaleString()}
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-white">
                  You've selected the {selectedVariantDetails?.variant_name} package. 
                  This would typically show more details and allow you to add this to an invoice.
                </p>
                
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg">
                  Add to Invoice
                </button>
              </div>
            </div>
          </div>
        ) : selectedProductId ? (
          // Show product variant comparison
          <div>
            <button 
              onClick={handleBackToList}
              className="flex items-center text-blue-500 hover:text-blue-400 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Products
            </button>
            
            <ProductVariantComparison 
              baseProductId={selectedProductId} 
              onSelectVariant={handleSelectVariant}
            />
          </div>
        ) : (
          // Show list of base products
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Product Packages</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baseProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-[#1A1F2C] rounded-lg overflow-hidden cursor-pointer hover:bg-[#232635] transition-colors"
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400">{product.description}</p>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-blue-500">Compare options</span>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                        3 Options
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductVariantsDemo;
