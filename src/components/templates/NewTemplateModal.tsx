import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Minus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';

interface NewTemplateModalProps {
  onClose: () => void;
  onSave: () => void;
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({ onClose, onSave }) => {
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
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const data = await db.products.list(user?.id || '');
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

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

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof typeof formData.items[0], value: string | number) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value.toString(),
        price: product ? product.price : 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const adjustQuantity = (index: number, amount: number) => {
    const newItems = [...formData.items];
    const newQuantity = Math.max(1, newItems[index].quantity + amount);
    newItems[index] = { ...newItems[index], quantity: newQuantity };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Start a Supabase transaction
      const { data: template, error: templateError } = await supabase
        .from('invoice_templates')
        .insert([{  // Note: Wrap in array for consistent behavior
          user_id: user.id,
          name: formData.name,
          content: JSON.stringify({  // Explicitly stringify JSONB content
            description: formData.description || '',
            total_amount: calculateTotal(),
            created_by: user.id,
            created_at: new Date().toISOString()
          })
        }])
        .select('id')
        .single();

      if (templateError) {
        console.error('Template creation error:', templateError);
        throw new Error(templateError.message);
      }

      if (!template?.id) {
        throw new Error('Template created but no ID returned');
      }

      // Then create the template items if we have a valid template
      if (formData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_template_items')
          .insert(
            formData.items.map(item => ({
              template_id: template.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price
            }))
          );

        if (itemsError) {
          console.error('Template items creation error:', itemsError);
          // Cleanup the template if items fail
          await supabase
            .from('invoice_templates')
            .delete()
            .eq('id', template.id);
          throw new Error(itemsError.message);
        }
      }

      onSave();
      handleClose();
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex md:justify-end">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
      />
      
      <div 
        className={`
          fixed md:w-[600px] 
          transition-transform duration-300 ease-out 
          bg-white dark:bg-gray-800 
          shadow-xl
          overflow-hidden
          md:right-0 md:top-0 md:bottom-0
          md:rounded-l-2xl
          bottom-0 left-0 right-0 h-full md:h-auto
          transform
          ${isClosing 
            ? 'translate-y-full md:translate-y-0 md:-translate-x-full' 
            : 'translate-y-0 md:translate-x-0'
          }
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Template</h2>
            <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                  {formData.items.length > 0 && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Plus className="w-5 h-5" />
                      Add Item
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.items.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Add Your First Item
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Start building your template by adding products or services
                      </p>
                      <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>
                  ) : (
                    formData.items.map((item, index) => (
                      <div key={index} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Product
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Select a product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Quantity
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => adjustQuantity(index, -1)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                min="1"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => adjustQuantity(index, 1)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Price
                            </label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="col-span-3 flex items-end">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Total: {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>

                          <div className="col-span-2 flex items-end justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {index === formData.items.length - 1 && (
                          <button
                            type="button"
                            onClick={addItem}
                            className="w-full flex items-center justify-center gap-2 p-2 mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Plus className="w-5 h-5" />
                            Add Item Below
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {formData.items.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="template-form"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};