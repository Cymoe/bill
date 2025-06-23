import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Minus, Edit2, ChevronLeft, Package, FileText, Search } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';
import { EditProductModal } from '../products/EditProductModal';
import { getCollectionLabel } from '../../constants/collections';

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
  creationType?: 'scratch' | 'template';
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: string;
  category?: string;
  is_base_product: boolean;
  items?: any[];
}

// AddItemsSection Component
interface AddItemsSectionProps {
  products: any[];
  onAddProduct: (product: Product) => void;
  onAddLineItem: (lineItem: any) => void;
}

interface Trade {
  id: string;
  name: string;
}

const AddItemsSection: React.FC<AddItemsSectionProps> = ({ products, onAddProduct, onAddLineItem }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'lineItems'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoadingLineItems, setIsLoadingLineItems] = useState(false);
  const [activeType, setActiveType] = useState<string>('all');
  const { user } = useAuth();

  const types = ['all', 'material', 'labor', 'equipment', 'service', 'subcontractor'];

  // Fetch line items when tab switches
  useEffect(() => {
    if (activeTab === 'lineItems' && lineItems.length === 0) {
      fetchLineItems();
      fetchTrades();
    }
  }, [activeTab]);

  const fetchLineItems = async () => {
    try {
      setIsLoadingLineItems(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
    } finally {
      setIsLoadingLineItems(false);
    }
  };

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  // Filter products (bundles)
  const filteredProducts = products.filter(product => 
    (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group filtered products by category
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const categoryLabel = product.category ? getCollectionLabel(product.category) : 'Uncategorized';
    
    if (!groups[categoryLabel]) {
      groups[categoryLabel] = [];
    }
    groups[categoryLabel].push(product);
    
    return groups;
  }, {} as Record<string, any[]>);

  // Sort category names alphabetically
  const sortedCategoryNames = Object.keys(groupedProducts).sort();

  // Filter line items with type filter
  const filteredLineItems = lineItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || item.type === activeType;
    return matchesSearch && matchesType;
  });

  // Group filtered items by trade
  const groupedLineItems = filteredLineItems.reduce((groups, item) => {
    const trade = trades.find(t => t.id === item.trade_id);
    const tradeName = trade?.name || 'Unassigned';
    
    if (!groups[tradeName]) {
      groups[tradeName] = [];
    }
    groups[tradeName].push(item);
    
    return groups;
  }, {} as Record<string, any[]>);

  // Sort trade names alphabetically
  const sortedTradeNames = Object.keys(groupedLineItems).sort();

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-sm font-medium rounded-[4px] transition-colors ${
            activeTab === 'products'
              ? 'bg-[#336699] text-white'
              : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lineItems')}
          className={`px-4 py-2 text-sm font-medium rounded-[4px] transition-colors ${
            activeTab === 'lineItems'
              ? 'bg-[#336699] text-white'
              : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Line Items
          </div>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'products' ? 'products' : 'line items'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
        />
      </div>

      {/* Type Filter Pills - Only show for line items */}
      {activeTab === 'lineItems' && (
        <div className="flex gap-1 overflow-x-auto mb-3">
          {types.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors whitespace-nowrap ${
                activeType === type
                  ? 'bg-[#336699] text-white'
                  : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      <div className="max-h-60 overflow-y-auto">
        {activeTab === 'products' ? (
          // Products List
          filteredProducts.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              {searchTerm ? 'No products found' : 'No products available'}
            </div>
          ) : (
            <div>
              {sortedCategoryNames.map(categoryName => (
                <div key={categoryName}>
                  {/* Category Header */}
                  <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                    <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                      {categoryName} ({groupedProducts[categoryName].length})
                    </h4>
                  </div>
                  
                  {/* Category Products */}
                  <div className="divide-y divide-[#2A2A2A]">
                    {groupedProducts[categoryName].map((product: any) => (
                      <div
                        key={product.id}
                        className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                        onClick={() => onAddProduct(product)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-gray-400 truncate">{product.description}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-0.5">
                              Contains {product.items?.length || 0} items
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-mono text-sm text-white font-semibold">{formatCurrency(product.price)}</div>
                            <div className="text-xs text-[#336699] opacity-0 group-hover:opacity-100 transition-opacity">
                              + Add All
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Line Items List
          isLoadingLineItems ? (
            <div className="text-center py-4 text-gray-400 text-sm">Loading...</div>
          ) : Object.entries(groupedLineItems).length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              {searchTerm ? 'No line items found' : activeType !== 'all' ? `No ${activeType} items` : 'No line items available'}
            </div>
          ) : (
            <div>
              {sortedTradeNames.map(tradeName => (
                <div key={tradeName}>
                  {/* Trade Header */}
                  <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                    <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                      {tradeName} ({groupedLineItems[tradeName].length})
                    </h4>
                  </div>
                  
                  {/* Trade Items */}
                  <div className="divide-y divide-[#2A2A2A]">
                    {groupedLineItems[tradeName].map((item: any) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                        onClick={() => onAddLineItem(item)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-400 truncate">{item.description}</div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-mono text-sm text-white font-semibold">{formatCurrency(item.price)}</div>
                            <div className="text-xs text-gray-400">/{item.unit}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export const NewInvoiceModal = ({ onClose, onSave, creationType }: NewInvoiceModalProps): JSX.Element => {
  const [step, setStep] = useState<'create' | 'select-packages'>(
    creationType === 'scratch' ? 'create' : 'select-packages'
  );
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

  // Add state for preview and categories
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('All');

  // Template categories for construction business
  const templateCategories = [
    'All',
    'Residential', 
    'Commercial', 
    'Maintenance', 
    'Emergency'
  ];

  // Mock usage stats - in real app this would come from database
  const getUsageStats = (templateId: string) => {
    const mockStats = {
      [templateId]: Math.floor(Math.random() * 25) + 1
    };
    return mockStats[templateId] || Math.floor(Math.random() * 15) + 1;
  };

  // Mock template categories - in real app this would be stored in database
  const getTemplateCategory = (templateId: string) => {
    const categories = ['Residential', 'Commercial', 'Maintenance', 'Emergency'];
    return categories[Math.floor(Math.random() * categories.length)];
  };

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
        supabase.from('products').select(`
          *,
          items:product_line_items!product_line_items_product_id_fkey(*)
        `).eq('user_id', user.id),
        db.invoice_templates.list(user.id).catch(err => { console.error('TEMPLATE FETCH ERROR:', err); return []; })
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (productsRes.error) throw productsRes.error;

      console.log('Raw products from DB:', productsRes.data);

      setClients(clientsRes.data || []);
      setProducts(productsRes.data || []);
      setTemplates(templates || []);
      setLoading(false);
      console.log('Loaded templates:', templates);
      console.log('Final products set:', productsRes.data);
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
    <div className="fixed inset-0 z-[10000] flex justify-end">
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      <div
        className={`
          fixed w-full ${previewTemplate ? 'md:w-[520px] lg:w-[620px]' : 'md:w-[600px] lg:w-[700px]'}
          transition-all duration-300 ease-out
          bg-[#121212]
          shadow-xl
          overflow-hidden
          top-0 bottom-0 right-0 h-full
          transform
          ${isClosing
            ? 'translate-x-full'
            : 'translate-x-0'
          }
          ${previewTemplate ? 'mr-80' : 'mr-0'}
          relative
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-[#1E1E1E] border-b border-[#333333] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step === 'create' && creationType === 'template' && (
                  <button
                    onClick={() => setStep('select-packages')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
            </button>
                )}
                <h1 className="text-xl font-semibold text-white">
                  {step === 'select-packages' ? 'Select Template' : 'Create Invoice'}
                </h1>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#121212]">
            {step === 'select-packages' && (
              <div className="p-6">
                {/* Start from Scratch Option */}
                <div className="mb-6">
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, items: [] }));
                        setStep('create');
                      }}
                    className="w-full p-6 bg-[#1E1E1E] border border-[#333333] rounded-[4px] hover:border-[#555555] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Start Fresh</h3>
                        <p className="text-sm text-gray-400">Create a blank invoice without a template</p>
                  </div>
                      <div className="bg-[#336699] text-white px-4 py-2 rounded-[4px] group-hover:bg-[#2A5580] transition-colors">
                        CREATE BLANK
                </div>
                    </div>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-[#333333]" />
                  <span className="mx-4 text-sm text-gray-400 uppercase">or choose a template</span>
                  <div className="flex-1 border-t border-[#333333]" />
                </div>

                {/* Search and Category Filters */}
                <div className="space-y-4 mb-6">
                    <input
                      type="text"
                    placeholder="Search templates..."
                      value={packageSearch}
                      onChange={e => setPackageSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                  
                  {/* Template Category Filter */}
                  <div className="flex gap-2 overflow-x-auto">
                    {templateCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedTemplateCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-[4px] transition-colors whitespace-nowrap ${
                          selectedTemplateCategory === category
                            ? 'bg-[#336699] text-white'
                            : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates List */}
                <div className="space-y-2">
                    {templates.filter(pkg =>
                    (selectedTemplateCategory === 'All' || getTemplateCategory(pkg.id) === selectedTemplateCategory) &&
                      (pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
                        (pkg.description || '').toLowerCase().includes(packageSearch.toLowerCase())
                      )
                    ).map(pkg => {
                      const isSelected = selectedPackages.some(p => p.id === pkg.id);
                      const items = editedPackages[pkg.id] || pkg.items || [];
                      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const usageCount = getUsageStats(pkg.id);
                    const category = getTemplateCategory(pkg.id);
                    
                      return (
                      <div
                          key={pkg.id}
                        className={`
                          p-4 bg-[#1E1E1E] border rounded-[4px] transition-all relative
                          ${isSelected 
                            ? 'border-[#336699] bg-[#1E1E1E]/80' 
                            : 'border-[#333333] hover:border-[#555555]'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedPackages(prev =>
                                isSelected
                                  ? prev.filter(p => p.id !== pkg.id)
                                  : [...prev, pkg]
                              );
                            }}
                              className="w-4 h-4 rounded border-gray-600 text-[#336699] focus:ring-[#336699] mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{pkg.name}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-[2px] font-medium ${
                                  category === 'Residential' ? 'bg-green-500/20 text-green-300' :
                                  category === 'Commercial' ? 'bg-blue-500/20 text-blue-300' :
                                  category === 'Maintenance' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {category}
                          </span>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                {items.length} item{items.length !== 1 ? 's' : ''}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Used {usageCount} times last month</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewTemplate(pkg);
                                  }}
                                  className="text-[#336699] hover:text-white transition-colors"
                                >
                                  👁️ Preview
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold text-white">
                              {formatCurrency(total)}
                            </div>
                            <div className="text-xs text-gray-400">Total</div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                </div>

                {/* Fixed Footer */}
                {selectedPackages.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-[#333333] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-400">
                        Selected: {selectedPackages.length} template{selectedPackages.length !== 1 ? 's' : ''}
                      </div>
                      <div className="font-mono font-semibold text-white">
                        {formatCurrency(selectedPackages.reduce((sum, pkg) => {
                        const items = editedPackages[pkg.id] || pkg.items || [];
                        return sum + items.reduce((s, i) => s + (i.price * i.quantity), 0);
                        }, 0))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="flex-1 px-4 py-2 bg-transparent border border-[#555555] text-white rounded-[4px] hover:bg-[#333333] transition-colors"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
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
                        Use Template{selectedPackages.length > 1 ? 's' : ''}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          {step === 'create' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Client Selector */}
              <div>
                  <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Client *
                  </label>
                <select
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
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

                {/* Line Items Section with Tabs */}
              <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                      Invoice Items
                    </label>
                  </div>

                  {/* Add Items Section */}
                  <div className="bg-[#1E1E1E] rounded-[4px] border border-[#333333] p-4 mb-4">
                    <AddItemsSection
                      products={products}
                      onAddProduct={(product) => {
                        // Add all items from the product bundle
                        const newItems = product.items?.map((item: any) => ({
                          product_id: item.line_item_id || item.product_id,
                          quantity: item.quantity,
                          price: item.price,
                          description: item.description || ''
                        })) || [];
                        
                        setFormData(prev => ({
                          ...prev,
                          items: [...prev.items, ...newItems]
                        }));
                      }}
                      onAddLineItem={(lineItem) => {
                        setFormData(prev => ({
                          ...prev,
                          items: [...prev.items, {
                            product_id: lineItem.id,
                            quantity: 1,
                            price: lineItem.price,
                            description: lineItem.description || ''
                          }]
                        }));
                      }}
                    />
                  </div>

                  {/* Selected Items List */}
                  {formData.items.length === 0 ? (
                    <div className="text-center py-8 bg-[#1E1E1E] rounded-[4px] border border-[#333333]">
                      <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No items added yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Add products or line items above
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#1E1E1E] rounded-[4px] border border-[#333333]">
                          <div className="flex-1">
                            <div className="text-white">
                              {products.find(p => p.id === item.product_id)?.name || 'Unknown Item'}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(idx, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                      <input
                        type="number"
                        min={1}
                              className="w-16 text-center px-2 py-1 bg-[#333333] border border-[#555555] rounded-[2px] text-white font-mono"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                            <button
                              type="button"
                              onClick={() => adjustQuantity(idx, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                      <input
                        type="number"
                        min={0}
                        step={0.01}
                            className="w-24 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white text-right font-mono focus:outline-none focus:border-[#336699]"
                        value={item.price}
                        onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                            className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                  )}
              </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Issue Date
                    </label>
                  <input
                    type="date"
                      className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    value={formData.issue_date}
                    onChange={e => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Due Date
                    </label>
                  <input
                    type="date"
                      className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    value={formData.due_date}
                    onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>

                {/* Description */}
              <div>
                  <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                <textarea
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699] resize-none"
                    rows={3}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any notes or description..."
                />
              </div>

                {/* Total Summary */}
                <div className="bg-[#1E1E1E] rounded-[4px] p-4 border border-[#333333]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 uppercase tracking-wider">Total Amount</span>
                    <span className="text-2xl font-mono font-semibold text-white">
                      {formatCurrency(calculateTotal())}
                    </span>
              </div>
                </div>

              {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[#333333]">
                <button
                  type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-transparent border border-[#555555] text-white rounded-[4px] hover:bg-[#333333] transition-colors"
                  disabled={loading}
                >
                    Cancel
                </button>
                <button
                  type="submit"
                    className="flex-1 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50"
                    disabled={loading || !formData.client_id || formData.items.length === 0}
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          )}
          </div>
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

      {/* Template Preview Panel */}
      {previewTemplate && (
        <div className="absolute top-0 right-0 w-80 bg-[#1A1A1A] border-l border-[#333333] flex flex-col h-full z-10">
          <div className="flex items-center justify-between p-4 border-b border-[#333333]">
            <h3 className="text-white font-medium">Template Preview</h3>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            <div className="bg-white rounded-[4px] p-4 text-black text-xs">
              {/* Mini Invoice Preview */}
              <div className="text-center mb-4">
                <h1 className="text-lg font-bold text-gray-800">INVOICE</h1>
                <div className="text-gray-600 mt-1">Your Construction Company</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                <div>
                  <div className="font-semibold text-gray-700">Bill To:</div>
                  <div className="text-gray-600">Client Name</div>
                  <div className="text-gray-600">Client Address</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-700">Invoice #001</div>
                  <div className="text-gray-600">Date: {new Date().toLocaleDateString()}</div>
                  <div className="text-gray-600">Due: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-300 pt-2">
                <div className="grid grid-cols-4 gap-1 text-xs font-semibold text-gray-700 mb-2">
                  <div>Description</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Rate</div>
                  <div className="text-right">Amount</div>
                </div>
                
                {(previewTemplate.items || []).slice(0, 3).map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-1 text-xs text-gray-600 py-1">
                    <div className="truncate">Item {idx + 1}</div>
                    <div className="text-center">{item.quantity}</div>
                    <div className="text-right">${item.price.toFixed(2)}</div>
                    <div className="text-right">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
                
                {(previewTemplate.items || []).length > 3 && (
                  <div className="text-xs text-gray-400 py-1">
                    + {(previewTemplate.items || []).length - 3} more items...
                  </div>
                )}
                
                <div className="border-t border-gray-300 mt-2 pt-2">
                  <div className="flex justify-between text-sm font-semibold text-gray-800">
                    <span>Total:</span>
                    <span>${((previewTemplate.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                This is a preview of your invoice layout
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-[#333333]">
            <button
              onClick={() => {
                setSelectedPackages(prev => {
                  const isAlreadySelected = prev.some(p => p.id === previewTemplate.id);
                  if (isAlreadySelected) {
                    return prev;
                  }
                  return [...prev, previewTemplate];
                });
                setPreviewTemplate(null);
              }}
              className="w-full px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors text-sm"
            >
              Use This Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function EditPackageModal({ pkg, items, onSave, onCancel, products }: { pkg: Template, items: any[], onSave: (items: any[]) => void, onCancel: () => void, products: any[] }) {
  const [localItems, setLocalItems] = useState(() => items.map(i => ({ ...i })));
  
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-[#1E1E1E] rounded-[4px] p-6 w-full max-w-lg border border-[#333333]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-white text-lg">Edit {pkg.name}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          {localItems.map((item, idx) => {
            const product = products.find(p => p.id === item.product_id);
            return (
              <div key={idx} className="flex items-center gap-2 p-2 bg-[#333333] rounded-[4px]">
                <span className="flex-1 text-white">{product?.name || item.description || 'Item'}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 1;
                    setLocalItems(items => items.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                  }}
                  className="w-16 px-2 py-1 rounded-[2px] bg-[#1E1E1E] border border-[#555555] text-white text-center"
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
                  className="w-20 px-2 py-1 rounded-[2px] bg-[#1E1E1E] border border-[#555555] text-white text-right"
                />
                <span className="w-20 text-right text-white font-mono">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            );
          })}
        </div>
        
        <div className="font-semibold text-[#336699] mb-4 text-right">
          Total: {formatCurrency(localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
        </div>
        
        <div className="flex gap-3">
          <button
            className="flex-1 bg-transparent border border-[#555555] hover:bg-[#333333] text-white px-4 py-2 rounded-[4px] transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-[#336699] hover:bg-[#2A5580] text-white px-4 py-2 rounded-[4px] transition-colors"
            onClick={() => onSave(localItems)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}