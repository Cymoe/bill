import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Search, Plus } from 'lucide-react';
import { db } from '../../lib/database';
import type { Tables } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import { Combobox } from '../ui/Combobox';

type Client = Tables['clients'];
type LineItem = {
  product_id: string;
  quantity: number;
  price: number;
  description?: string;
};

type ProjectFormData = Omit<Tables['projects'], 'id' | 'created_at' | 'updated_at'> & {
  user_id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  client_id: string;
  budget: number;
  start_date: string;
  end_date: string;
  items: LineItem[];
  template_id: string;
};

export const ProjectForm: React.FC = () => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) : value
    }));
  };
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('');
  const [rawTemplateItems, setRawTemplateItems] = React.useState<any[]>([]);

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

  const [formData, setFormData] = React.useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'active',
    client_id: '',
    budget: 0,
    start_date: '',
    end_date: '',
    items: [{ product_id: '', quantity: 1, price: 0 }],
    user_id: '',
    template_id: '',
  });

  React.useEffect(() => {
    const setUserIdInForm = (userId: string) => {
      setFormData(prev => ({ ...prev, user_id: userId }));
    };
    const fetchData = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          return;
        }

        const userId = session.user.id;
        setUserIdInForm(userId);

        // Fetch clients, products, and templates
        const [clientsData, productsData, templatesData] = await Promise.all([
          db.clients.list(session.user.id),
          db.products.list(session.user.id),
          db.invoice_templates.list(session.user.id)
        ]);

        setClients(clientsData);
        setProducts(productsData);
        setTemplates(templatesData);

        // If editing, fetch project data
        if (id) {
          const projectData = await db.projects.getById(id);
          setFormData(projectData);
          setSelectedTemplateId(projectData.template_id || '');
          // If editing, also set rawTemplateItems if template_id exists
          if (projectData.template_id) {
            const selected = templatesData.find((t: any) => t.id === projectData.template_id);
            setRawTemplateItems(selected?.items || []);
          }
        }
      } catch (error) {
      }
    };

    fetchData();
  }, [id]);

  // Reactively map template items to products when both are available
  React.useEffect(() => {
    if (selectedTemplateId && products.length > 0 && rawTemplateItems.length > 0) {
      // Update prices from products if they exist
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (item.product_id) {
            const product = products.find(p => p.id === item.product_id);
            return {
              ...item,
              price: product?.price || item.price
            };
          }
          return item;
        })
      }));
    }
  }, [selectedTemplateId, products, rawTemplateItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update budget with calculated total from line items
      const total = calculateTotal();
      setFormData(prev => ({ ...prev, budget: total }));
      if (id) {
        await db.projects.update(id, formData);
      } else {
        await db.projects.create(formData);
      }
      navigate('/projects');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Compact Header - Price Book Style */}
      <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{id ? 'Edit Project' : 'New Project'}</h1>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/projects')}
              className="p-2 hover:bg-[#1E1E1E] rounded-[4px] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-gray-400">Status: </span>
            <span className="text-white font-medium">{id ? 'Editing' : 'Creating'}</span>
          </div>
          <div>
            <span className="text-gray-400">Budget: </span>
            <span className="text-[#336699] font-medium">${calculateTotal().toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Items: </span>
            <span className="text-white font-medium">{formData.items.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

        <div className="bg-[#1e2532] shadow px-4 py-5 rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-400">
                Project Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">Enter a descriptive name for your project</p>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-400">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-2 text-xs text-gray-400">Provide details about the project scope and objectives</p>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="client" className="block text-sm font-medium text-gray-400">
                Client
              </label>
              <div className="mt-1">
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="" className="text-gray-900">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="text-gray-900">
                      {client.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-400">Select the client this project belongs to</p>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-400">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="active" className="text-gray-900">Active</option>
                  <option value="completed" className="text-gray-900">Completed</option>
                  <option value="on-hold" className="text-gray-900">On Hold</option>
                  <option value="cancelled" className="text-gray-900">Cancelled</option>
                </select>
                <p className="mt-2 text-xs text-gray-400">Current status of the project</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-400">
                Budget
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">Total budget allocated for this project</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-400">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">When does the project begin?</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-400">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="mt-1 block w-full h-10 px-3 rounded-md border-0 bg-[#2a3441] text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="mt-2 text-xs text-gray-400">Expected completion date</p>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="sm:col-span-6 mt-6">
              <div className="flex justify-between items-center mb-4 bg-[rgba(255,255,255,0.08)] p-4 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <Combobox
                    options={[
                      { value: 'scratch', label: 'Empty Project' },
                      ...templates.map(t => ({
                        value: t.id,
                        label: `${t.name} — $${(t.total_amount ?? 0).toLocaleString()}`
                      }))
                    ]}
                    value={selectedTemplateId || ''}
                    onChange={(value) => {
                      setSelectedTemplateId(value);
                      if (value === 'scratch') {
                        setRawTemplateItems([]);
                        setFormData(prev => ({
                          ...prev,
                          template_id: '',
                          items: [{ product_id: '', quantity: 1, price: 0 }]
                        }));
                      } else {
                        const selected = templates.find(t => t.id === value);
                        
                        // Get items from the template
                        const templateItems = selected?.items || [];
                        setRawTemplateItems(templateItems);
                        
                        if (templateItems.length > 0) {
                          // Map template items using their product data
                          const mappedItems = templateItems.map((item: { 
                            product_id: string; 
                            quantity: number; 
                            price: number;
                            product?: {
                              id: string;
                              name: string;
                              price: number;
                            }
                          }) => {
                            return {
                              product_id: item.product_id,
                              quantity: item.quantity,
                              price: item.product?.price || item.price
                            };
                          });
                          setFormData(prev => ({
                            ...prev,
                            template_id: value,
                            items: mappedItems
                          }));
                        }
                      }
                    }}
                    placeholder="Choose template..."
                  />
                </div>
                <div className="text-lg font-medium text-white">
                  Total Budget: ${calculateTotal().toFixed(2)}
                </div>
              </div>
              <div className="space-y-4">

                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        className="w-full h-[40px] bg-[rgba(255,255,255,0.08)] rounded-xl px-3 text-white backdrop-blur-md border-none focus:outline-none focus:ring-2 focus:ring-accent hover:bg-[rgba(255,255,255,0.16)] transition-colors"
                      >
                        <option value="">Choose product...</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (${product.price}/{product.unit})
                          </option>
                        ))}
                        {/* Fallback for unknown product_id */}
                        {item.product_id &&
                          !products.some((p) => p.id === item.product_id) && (
                            <option value={item.product_id}>
                              Unknown product ({item.product_id})
                            </option>
                          )}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        className="w-full h-[40px] bg-[rgba(255,255,255,0.08)] rounded-xl px-3 text-white backdrop-blur-md border-none focus:outline-none focus:ring-2 focus:ring-accent hover:bg-[rgba(255,255,255,0.16)] transition-colors"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        className="w-full h-[40px] bg-[rgba(255,255,255,0.08)] rounded-xl px-3 text-white backdrop-blur-md border-none focus:outline-none focus:ring-2 focus:ring-accent hover:bg-[rgba(255,255,255,0.16)] transition-colors"
                        placeholder="Price"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 inline-flex items-center h-[40px] px-4 text-sm font-medium rounded-full text-white bg-[rgba(255,59,48,0.48)] hover:bg-[rgba(255,59,48,0.64)] focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              >
                Add Line Item
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="inline-flex items-center h-10 px-4 rounded-md text-sm font-medium text-white bg-[#1e2532] hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center h-10 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Saving...' : id ? 'Update Project' : 'Create Project'}
          </button>
        </div>
        </form>
      </div>
    </>
  );
};

export default ProjectForm;
