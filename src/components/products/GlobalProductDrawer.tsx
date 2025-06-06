import React from 'react';
import { Modal } from '../common/Modal';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { ProductFormSimple } from './ProductFormSimple';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Define Product interface locally
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: string;
  category?: string;
  status: string;
  is_base_product: boolean;
  created_at: string;
  updated_at: string;
  trade_id?: string;
  user_id?: string;
  parent_product_id?: string;
  parent_name?: string;
  variant?: boolean;
  variant_name?: string;
  trade?: {
    id: string;
    name: string;
  };
  variants: any[];
  items?: any[];
}

interface GlobalProductDrawerProps {
  editingProduct: Product | 'new' | null;
  setEditingProduct: (product: Product | 'new' | null) => void;
  lineItems?: any[];
  onProductSaved?: () => void;
}

export const GlobalProductDrawer: React.FC<GlobalProductDrawerProps> = ({ 
  editingProduct, 
  setEditingProduct,
  lineItems,
  onProductSaved
}) => {
  const { user } = useAuth();

  // Don't render anything for 'new' case - it's handled by CreateProductDrawer
  if (!editingProduct || editingProduct === 'new') return null;

  const isVariant = editingProduct.variant === true;
  const parentProductName = editingProduct.parent_name ? editingProduct.parent_name : undefined;

  // Use SlideOutDrawer for editing existing products/variants
  return (
    <SlideOutDrawer
      isOpen={true}
      onClose={() => setEditingProduct(null)}
      title={isVariant ? "Edit Variant" : "Edit Product"}
      width="lg"
    >
      <ProductFormSimple
        initialData={{
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          unit: editingProduct.unit,
          type: editingProduct.type,
          trade_id: editingProduct.trade_id,
          category: editingProduct.category,
          is_base_product: editingProduct.is_base_product,
          parent_product_id: editingProduct.parent_product_id,
          variant_name: editingProduct.variant_name
        }}
        onSubmit={async (data) => {
          try {
            const { error } = await supabase
              .from('products')
              .update({
                ...data,
                updated_at: new Date().toISOString()
              })
              .eq('id', editingProduct.id);

            if (error) throw error;

            setEditingProduct(null);
            if (onProductSaved) onProductSaved();
          } catch (error) {
            console.error('Error updating product:', error);
          }
        }}
        onCancel={() => setEditingProduct(null)}
        submitLabel="Save Changes"
        isVariant={isVariant}
        parentProductName={parentProductName}
      />
    </SlideOutDrawer>
  );
};
