import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Template {
  id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

interface Invoice {
  id: string;
  [key: string]: any;
}

interface InvoiceFormProps {
  step: 'select' | 'template' | 'create';
  setStep: (step: 'select' | 'template' | 'create') => void;
  templates: Template[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<Invoice>;
  projectId?: string; // Optional project ID if creating from project context
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  step,
  setStep,
  templates,
  onClose,
  onSubmit,
  projectId
}) => {
  const { user } = useAuth();
  const [clients, setClients] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [projects, setProjects] = React.useState<any[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<string | undefined>(projectId);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const [clientsRes, productsRes, projectsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id)
      ]);

      if (clientsRes.error) console.error('Error fetching clients:', clientsRes.error);
      if (productsRes.error) console.error('Error fetching products:', productsRes.error);
      if (projectsRes.error) console.error('Error fetching projects:', projectsRes.error);

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      
      // Only set projects if we're not already in a project context
      if (!projectId) {
        setProjects(projectsRes.data || []);
      }
      setProjects(projectsRes.data || []);
    };

    fetchData();

    // If projectId is provided, update form data
    if (projectId) {
      setFormData(prev => ({ ...prev, project_id: projectId }));
      setSelectedProject(projectId);
    }
  }, [user, projectId]);

  const [formData, setFormData] = React.useState({
    project_id: projectId || '',
    number: `INV-${Date.now()}`,
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as const,
    items: [] as Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setFormData(prev => ({
      ...prev,
      items: template.items
    }));
    setStep('create');
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

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProjectId = e.target.value;
    setSelectedProject(newProjectId);
    setFormData(prev => ({ ...prev, project_id: newProjectId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Create the invoice
      const invoice = await onSubmit({
        ...formData,
        total_amount: calculateTotal()
      });
      
      // If we have a project ID and the invoice was created successfully,
      // create the project-invoice relationship
      if (formData.project_id && invoice?.id) {
        const { error } = await supabase
          .from('project_invoices')
          .insert({
            project_id: formData.project_id,
            invoice_id: invoice.id
          });
        
        if (error) {
          console.error('Error linking invoice to project:', error);
        }
      }
      
      onClose();
    } catch (err) {
      setError('Failed to submit form');
      setLoading(false);
    }
  };

  // Render the appropriate step content
  if (step === 'select') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
          How would you like to create your invoice?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button
            onClick={() => setStep('template')}
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-steel-blue dark:hover:border-steel-blue text-left"
          >
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Use a Template
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start with a pre-configured template to save time
            </p>
          </button>

          <button
            onClick={() => setStep('create')}
            className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-steel-blue dark:hover:border-steel-blue text-left"
          >
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Create from Scratch
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start with a blank invoice and customize everything
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'template') {
    return (
      <div className="p-4">
        {!projectId && projects.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Project (Optional)
          </label>
          <select
            value={selectedProject || ''}
            onChange={handleProjectChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Client
        </label>
        <select
          value={formData.client_id}
          onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          required
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company_name} - {client.name}
            </option>
          ))}
        </select>
      </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select a Template
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-steel-blue dark:hover:border-steel-blue"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Template {template.id}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {template.items.length} items
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name} - {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
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
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 mb-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}; 