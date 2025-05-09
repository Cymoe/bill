import React, { useState, useEffect } from 'react';
import { ProductForm } from '../products/ProductForm';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DesktopNewProductModalProps {
  onClose: () => void;
  onSave: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  unit: string;
}

export const DesktopNewProductModal: React.FC<DesktopNewProductModalProps> = ({ onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      if (!user?.id) {
        setError('You must be logged in to create a product');
        return;
      }

      console.log('Creating product with data:', {
        ...formData,
        user_id: user.id
      });

      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            unit: formData.unit,
            user_id: user.id
          }
        ])
        .select('*');

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError(supabaseError.message);
        return;
      }

      console.log('Created product:', data);

      if (!data || data.length === 0) {
        setError('Failed to create product');
        return;
      }

      onSave();
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      <div 
        className={`w-full max-w-md bg-white dark:bg-gray-800 shadow-xl h-full ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        } transition-transform duration-300`}
      >
        <ProductForm
          title="New Product"
          onClose={handleClose}
          onSubmit={handleSubmit}
          submitLabel="Create Product"
          error={error}
        />
      </div>
    </div>
  );
};