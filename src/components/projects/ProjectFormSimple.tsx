import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface LineItem {
  product_id: string;
  quantity: number;
  price: number;
  description?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  client_id: string;
  budget: number;
  start_date: string;
  end_date: string;
  category?: string;
  category_id?: string;
  items: LineItem[];
}

interface ProjectFormSimpleProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ProjectFormData>;
  submitLabel?: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

const PROJECT_CATEGORIES = [
  { value: 'kitchen-bath', label: 'Kitchen & Bath' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'structural', label: 'Structural' },
  { value: 'systems', label: 'Systems' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'new-construction', label: 'New Construction' },
  { value: 'general', label: 'General' }
];

const PROJECT_STATUSES = [
  { value: 'active', label: 'Active', color: 'text-green-400' },
  { value: 'on-hold', label: 'On Hold', color: 'text-yellow-400' },
  { value: 'completed', label: 'Completed', color: 'text-blue-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' }
];

export const ProjectFormSimple: React.FC<ProjectFormSimpleProps> = ({
  onSubmit,
  onCancel,
  initialData,
  submitLabel = 'Save'
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active',
    client_id: initialData?.client_id || '',
    budget: initialData?.budget || 0,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || '',
    category: initialData?.category || '',
    category_id: initialData?.category_id || '',
    items: initialData?.items || [{ product_id: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [clientsRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user?.id).order('name'),
        supabase.from('products').select('*').eq('user_id', user?.id).order('name'),
        supabase.from('project_categories').select('*').eq('is_active', true).order('display_order')
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      
      // Set default category if not already set
      if (!formData.category_id && categoriesRes.data && categoriesRes.data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          category_id: categoriesRes.data[0].id,
          category: categoriesRes.data[0].slug 
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        price: product ? product.price : 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update budget with calculated total
      const total = calculateTotal();
      await onSubmit({ ...formData, budget: total });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Project Name and Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
            placeholder="Kitchen Remodel"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => {
              const category = categories.find(c => c.id === e.target.value);
              setFormData(prev => ({ 
                ...prev, 
                category_id: e.target.value,
                category: category?.slug || ''
              }));
            }}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          rows={3}
          placeholder="Project details and scope..."
        />
      </div>

      {/* Client and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Client <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.client_id}
            onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
            required
          >
            <option value="">Select a client...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
          >
            {PROJECT_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Start Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40"
            min={formData.start_date}
          />
        </div>
      </div>

      {/* Line Items Section */}
      <div className="border-t border-[#555555] pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-300">Line Items</h3>
          <div className="text-sm text-[#336699] font-medium">
            Total: {formatCurrency(calculateTotal())}
          </div>
        </div>
        
        <div className="space-y-2">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                  className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40 text-sm"
                >
                  <option value="">Select product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({formatCurrency(product.price)}/{product.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40 text-sm"
                  placeholder="Qty"
                  min="1"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#0D47A1] focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/40 text-sm"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                />
              </div>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm text-[#336699] hover:text-white transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Line Item
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-[#555555]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[#336699]/40 rounded-[4px] text-white hover:bg-[#333333] transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}; 