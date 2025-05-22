import React from 'react';
import { Product } from './ProductsPage';
import { ProductAssemblyForm } from './ProductAssemblyForm';
import { supabase } from '../../lib/supabase';

interface GlobalProductDrawerProps {
  editingProduct: Product | 'new' | null;
  setEditingProduct: (product: Product | 'new' | null) => void;
  lineItems: any[];
}

interface SaveData {
  name: string;
  description: string;
  price?: number;
  type?: string;
  items: any[];
  trade_id?: string;
  category?: string;
  premium?: boolean;
  is_base_product?: boolean;
  parent_product_id?: string;
  variant_name?: string;
  status?: string;
  variant?: boolean;
}

export const GlobalProductDrawer: React.FC<GlobalProductDrawerProps> = ({ 
  editingProduct, 
  setEditingProduct,
  lineItems
}) => {
  const [isClosingDrawer, setIsClosingDrawer] = React.useState(false);

  // Handle closing the product form drawer with animation
  const handleCloseProductForm = () => {
    setIsClosingDrawer(true);
    setTimeout(() => {
      setEditingProduct(null);
      setIsClosingDrawer(false);
    }, 300); // Match the animation duration
  };

  if (!editingProduct && editingProduct !== 'new') return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black bg-opacity-50"
        onClick={handleCloseProductForm}
      />
      <div
        className={`fixed inset-y-0 right-0 z-[9999] w-full max-w-3xl bg-[#121212] shadow-xl transform transition-transform duration-300 ease-in-out ${isClosingDrawer ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="p-4">
          <ProductAssemblyForm
            lineItems={lineItems}
            onClose={handleCloseProductForm}
            onSave={async (data: SaveData) => {
              console.log('Saving product:', data);
              try {
                // Transform items data for the database
                const transformedItems = data.items.map((item: any) => ({
                  line_item_id: item.lineItemId,
                  quantity: item.quantity,
                  unit: item.unit,
                  price: item.price
                }));

                if (editingProduct && editingProduct !== 'new') {
                  // Update existing product
                  const { error: deleteError } = await supabase
                    .from('product_line_items')
                    .delete()
                    .eq('product_id', editingProduct.id);
                  if (deleteError) throw deleteError;

                  const { error: updateError } = await supabase
                    .from('products')
                    .update({
                      name: data.name,
                      description: data.description,
                      price: data.price || 0,
                      type: data.type || 'product',
                      trade_id: data.trade_id,
                      category: data.category,
                      premium: data.premium,
                      is_base_product: data.is_base_product,
                      parent_product_id: data.parent_product_id,
                      variant_name: data.variant_name,
                      status: data.status,
                      variant: data.variant
                    })
                    .eq('id', editingProduct.id);
                  if (updateError) throw updateError;

                  // Insert new line items
                  if (transformedItems.length > 0) {
                    const lineItemsWithProductId = transformedItems.map((item: any) => ({
                      ...item,
                      product_id: editingProduct.id
                    }));
                    const { error: insertError } = await supabase
                      .from('product_line_items')
                      .insert(lineItemsWithProductId);
                    if (insertError) throw insertError;
                  }
                } else {
                  // Create new product
                  const { data: newProduct, error: createError } = await supabase
                    .from('products')
                    .insert({
                      name: data.name,
                      description: data.description,
                      price: data.price || 0,
                      type: data.type || 'product',
                      user_id: 'user123', // Replace with actual user ID
                      trade_id: data.trade_id,
                      category: data.category,
                      premium: data.premium,
                      is_base_product: data.is_base_product,
                      parent_product_id: data.parent_product_id,
                      variant_name: data.variant_name,
                      status: data.status,
                      variant: data.variant
                    })
                    .select()
                    .single();
                  if (createError) throw createError;

                  // Insert line items
                  if (transformedItems.length > 0 && newProduct) {
                    const lineItemsWithProductId = transformedItems.map((item: any) => ({
                      ...item,
                      product_id: newProduct.id
                    }));
                    const { error: insertError } = await supabase
                      .from('product_line_items')
                      .insert(lineItemsWithProductId);
                    if (insertError) throw insertError;
                  }
                }

                handleCloseProductForm();
                // Refresh products list
                // fetchProducts();
              } catch (error) {
                console.error('Error saving product:', error);
                // Show error toast
              }
            }}
            editingProduct={editingProduct === 'new' ? null : editingProduct}
          />
        </div>
      </div>
    </>
  );
};
