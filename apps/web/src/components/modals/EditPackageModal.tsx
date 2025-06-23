import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Minus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';

type Package = Tables['invoice_templates'] & {
  items: Array<{
    id: string;
    template_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at?: string;
  }>;
};

interface PackageItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface FormData {
  name: string;
  description?: string;
  content: any; // Keep for backward compatibility
  items: PackageItem[];
}

interface EditPackageModalProps {
  template: Package;
  onClose: () => void;
  onSave: (updatedPackage: Package) => void;
}

export const EditPackageModal: React.FC<EditPackageModalProps> = ({
  template,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: template.name,
    description: template.description || '',
    content: template.content || {},
    items: template.items || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [products, setProducts] = useState<Tables['products'][]>([]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

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
            [field]: value,
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
      // Update template
      const { error: templateError } = await supabase
        .from('invoice_templates')
        .update({
          name: formData.name,
          description: formData.description,
          content: formData.content
        })
        .eq('id', template.id);
      
      if (templateError) throw templateError;
      
      // Get existing template items
      const { data: existingItems, error: fetchError } = await supabase
        .from('template_items')
        .select('id')
        .eq('template_id', template.id);
      
      if (fetchError) throw fetchError;
      
      const existingItemIds = existingItems?.map(item => item.id) || [];
      const formItemIds = formData.items
        .filter(item => 'id' in item)
        .map(item => (item as any).id);
      
      // Items to delete
      const itemsToDelete = existingItemIds.filter(id => !formItemIds.includes(id));
      
      if (itemsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('template_items')
          .delete()
          .in('id', itemsToDelete);
        
        if (deleteError) throw deleteError;
      }
      
      // Items to update or create
      for (const item of formData.items) {
        if ('id' in item) {
          // Update existing item
          const { error: updateError } = await supabase
            .from('template_items')
            .update({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price
            })
            .eq('id', (item as any).id);
          
          if (updateError) throw updateError;
        } else {
          // Create new item
          const { error: insertError } = await supabase
            .from('template_items')
            .insert({
              template_id: template.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
              user_id: user?.id
            });
          
          if (insertError) throw insertError;
        }
      }
      
      // Fetch updated template with items
      const { data: updatedTemplate, error: fetchTemplateError } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('id', template.id)
        .single();
      
      if (fetchTemplateError) throw fetchTemplateError;
      
      const { data: updatedItems, error: fetchItemsError } = await supabase
        .from('template_items')
        .select('*')
        .eq('template_id', template.id);
      
      if (fetchItemsError) throw fetchItemsError;
      
      const fullUpdatedTemplate = {
        ...updatedTemplate,
        items: updatedItems || []
      };
      
      onSave(fullUpdatedTemplate);
      handleClose();
    } catch (err) {
      console.error('Error updating package:', err);
      setError('Failed to update package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Package</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Package Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter package name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter package description"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </button>
                </div>
                
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    No items added yet. Click "Add Item" to add products to this package.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-750">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Item {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                className="block w-full px-3 py-2 border-t border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-center"
                              />
                              <button
                                type="button"
                                onClick={() => handleItemChange(index, 'quantity', Number(item.quantity) + 1)}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                                <span className="text-gray-500 dark:text-gray-400">$</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                className="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
          </form>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
