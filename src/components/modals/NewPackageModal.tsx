import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Minus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Tables } from '../../lib/database';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';

interface NewPackageModalProps {
  onClose: () => void;
  onSave: (optimisticTemplate: any) => void;
}

export const NewPackageModal: React.FC<NewPackageModalProps> = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [] as Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>
  });

  const { user } = useAuth();
  const [products, setProducts] = useState<Tables['products'][]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: products[0].id,
          quantity: 1,
          price: products[0].price
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      
      if (field === 'product_id') {
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          newItems[index] = {
            ...newItems[index],
            [field as 'product_id']: value as string,
            price: selectedProduct.price
          };
        }
      } else {
        newItems[index] = {
          ...newItems[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!formData.name.trim()) {
      setError('Package name is required');
      return;
    }
    
    if (formData.items.length === 0) {
      setError('At least one item is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        user_id: user?.id,
        content: {}
      };
      
      const { data: template, error: templateError } = await supabase
        .from('invoice_templates')
        .insert(templateData)
        .select()
        .single();
      
      if (templateError) throw templateError;
      
      const templateItems = formData.items.map(item => ({
        template_id: template.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        user_id: user?.id
      }));
      
      const { error: itemsError } = await supabase
        .from('template_items')
        .insert(templateItems);
      
      if (itemsError) throw itemsError;
      
      // Create an optimistic template for immediate UI update
      const optimisticTemplate = {
        ...template,
        items: templateItems.map(item => ({
          ...item,
          id: Math.random().toString(36).substring(2, 9), // Temporary ID
          created_at: new Date().toISOString()
        }))
      };
      
      onSave(optimisticTemplate);
      handleClose();
    } catch (err) {
      console.error('Error creating template:', err);
      setError('Failed to create package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex z-50">
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-[#1A1F2C] shadow-xl flex flex-col border-l border-gray-800 ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">New Package</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 uppercase">
                  Package Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-[#232632] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter package name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-400 uppercase">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-[#232632] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter package description"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-white">Line Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Line Item
                  </button>
                </div>
                
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border border-dashed border-gray-700 rounded-lg">
                    No line items added yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-700 rounded-lg bg-[#232632]">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-white">Line Item {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-6">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Product
                            </label>
                            <select
                              value={item.product_id}
                              onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                              className="block w-full px-3 py-2 bg-[#1A1F2C] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({formatCurrency(product.price)})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Quantity
                            </label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleItemChange(index, 'quantity', Math.max(1, Number(item.quantity) - 1))}
                                className="px-2 py-1 border border-gray-700 rounded-l-md bg-[#1A1F2C] text-gray-300"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                className="block w-full px-3 py-2 border-t border-b border-gray-700 bg-[#1A1F2C] text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center"
                              />
                              <button
                                type="button"
                                onClick={() => handleItemChange(index, 'quantity', Number(item.quantity) + 1)}
                                className="px-2 py-1 border border-gray-700 rounded-r-md bg-[#1A1F2C] text-gray-300"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Price
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">$</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                className="block w-full pl-7 pr-3 py-2 bg-[#1A1F2C] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 text-red-400 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-700 rounded-full hover:bg-gray-800 focus:outline-none"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
