import React, { useState, useEffect } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProductForm } from './ProductForm';

interface MobileNewProductModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const MobileNewProductModal: React.FC<MobileNewProductModalProps> = ({ onClose, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const createProduct = useMutation(api.products.createProduct);

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

  const handleSubmit = async (formData: any) => {
    try {
      await createProduct(formData);
      setIsClosing(true);
      setTimeout(onSave, 300);
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          fixed w-full
          transition-transform duration-300 ease-out 
          bg-white dark:bg-gray-800 
          shadow-xl
          overflow-hidden
          inset-x-0 bottom-0
          h-full
          transform
          ${isClosing ? 'translate-y-full' : 'translate-y-0'}
        `}
      >
        <ProductForm
          title="New Product"
          onClose={handleClose}
          onSubmit={handleSubmit}
          submitLabel="Create Product"
        />
      </div>
    </div>
  );
}; 