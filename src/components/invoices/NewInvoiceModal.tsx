import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Minus, Edit2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';
import { EditProductModal } from '../products/EditProductModal';

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
  const [step, setStep] = useState<'create' | 'select-packages'>('select-packages');
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

  // Add state for search and previewed package
  const [packageSearch, setPackageSearch] = useState('');
  const [previewPackage, setPreviewPackage] = useState<Template | null>(null);

  // Add state for editable preview items
  const [previewItems, setPreviewItems] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [selectedPackages, setSelectedPackages] = useState<Template[]>([]);

  // Add state for editing a package and edited values
  const [editingPackage, setEditingPackage] = useState<Template | null>(null);
  const [editedPackages, setEditedPackages] = useState<Record<string, any[]>>({});

  // Add state for category filter
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const { user } = useAuth();

  useEffect(() => {
    console.log('Clients state changed:', clients);
  }, [clients]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (previewPackage) {
      setPreviewItems((previewPackage.items || []).map(item => ({ ...item })));
    } else {
      setPreviewItems([]);
    }
  }, [previewPackage]);

  const loadData = async () => {
    if (!user) return;
    try {
      console.log('Loading data for user:', user.id);
      const [clientsRes, productsRes, templates] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('products').select('*').eq('user_id', user.id),
        db.invoice_templates.list(user.id).catch(err => { console.error('TEMPLATE FETCH ERROR:', err); return []; })
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setTemplates(templates || []);
      setLoading(false);
      console.log('Loaded templates:', templates);
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
          <div className="flex justify-between items-center pt-6 pb-4 px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Invoice</h2>
            <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === 'select-packages' && (
              <div className="relative h-full flex flex-col">
                <div className="px-6 mb-6">
                  <div className="flex items-center justify-between bg-[#232635] rounded-xl px-6 py-8">
                    <span className="text-2xl font-bold text-white">Start from Scratch</span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, items: [] }));
                        setStep('create');
                      }}
                      className="bg-[#4B5AEF] text-white font-bold rounded-xl px-8 py-4 text-lg shadow hover:bg-[#3a47c6] transition"
                    >
                      Create Empty
                    </button>
                  </div>
                </div>
                {/* Divider with OR */}
                <div className="flex items-center my-10 px-6">
                  <div className="flex-1 border-t border-gray-700" />
                  <span className="mx-4 text-gray-400 font-medium">OR</span>
                  <div className="flex-1 border-t border-gray-700" />
                </div>
                {/* Header and controls with matching padding */}
                <div className="px-6">
                  <h3 className="text-lg font-semibold mb-2">Select Packages</h3>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={packageSearch}
                      onChange={e => setPackageSearch(e.target.value)}
                      className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                    >
                      <option>All Categories</option>
                      {Array.from(new Set(templates.map(t => (t as any).category).filter(Boolean))).map(cat => (
                        <option key={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pb-20">
                  <ul className="space-y-2">
                    {templates.filter(pkg =>
                      (selectedCategory === 'All Categories' || (pkg as any).category === selectedCategory) &&
                      (pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
                        (pkg.description || '').toLowerCase().includes(packageSearch.toLowerCase())
                      )
                    ).map(pkg => {
                      const isSelected = selectedPackages.some(p => p.id === pkg.id);
                      const items = editedPackages[pkg.id] || pkg.items || [];
                      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      return (
                        <li
                          key={pkg.id}
                          className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 cursor-pointer select-none hover:bg-[#232635] transition-colors"
                          onClick={() => {
                            setSelectedPackages(prev =>
                              isSelected
                                ? prev.filter(p => p.id !== pkg.id)
                                : [...prev, pkg]
                            );
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={e => e.stopPropagation()}
                            onChange={() => {
                              setSelectedPackages(prev =>
                                isSelected
                                  ? prev.filter(p => p.id !== pkg.id)
                                  : [...prev, pkg]
                              );
                            }}
                          />
                          <span className="flex-1 flex items-center gap-2">
                            <span className="font-medium text-white">{pkg.name}</span>
                          </span>
                          <span className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                          <span className="text-blue-400 font-semibold ml-2">{formatCurrency(total)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {step === 'select-packages' && (
                  <div className="fixed left-0 right-0 bottom-0 z-30 bg-[#232635] border-t border-gray-700 px-6 py-4 flex items-center justify-between" style={{ pointerEvents: 'auto' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-medium text-white">Selected: {selectedPackages.length}</span>
                      <span className="text-base font-medium text-white">{formatCurrency(selectedPackages.reduce((sum, pkg) => {
                        const items = editedPackages[pkg.id] || pkg.items || [];
                        return sum + items.reduce((s, i) => s + (i.price * i.quantity), 0);
                      }, 0))}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="px-6 py-2 border border-gray-500 text-white bg-transparent hover:bg-gray-700 rounded-lg font-medium text-base"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-6 py-2 rounded-lg text-white font-medium text-base bg-blue-600 hover:bg-blue-700 transition-colors"
                        disabled={selectedPackages.length === 0}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            items: [
                              ...prev.items,
                              ...selectedPackages.flatMap(pkg =>
                                (editedPackages[pkg.id] || pkg.items || []).map(item => ({
                                  product_id: item.product_id,
                                  quantity: item.quantity,
                                  price: item.price,
                                  description: products.find(p => p.id === item.product_id)?.description || item.description || ''
                                }))
                              )
                            ]
                          }));
                          setSelectedPackages([]);
                          setEditingPackage(null);
                          setPackageSearch('');
                          setStep('create');
                        }}
                      >
                        Add to Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {step === 'create' && (
            <form id="invoice-form" onSubmit={handleSubmit} className="flex flex-col px-6 py-4 gap-6">
              {/* Client Selector */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Client</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={formData.client_id}
                  onChange={e => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              {/* Items List */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Line Items</label>
                <div className="flex flex-col gap-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                      <select
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white"
                        value={item.product_id}
                        onChange={e => updateItem(idx, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">Select product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-right"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-right"
                        value={item.price}
                        onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                      />
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => removeItem(idx)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium w-fit"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </div>
              </div>
              {/* Dates and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Issue Date</label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    value={formData.issue_date}
                    onChange={e => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                    value={formData.due_date}
                    onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              {/* Total */}
              <div className="flex items-center justify-end text-lg font-medium text-white">
                Total: {formatCurrency(calculateTotal())}
              </div>
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('select-packages')}
                  className="w-full px-4 py-2 border border-gray-500 rounded-lg hover:bg-gray-700 text-white font-medium"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

function EditPackageModal({ pkg, items, onSave, onCancel, products }: { pkg: Template, items: any[], onSave: (items: any[]) => void, onCancel: () => void, products: any[] }) {
  const [localItems, setLocalItems] = useState(() => items.map(i => ({ ...i })));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="font-semibold text-white text-lg">Edit {pkg.name}</div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <ul className="space-y-2 mb-4">
          {localItems.map((item, idx) => {
            const product = products.find(p => p.id === item.product_id);
            return (
              <li key={idx} className="flex items-center gap-2">
                <span className="flex-1">{product?.name || item.description || 'Item'}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 1;
                    setLocalItems(items => items.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                  }}
                  className="w-16 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-white text-xs"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.price}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setLocalItems(items => items.map((it, i) => i === idx ? { ...it, price: val } : it));
                  }}
                  className="w-20 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-white text-xs"
                />
                <span className="w-20 text-right">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            );
          })}
        </ul>
        <div className="font-semibold text-blue-400 mb-4">
          Total: {formatCurrency(localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={() => onSave(localItems)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}