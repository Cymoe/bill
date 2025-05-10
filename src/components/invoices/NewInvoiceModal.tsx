import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface InvoiceItem {
  product_id: string;
  quantity: number;
  price: number;
  description?: string;
}

interface Template {
  id: string;
  name: string;
  content: {
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      description?: string;
    }>;
  };
  total_amount: number;
  description?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  items?: Array<{
    product_id: string;
    quantity: number;
    price: number;
    description?: string;
  }>;
}

interface InvoiceFormData {
  client_id: string;
  items: InvoiceItem[];
  total_amount: number;
  description: string;
  due_date: string;
  status: string;
  issue_date: string;
}



interface NewInvoiceModalProps {
  onClose: () => void;
  onSave: (data: InvoiceFormData) => void;
}

export const NewInvoiceModal = ({ onClose, onSave }: NewInvoiceModalProps): JSX.Element => {
  const [step, setStep] = useState<'select' | 'create'>('select');
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    items: [] as InvoiceItem[],
    total_amount: 0,
    description: '',
    due_date: '',
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    console.log('Clients state changed:', clients);
  }, [clients]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      console.log('Loading data for user:', user.id);
      const [clientsRes, productsRes, templatesRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('invoice_templates').select('*').eq('user_id', user.id)
      ]) as [any, any, any];

      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;
      if (templatesRes.error) throw templatesRes.error;

      // Fetch items for each template
      const templatesWithItems = await Promise.all(
        (templatesRes.data || []).map(async (template: any) => {
          const { data: items, error: itemsError } = await supabase
            .from('invoice_template_items')
            .select('*')
            .eq('template_id', template.id);
          if (itemsError) throw itemsError;
          return {
            ...template,
            items: items || [],
          };
        })
      );

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setTemplates(templatesWithItems);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = (): void => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleTemplateSelect = (template: Template): void => {
    if (!template?.items) {
      console.error('Template has no items');
      return;
    }
    try {
      console.log('Selected template:', template);
      const templateItems = template.items || [];
      console.log('Template items:', templateItems);

      if (!templateItems.length) {
        console.error('Template has no items');
        return;
      }

      // Map template items to form data structure
      const items = templateItems.map((item: any) => {
        // Find the product to get current price if available
        const product = products.find((p: { id: string }) => p.id === item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          description: product?.description || item.description || ''
        };
      });

      // Set the form data with template items
      setFormData(prev => ({
        ...prev,
        items,
        total_amount: template.total_amount
      }));

      // Move to create step after template selection
      setStep('create');
    } catch (error) {
      console.error('Error selecting template:', error);
    }
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

  const updateItem = (index: number, field: keyof typeof formData.items[0], value: any) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        price: product?.price || 0
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
    return formData.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const saveAsTemplate = async () => {
    if (!user) return;
    
    try {
      // Get client name from selected client
      const selectedClient = clients.find(c => c.id === formData.client_id);
      const templateName = selectedClient?.name || 'New Template';

      const templateData = {
        user_id: user.id,
        name: templateName,
        content: {
          items: formData.items.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return {
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
              description: product?.name || 'Custom Item'
            };
          })
        }
      };

      const { error } = await supabase
        .from('invoice_templates')
        .insert(templateData);

      if (error) throw error;

      // Refresh templates list
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.client_id) return;
    try {
      setLoading(true);
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          amount: calculateTotal(),
          status: formData.status,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: formData.due_date
        })
        .select()
        .single();

      if (error) throw error;

      await Promise.all(formData.items.map(item =>
        supabase
          .from('invoice_items')
          .insert({
            invoice_id: invoice.id,
            product_id: item.product_id,
            description: products.find(p => p.id === item.product_id)?.description || '',
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.quantity * item.price
          })
      ));

      if (invoice) {
        onSave(invoice);
        handleClose();
      }
    } catch (error) {
      if (error && typeof error === 'object') {
        console.error('Supabase error details:', error);
        alert(JSON.stringify(error, null, 2));
      }
      setError('Failed to create invoice');
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
          fixed w-full md:w-1/2
          transition-transform duration-300 ease-out
          bg-white dark:bg-gray-800
          shadow-xl
          overflow-hidden
          md:left-0 md:top-0 md:bottom-0
          bottom-0 left-0 right-0 h-full md:h-auto
          transform
          ${isClosing
            ? 'translate-y-full md:translate-y-0 md:translate-x-[-100%]'
            : 'translate-y-0 md:translate-x-0'
          }
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Invoice</h2>
            <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === 'select' && (
              <div className="p-6">
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
                    How would you like to create your invoice?
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Start from Scratch Button */}
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, items: [] }));
                        setStep('create');
                      }}
                      className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                    >
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Start from Scratch
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Create a new invoice from scratch
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </button>

                    {/* Template List */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Or Choose a Template
                      </h3>
                      {templates.length > 0 ? (
                        templates.map((template) => {
                          // Calculate total from template items
                          const items = template.items || [];
                          const total = items.reduce((sum: number, item: { price: number; quantity: number }) => {
                            const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
                            return sum + itemTotal;
                          }, 0);

                          return (
                            <button
                              key={template.id}
                              onClick={() => handleTemplateSelect(template)}
                              className="flex items-center justify-between w-full p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                            >
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex-1 text-left">
                                {template.name}
                              </h4>
                              <div className="text-right flex flex-col items-end min-w-[180px]">
                                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                  {formatCurrency(total)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {`${items.length} item${items.length !== 1 ? 's' : ''}` + (items.length > 0 ? ` - ${items.map((item: { product_id: string; description?: string }) => {
                                    const product = products.find((p: { id: string }) => p.id === item.product_id);
                                    return product?.name || item.description || 'Item';
                                  }).join(', ')}` : '')}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No templates available. Start from scratch or save an invoice as a template.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'create' && (
              <div className="p-4">
                <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients?.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.company_name} - {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
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
                            Start building your invoice by adding products or services
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
                          
                          {/* Save as Template Button */}
                          <button
                            type="button"
                            onClick={saveAsTemplate}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Save as Template
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {step === 'create' && (
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
                  form="invoice-form"
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};