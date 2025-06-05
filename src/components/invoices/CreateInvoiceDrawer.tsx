import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Minus, X, Save, FileText, Package, ArrowRight, CheckCircle, Check } from 'lucide-react';
import { getCollectionLabel } from '../../constants/collections';

interface InvoiceItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  description?: string;
  unit?: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  total_amount: number;
  created_at?: string;
  content?: {
    description?: string;
    total_amount?: number;
  };
  items?: Array<{
    product_id: string;
    quantity: number;
    price: number;
    description?: string;
    product?: any;
  }>;
  category_id?: string;
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
  trade_id?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Trade {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  client_id: string;
  status: string;
}

interface InvoiceFormData {
  client_id: string;
  project_id?: string;
  items: InvoiceItem[];
  total_amount: number;
  description: string;
  due_date: string;
  status: string;
  issue_date: string;
}

interface CreateInvoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InvoiceFormData) => void;
  editingInvoice?: any; // Invoice being edited
  projectContext?: {
    projectId: string;
    clientId: string;
    projectName: string;
    projectBudget: number;
  };
}

export const CreateInvoiceDrawer: React.FC<CreateInvoiceDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingInvoice,
  projectContext
}) => {
  const { user } = useAuth();
  const [sourceType, setSourceType] = useState<'scratch' | 'template' | 'progress' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'lineItems'>('products');
  const [activeType, setActiveType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectCategory, setProjectCategory] = useState<string | null>(null);
  
  // Form data
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  
  // New contractor features
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Progress billing specific
  const [selectedMilestone, setSelectedMilestone] = useState('');
  const [milestonePercentage, setMilestonePercentage] = useState(25);
  
  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user?.id, projectCategory]);

  // Load invoice data when editing
  useEffect(() => {
    if (isOpen && editingInvoice) {
      // Set form data from existing invoice
      setSelectedClient(editingInvoice.client_id || '');
      setSelectedProject(editingInvoice.project_id || '');
      setInvoiceDescription(editingInvoice.description || '');
      setIssueDate(editingInvoice.issue_date ? editingInvoice.issue_date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setDueDate(editingInvoice.due_date ? editingInvoice.due_date.split('T')[0] : '');
      
      // Load invoice items
      loadInvoiceItems();
    }
  }, [isOpen, editingInvoice]);

  // Handle project context
  useEffect(() => {
    if (isOpen && projectContext && !editingInvoice) {
      // Pre-fill with project information
      if (projectContext.clientId) {
        setSelectedClient(projectContext.clientId);
      }
      if (projectContext.projectId) {
        setSelectedProject(projectContext.projectId);
      }
      if (projectContext.projectName) {
        setInvoiceDescription(`Invoice for ${projectContext.projectName}`);
      }
      // Set source type to scratch to show the items selection
      setSourceType('scratch');
    }
  }, [isOpen, projectContext, editingInvoice]);

  // Load project category when project context is provided
  useEffect(() => {
    if (isOpen && projectContext?.projectId && user) {
      loadProjectCategory();
    }
  }, [isOpen, projectContext?.projectId, user]);

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (issueDate && paymentTerms) {
      const issue = new Date(issueDate);
      let daysToAdd = 30; // Default
      
      if (paymentTerms === 'Net 15') daysToAdd = 15;
      if (paymentTerms === 'Net 30') daysToAdd = 30;
      if (paymentTerms === 'Net 60') daysToAdd = 60;
      if (paymentTerms === 'Due on Receipt') daysToAdd = 0;
      
      const due = new Date(issue);
      due.setDate(due.getDate() + daysToAdd);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [issueDate, paymentTerms]);

  // Generate invoice number when opening
  useEffect(() => {
    if (isOpen && !editingInvoice && !invoiceNumber) {
      generateInvoiceNumber();
    }
  }, [isOpen, editingInvoice]);

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_invoice_number', { p_user_id: user?.id });
        
      if (error) throw error;
      setInvoiceNumber(data);
    } catch (error) {
      console.error('Error generating invoice number via function:', error);
      
      // Professional fallback: Use current year and timestamp
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const timestamp = Date.now().toString().slice(-6);
      const fallbackNumber = `INV-${currentYear}-${timestamp}`;
      
      console.log('Using fallback invoice number:', fallbackNumber);
      setInvoiceNumber(fallbackNumber);
    }
  };

  const loadInvoiceItems = async () => {
    if (!editingInvoice || !user) return;
    
    try {
      const { data: items, error } = await supabase
        .from('invoice_items')
        .select('*, product:products(*)')
        .eq('invoice_id', editingInvoice.id);
        
      if (error) throw error;
      
      const invoiceItems: InvoiceItem[] = (items || []).map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.price || item.unit_price || item.product?.price || 0,
        unit: item.product?.unit || 'ea',
        description: item.description || item.product?.description
      }));
      
      setSelectedItems(invoiceItems);
      setSourceType('scratch'); // Default to scratch mode when editing
    } catch (error) {
      console.error('Error loading invoice items:', error);
    }
  };

  const loadProjectCategory = async () => {
    if (!projectContext?.projectId) return;
    
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('category_id')
        .eq('id', projectContext.projectId)
        .single();
        
      if (error) throw error;
      
      setProjectCategory(project?.category_id || null);
    } catch (error) {
      console.error('Error loading project category:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Build base queries array
      const queries = [
        supabase.from('clients').select('*').eq('user_id', user?.id),
        supabase.from('projects').select('*').eq('user_id', user?.id).order('name'),
        // Get all products with their line items (where this product is the parent bundle)
        supabase.from('products')
          .select(`
            *,
            items:product_line_items!product_line_items_product_id_fkey(
              *,
              line_item:products!product_line_items_line_item_id_fkey(*)
            )
          `)
          .eq('user_id', user?.id),
        // Get all products to show as individual line items
        supabase.from('products')
          .select('*')
          .eq('user_id', user?.id),
        supabase.from('trades')
          .select('id, name')
          .order('name')
      ];

      // Conditionally add template query with category filter
      let templateQuery = supabase.from('invoice_templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      // If we have a project category, filter templates by it
      if (projectCategory) {
        templateQuery = templateQuery.eq('category_id', projectCategory);
      }
      
      // Execute all queries
      const [clientsRes, projectsRes, productsRes, lineItemsRes, tradesRes] = await Promise.all(queries);
      const templatesRes = await templateQuery;

      if (clientsRes.error) throw clientsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (productsRes.error) throw productsRes.error;
      if (lineItemsRes.error) throw lineItemsRes.error;
      if (tradesRes.error) console.error('Trades error:', tradesRes.error);
      if (templatesRes.error) console.error('Templates error:', templatesRes.error);
      
      console.log('Clients loaded:', clientsRes.data);
      console.log('Projects loaded:', projectsRes.data);
      console.log('Products loaded:', productsRes.data);
      console.log('Line items loaded:', lineItemsRes.data);
      console.log('Raw templates loaded:', templatesRes.data);
      console.log('Trades loaded:', tradesRes.data);
      console.log('Project category filter:', projectCategory);
      
      // Add debugging for projects
      console.log('Projects array length:', projectsRes.data?.length || 0);
      console.log('Projects data:', projectsRes.data);
      
      // For now, show all products in both tabs until we have a better way to differentiate
      const allProducts = productsRes.data || [];
      const allLineItems = lineItemsRes.data || [];
      
      // Process templates and fetch their items separately
      let processedTemplates: Template[] = [];
      if (templatesRes.data && templatesRes.data.length > 0) {
        // Fetch items for all templates
        const { data: allTemplateItems, error: itemsError } = await supabase
          .from('invoice_template_items')
          .select('*, product:products(*)')
          .in('template_id', templatesRes.data.map(t => t.id));
          
        if (itemsError) {
          console.error('Template items error:', itemsError);
        }
        
        processedTemplates = templatesRes.data.map(template => {
          // Find items for this template
          const templateItems = allTemplateItems?.filter(item => item.template_id === template.id) || [];
          
          // Calculate total from items if not in content
          const itemsTotal = templateItems.reduce((sum: number, item: any) => 
            sum + (item.price * item.quantity), 0) || 0;
          
          return {
            ...template,
            description: template.content?.description || '',
            total_amount: template.content?.total_amount || itemsTotal,
            items: templateItems
          };
        });
      }
      
      console.log('Processed templates:', processedTemplates);
      
      setClients(clientsRes.data || []);
      setProjects(projectsRes.data as Project[] || []);
      setProducts(allProducts as Product[]);
      setLineItems(allLineItems as Product[]);
      setTemplates(processedTemplates);
      setTrades(tradesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    // Add template items to existing items
    if (template.items) {
      const newItems: InvoiceItem[] = template.items.map(item => {
        // Handle both nested product and separate product field
        const product = item.product || (item as any).product || {};
        return {
          product_id: item.product_id,
          product_name: product.name || 'Unknown Item',
          quantity: item.quantity,
          price: item.price,
          unit: product.unit || 'ea',
          description: item.description || product.description
        };
      });
      // Add to existing items
      setSelectedItems([...selectedItems, ...newItems]);
      
      // Show feedback
      setAddedTemplateId(template.id);
      setTimeout(() => setAddedTemplateId(null), 2000);
    }
  };

  const addProduct = (product: Product) => {
    if (product.items && product.items.length > 0) {
      // Add all items from the product bundle
      const newItems = product.items.map((item: any) => {
        const lineItem = item.line_item || {};
        return {
          product_id: lineItem.id || item.line_item_id,
          product_name: lineItem.name || 'Unknown Item',
          quantity: item.quantity || 1,
          price: item.price || lineItem.price || 0,
          unit: item.unit || lineItem.unit || 'ea',
          description: lineItem.description || item.description
        };
      });
      setSelectedItems([...selectedItems, ...newItems]);
    } else {
      // Single product
      setSelectedItems([...selectedItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        unit: product.unit,
        description: product.description
      }]);
    }
  };

  const addLineItem = (item: Product) => {
    setSelectedItems([...selectedItems, {
      product_id: item.id,
      product_name: item.name,
      quantity: 1,
      price: item.price,
      unit: item.unit,
      description: item.description
    }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    setSelectedItems(updated);
  };

  // Enhanced total calculation that handles progress billing
  const calculateDisplayTotal = () => {
    const itemsTotal = calculateTotal();
    if (sourceType === 'progress' && selectedMilestone && itemsTotal > 0) {
      return (itemsTotal * milestonePercentage) / 100;
    }
    return itemsTotal;
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSave = async () => {
    if (!selectedClient) {
      alert('Please select a client for the invoice.');
      return;
    }

    // Validation for different source types
    if (sourceType === 'progress') {
      if (!selectedMilestone) {
        alert('Please select a milestone for the progress invoice.');
        return;
      }
      if (selectedItems.length === 0) {
        alert('Please add work items for this milestone.');
        return;
      }
    } else if (selectedItems.length === 0) {
      alert('Please add at least one item to the invoice.');
      return;
    }

    if (!dueDate) {
      alert('Please set a due date for the invoice.');
      return;
    }

    // Calculate total amount based on source type
    const totalAmount = calculateDisplayTotal();

    const formData: InvoiceFormData = {
      client_id: selectedClient,
      project_id: selectedProject || undefined,
      items: selectedItems, // Progress invoices now have items too
      total_amount: totalAmount,
      description: sourceType === 'progress' 
        ? `${selectedMilestone} - ${milestonePercentage}% Progress Payment` 
        : invoiceDescription,
      due_date: dueDate,
      status: 'draft',
      issue_date: issueDate
    };

    // Enhanced contractor fields
    const enhancedFormData = {
      ...formData,
      invoice_number: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      payment_terms: paymentTerms,
      balance_due: totalAmount,
      total_paid: 0,
      is_progress_billing: sourceType === 'progress',
      project_milestone: sourceType === 'progress' ? selectedMilestone : undefined,
      milestone_percentage: sourceType === 'progress' ? milestonePercentage : undefined,
      items_subtotal: sourceType === 'progress' ? calculateTotal() : undefined, // Store original items total
      // Add professional metadata
      created_via: 'professional_drawer',
      contractor_features: true,
      billing_type: sourceType || 'standard'
    };

    setIsSaving(true);
    try {
      console.log('Saving enhanced invoice with contractor features:', enhancedFormData);
      await onSave(enhancedFormData);
      handleClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSourceType(null);
    setSelectedClient('');
    setSelectedProject('');
    setInvoiceDescription('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setSelectedItems([]);
    setSearchTerm('');
    setActiveTab('products');
    setActiveType('all');
    setAddedTemplateId(null);
    setPaymentTerms('Net 30');
    setInvoiceNumber('');
    
    // Reset progress billing fields
    setSelectedMilestone('');
    setMilestonePercentage(25);
    
    onClose();
  };

  // Debug function to create a test template
  const createTestTemplate = async () => {
    if (!user || products.length === 0) {
      console.log('Cannot create test template: No user or no products');
      return;
    }
    
    try {
      const testProduct = products[0];
      const { data: template, error: templateError } = await supabase
        .from('invoice_templates')
        .insert({
          user_id: user.id,
          name: 'Test Template',
          content: {
            description: 'This is a test template',
            total_amount: testProduct.price * 2
          }
        })
        .select()
        .single();
        
      if (templateError) throw templateError;
      
      // Add test items
      const { error: itemsError } = await supabase
        .from('invoice_template_items')
        .insert([
          {
            template_id: template.id,
            product_id: testProduct.id,
            quantity: 2,
            price: testProduct.price
          }
        ]);
        
      if (itemsError) throw itemsError;
      
      console.log('Test template created successfully!');
      // Reload templates
      await loadData();
    } catch (error) {
      console.error('Error creating test template:', error);
    }
  };

  // Filter logic
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLineItems = lineItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || item.type === activeType;
    return matchesSearch && matchesType;
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group products by collection
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const collectionLabel = product.category ? getCollectionLabel(product.category) : 'Uncategorized';
    if (!groups[collectionLabel]) {
      groups[collectionLabel] = [];
    }
    groups[collectionLabel].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  // Sort collection names alphabetically
  const sortedCollectionNames = Object.keys(groupedProducts).sort();

  // Group line items by trade
  const groupedLineItems = filteredLineItems.reduce((groups, item) => {
    const trade = trades.find(t => t.id === item.trade_id);
    const tradeName = trade?.name || 'Unassigned';
    if (!groups[tradeName]) {
      groups[tradeName] = [];
    }
    groups[tradeName].push(item);
    return groups;
  }, {} as Record<string, Product[]>);

  // Sort trade names alphabetically
  const sortedTradeNames = Object.keys(groupedLineItems).sort();

  const types = ['all', 'material', 'labor', 'equipment', 'service', 'subcontractor'];

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[10000] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[80%] max-w-[1200px] bg-[#121212] shadow-xl transform transition-transform z-[10001] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Compact Header */}
        <div className="bg-[#1E1E1E] border-b border-[#333333] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h1 className="text-lg font-semibold">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!selectedClient || 
                (sourceType === 'progress' ? (!selectedMilestone || selectedItems.length === 0) : selectedItems.length === 0) || 
                isSaving}
              className="px-4 py-1.5 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              <Save className="w-3 h-3" />
              {isSaving ? (editingInvoice ? 'Updating...' : 'Creating...') : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-60px)]">
          {/* Left Column - Items Selection (40% width) */}
          <div className="w-[40%] border-r border-[#333333] flex flex-col">
            {/* Source Type Selection */}
            {!sourceType && !editingInvoice && (
              <div className="p-4 border-b border-[#333333]">
                <p className="text-sm text-gray-400 mb-3">Choose how to create your invoice:</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setSourceType('scratch')}
                    className="w-full p-3 bg-[#333333] hover:bg-[#404040] border border-[#555555] rounded-[4px] text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#336699]" />
                        <div>
                          <div className="text-sm font-medium text-white">Start from Scratch</div>
                          <div className="text-xs text-gray-400">Build your invoice item by item</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#336699]" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setSourceType('template')}
                    className="w-full p-3 bg-[#333333] hover:bg-[#404040] border border-[#555555] rounded-[4px] text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-400 group-hover:text-[#F9D71C]" />
                        <div>
                          <div className="text-sm font-medium text-white">Use a Template</div>
                          <div className="text-xs text-gray-400">Start with saved templates</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#F9D71C]" />
                    </div>
                  </button>
                  
                  {/* Progress Invoice Option */}
                  <div className="relative">
                    <button
                      onClick={() => setSourceType('progress')}
                      className="w-full p-3 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#F9D71C]/50 rounded-[4px] text-left transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#F9D71C]" />
                          <div>
                            <div className="text-sm font-medium text-white">Progress Invoice</div>
                            <div className="text-xs text-[#F9D71C]">Milestone billing (25%, 50%, etc.)</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#F9D71C]" />
                      </div>
                    </button>
                    <div className="absolute -top-1 -right-1 bg-[#F9D71C] text-black text-xs px-1.5 py-0.5 rounded-[4px] font-semibold">
                      NEW
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items Selection */}
            {(sourceType === 'scratch' || editingInvoice) && (
              <>
                {/* Back to options button */}
                {!editingInvoice && (
                  <div className="p-3 pb-0">
                    <button
                      onClick={() => setSourceType(null)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Back to options
                    </button>
                  </div>
                )}
                
                {/* Tabs */}
                <div className="p-3 pt-0 pb-0">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-[4px] transition-colors ${
                        activeTab === 'products'
                          ? 'bg-[#336699] text-white'
                          : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                      }`}
                    >
                      Products
                    </button>
                    <button
                      onClick={() => setActiveTab('lineItems')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-[4px] transition-colors ${
                        activeTab === 'lineItems'
                          ? 'bg-[#336699] text-white'
                          : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                      }`}
                    >
                      Line Items
                    </button>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="p-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={`Search ${activeTab === 'products' ? 'products' : 'line items'}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                    />
                  </div>
                  
                  {activeTab === 'lineItems' && (
                    <div className="flex gap-1 overflow-x-auto">
                      {types.map(type => (
                        <button
                          key={type}
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
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#336699]"></div>
                    </div>
                  ) : activeTab === 'products' ? (
                    filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {searchTerm ? 'No products found' : (
                          <div>
                            <p className="mb-2">No products available</p>
                            <p className="text-xs">Create products in the Products section first</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {sortedCollectionNames.map(collectionName => (
                          <div key={collectionName}>
                            {/* Collection Header */}
                            <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                              <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                {collectionName} ({groupedProducts[collectionName].length})
                              </h4>
                            </div>
                            
                            {/* Collection Products */}
                            <div className="divide-y divide-[#2A2A2A]">
                              {groupedProducts[collectionName].map(product => (
                                <div
                                  key={product.id}
                                  className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                                  onClick={() => addProduct(product)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white truncate">{product.name}</div>
                                      {product.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                                      )}
                                      {product.items && product.items.length > 0 && (
                                        <div className="text-xs text-[#336699] mt-0.5">
                                          Contains {product.items.length} items
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right ml-3 flex-shrink-0">
                                      <div className="font-mono text-sm text-white">
                                        {formatCurrency(product.price)}
                                      </div>
                                      <div className="text-xs text-gray-400">/{product.unit}</div>
                                      <div className="text-xs text-[#336699] opacity-0 group-hover:opacity-100 transition-opacity">
                                        + Add
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
                    filteredLineItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {searchTerm ? 'No items found' : (
                          <div>
                            <p className="mb-2">No line items available</p>
                            <p className="text-xs">Create products in the Products section first</p>
                          </div>
                        )}
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
                              {groupedLineItems[tradeName].map(item => (
                                <div
                                  key={item.id}
                                  className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                                  onClick={() => addLineItem(item)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white truncate">{item.name}</div>
                                      {item.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                                      )}
                                    </div>
                                    <div className="text-right ml-3 flex-shrink-0">
                                      <div className="font-mono text-sm text-white">
                                        {formatCurrency(item.price)}
                                      </div>
                                      <div className="text-xs text-gray-400">/{item.unit}</div>
                                      <div className="text-xs text-[#336699] opacity-0 group-hover:opacity-100 transition-opacity">
                                        + Add
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
                  )}
                </div>
              </>
            )}

            {/* Template Selection */}
            {sourceType === 'template' && (
              <>
                <div className="p-3">
                  {/* Back button */}
                  <button
                    onClick={() => setSourceType(null)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Back to options
                  </button>
                  
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                    />
                  </div>

                  {/* Category notice if filtered */}
                  {projectCategory && (
                    <div className="mb-3 p-2 bg-[#336699]/10 border border-[#336699]/30 rounded-[4px]">
                      <p className="text-xs text-[#336699]">
                        Showing templates for this project's category
                      </p>
                    </div>
                  )}

                  {/* Templates List */}
                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#336699]"></div>
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {searchTerm ? 'No templates found' : projectCategory ? 'No templates for this project category' : 'No templates available'}
                      </div>
                    ) : (
                      filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-3 bg-[#333333] hover:bg-[#404040] border rounded-[4px] cursor-pointer transition-all ${
                            addedTemplateId === template.id ? 'border-[#388E3C] bg-[#388E3C]/10' : 'border-[#555555]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">{template.name}</h4>
                              {template.description && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{template.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  {template.items?.length || 0} items
                                </span>
                                <span className="text-xs text-[#336699] font-mono">
                                  {formatCurrency(template.total_amount)}
                                </span>
                              </div>
                            </div>
                            {addedTemplateId === template.id ? (
                              <Check className="w-4 h-4 text-[#388E3C] flex-shrink-0 mt-0.5" />
                            ) : (
                              <Plus className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Progress Billing Interface */}
            {sourceType === 'progress' && (
              <>
                {!selectedMilestone ? (
                  // Milestone Selection Phase
                  <div className="p-3">
                    {/* Back button */}
                    <button
                      onClick={() => setSourceType(null)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Back to options
                    </button>

                    {/* Progress Billing Header */}
                    <div className="mb-4 p-3 bg-[#F9D71C]/10 border border-[#F9D71C]/30 rounded-[4px]">
                      <h3 className="text-sm font-semibold text-[#F9D71C] mb-1">Milestone Billing</h3>
                      <p className="text-xs text-gray-400">Select work items, then apply milestone percentage</p>
                    </div>

                    {/* Milestone Templates */}
                    <div className="space-y-2 mb-4">
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Milestone Type
                      </label>
                      
                      {[
                        { name: 'Project Start', percentage: 25, description: 'Initial payment to begin work' },
                        { name: 'Materials Delivered', percentage: 25, description: 'Payment upon material delivery' },
                        { name: 'Rough-In Complete', percentage: 25, description: 'Payment at rough-in completion' },
                        { name: 'Project Completion', percentage: 25, description: 'Final payment upon completion' },
                        { name: 'Mid-Project', percentage: 50, description: '50% progress payment' },
                        { name: 'Custom Milestone', percentage: milestonePercentage, description: 'Set your own percentage' }
                      ].map((milestone) => (
                        <button
                          key={milestone.name}
                          onClick={() => {
                            setSelectedMilestone(milestone.name);
                            setMilestonePercentage(milestone.percentage);
                          }}
                          className="w-full p-3 text-left rounded-[4px] border bg-[#333333] border-[#555555] text-gray-300 hover:bg-[#404040] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{milestone.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{milestone.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-[#F9D71C]">{milestone.percentage}%</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Percentage Input */}
                    {selectedMilestone === 'Custom Milestone' && (
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                          Custom Percentage
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={milestonePercentage}
                            onChange={(e) => setMilestonePercentage(Number(e.target.value))}
                            className="flex-1 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white focus:outline-none focus:border-[#F9D71C]"
                          />
                          <span className="text-sm text-gray-400">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Product Selection Phase - More Space for Items
                  <>
                    {/* Compact Milestone Header */}
                    <div className="p-3 pb-0">
                      <button
                        onClick={() => setSelectedMilestone('')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Change milestone
                      </button>
                      
                      <div className="flex items-center justify-between p-2 bg-[#F9D71C]/10 border border-[#F9D71C]/30 rounded-[4px] mb-3">
                        <span className="text-sm font-medium text-white">{selectedMilestone}</span>
                        <span className="text-lg font-bold text-[#F9D71C]">{milestonePercentage}%</span>
                      </div>
                    </div>

                    {/* Custom Percentage Input */}
                    {selectedMilestone === 'Custom Milestone' && (
                      <div className="px-3 mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={milestonePercentage}
                            onChange={(e) => setMilestonePercentage(Number(e.target.value))}
                            className="flex-1 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white focus:outline-none focus:border-[#F9D71C]"
                          />
                          <span className="text-sm text-gray-400">%</span>
                        </div>
                      </div>
                    )}

                    {/* Tabs */}
                    <div className="p-3 pt-0 pb-0">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setActiveTab('products')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-[4px] transition-colors ${
                            activeTab === 'products'
                              ? 'bg-[#336699] text-white'
                              : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                          }`}
                        >
                          Products
                        </button>
                        <button
                          onClick={() => setActiveTab('lineItems')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-[4px] transition-colors ${
                            activeTab === 'lineItems'
                              ? 'bg-[#336699] text-white'
                              : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                          }`}
                        >
                          Line Items
                        </button>
                      </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-3 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Search ${activeTab === 'products' ? 'products' : 'line items'}...`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                        />
                      </div>
                      
                      {activeTab === 'lineItems' && (
                        <div className="flex gap-1 overflow-x-auto">
                          {types.map(type => (
                            <button
                              key={type}
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
                    </div>

                    {/* Items List - Now Gets More Space */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#336699]"></div>
                        </div>
                      ) : activeTab === 'products' ? (
                        filteredProducts.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            {searchTerm ? 'No products found' : (
                              <div>
                                <p className="mb-2">No products available</p>
                                <p className="text-xs">Create products in the Products section first</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {sortedCollectionNames.map(collectionName => (
                              <div key={collectionName}>
                                {/* Collection Header */}
                                <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                                  <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                    {collectionName} ({groupedProducts[collectionName].length})
                                  </h4>
                                </div>
                                
                                {/* Collection Products */}
                                <div className="divide-y divide-[#2A2A2A]">
                                  {groupedProducts[collectionName].map(product => (
                                    <div
                                      key={product.id}
                                      className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                                      onClick={() => addProduct(product)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm text-white truncate">{product.name}</div>
                                          {product.description && (
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                                          )}
                                          {product.items && product.items.length > 0 && (
                                            <div className="text-xs text-[#336699] mt-0.5">
                                              Contains {product.items.length} items
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-right ml-3 flex-shrink-0">
                                          <div className="font-mono text-sm text-white">
                                            {formatCurrency(product.price)}
                                          </div>
                                          <div className="text-xs text-gray-400">/{product.unit}</div>
                                          <div className="text-xs text-[#336699] opacity-0 group-hover:opacity-100 transition-opacity">
                                            + Add
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
                        filteredLineItems.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            {searchTerm ? 'No items found' : (
                              <div>
                                <p className="mb-2">No line items available</p>
                                <p className="text-xs">Create products in the Products section first</p>
                              </div>
                            )}
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
                                  {groupedLineItems[tradeName].map(item => (
                                    <div
                                      key={item.id}
                                      className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                                      onClick={() => addLineItem(item)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm text-white truncate">{item.name}</div>
                                          {item.description && (
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                                          )}
                                        </div>
                                        <div className="text-right ml-3 flex-shrink-0">
                                          <div className="font-mono text-sm text-white">
                                            {formatCurrency(item.price)}
                                          </div>
                                          <div className="text-xs text-gray-400">/{item.unit}</div>
                                          <div className="text-xs text-[#336699] opacity-0 group-hover:opacity-100 transition-opacity">
                                            + Add
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
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Column - Invoice Details (60% width) */}
          <div className="flex-1 flex flex-col">
            {/* Invoice Info Section */}
            <div className="p-4 border-b border-[#333333]">
              {/* Professional Invoice Number Header */}
              <div className="mb-4 p-3 bg-[#336699]/10 border border-[#336699]/30 rounded-[4px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Invoice Number</div>
                    <div className="text-lg font-mono font-bold text-[#336699] mt-1">
                      {invoiceNumber || (editingInvoice?.invoice_number) || 'Generating...'}
                    </div>
                  </div>
                  {!editingInvoice && (
                    <button
                      onClick={generateInvoiceNumber}
                      className="text-xs text-[#336699] hover:text-white transition-colors"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Client *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      setSelectedClient(e.target.value);
                      // Reset project when client changes
                      if (e.target.value !== selectedClient) {
                        setSelectedProject('');
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    <option value="">No project (standalone invoice)</option>
                    {projects
                      .filter(project => !selectedClient || project.client_id === selectedClient)
                      .map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                  {selectedClient && projects.filter(p => p.client_id === selectedClient).length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No projects found for this client</p>
                  )}
                  {projects.length === 0 && (
                    <p className="text-xs text-yellow-500 mt-1">No projects in system. Create a project first to associate invoices.</p>
                  )}
                </div>
                
                <div className="col-span-2">
                  <textarea
                    value={invoiceDescription}
                    onChange={(e) => setInvoiceDescription(e.target.value)}
                    placeholder="Invoice description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Due Date
                    <span className="ml-2 text-xs text-[#F9D71C] normal-case">(Auto-calculated from payment terms)</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
              </div>
            </div>

            {/* Selected Items Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  {sourceType === 'progress' ? 'Milestone Details' : `Invoice Items (${selectedItems.length})`}
                </h3>
                {selectedItems.length > 0 && sourceType !== 'progress' && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {sourceType === 'progress' ? (
                // Progress Billing Display
                <div className="space-y-3">
                  {selectedMilestone && (
                    <div className="p-4 bg-[#1E1E1E] rounded-[4px] border border-[#F9D71C]/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">{selectedMilestone}</span>
                        <span className="text-lg font-bold text-[#F9D71C]">{milestonePercentage}%</span>
                      </div>
                      
                      {selectedItems.length > 0 ? (
                        <>
                          {/* Selected Items for this Milestone */}
                          <div className="space-y-2 mb-3">
                            {selectedItems.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 bg-[#333333] rounded-[4px]">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-white truncate">{item.product_name || 'Unknown Item'}</div>
                                  {item.description && (
                                    <div className="text-xs text-gray-400 truncate">{item.description}</div>
                                  )}
                                  <div className="text-xs text-gray-400">
                                    {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center bg-[#555555] hover:bg-[#666666] rounded-[2px] transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                                    className="w-12 text-center px-1 py-1 bg-[#555555] border border-[#666666] rounded-[2px] text-white text-sm"
                                  />
                                  <button
                                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center bg-[#555555] hover:bg-[#666666] rounded-[2px] transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeItem(index)}
                                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors ml-1"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Milestone Calculation Breakdown */}
                          <div className="space-y-2 text-xs border-t border-[#333333] pt-3">
                            <div className="flex justify-between text-gray-400">
                              <span>Work Items Subtotal:</span>
                              <span className="font-mono">{formatCurrency(calculateTotal())}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Milestone Percentage:</span>
                              <span>{milestonePercentage}%</span>
                            </div>
                            <div className="border-t border-[#555555] pt-2 flex justify-between font-semibold">
                              <span className="text-white">Invoice Amount:</span>
                              <span className="font-mono text-[#F9D71C]">
                                {formatCurrency(calculateDisplayTotal())}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          Select work items from the left to include in this milestone
                        </div>
                      )}
                    </div>
                  ) || (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Select a milestone type from the left to get started
                    </div>
                  )}
                </div>
              ) : (
                // Regular Invoice Items Display
                <>
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      {!sourceType ? 'Select a method to add items' : 'Click items on the left to add them'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-[#1E1E1E] rounded-[4px]">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{item.product_name || 'Unknown Item'}</div>
                            {item.description && (
                              <div className="text-xs text-gray-400 truncate">{item.description}</div>
                            )}
                            <div className="text-xs text-gray-400">
                              {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, Number(e.target.value))}
                              className="w-12 text-center px-1 py-1 bg-[#333333] border border-[#555555] rounded-[2px] text-white text-sm"
                            />
                            <button
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(index)}
                              className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Total Summary - Fixed at bottom */}
            <div className="border-t border-[#333333] p-4 bg-[#1E1E1E]">
              <div className="space-y-2">
                {/* Payment Terms & Due Date Info */}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Payment Terms</span>
                  <span>{paymentTerms}</span>
                </div>
                {dueDate && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Due Date</span>
                    <span>{new Date(dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Divider */}
                <div className="border-t border-[#333333] my-2"></div>
                
                {/* Total Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Amount</span>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-white">{formatCurrency(calculateDisplayTotal())}</div>
                    <div className="text-xs text-gray-400">
                      {sourceType === 'progress' 
                        ? `${milestonePercentage}% milestone` 
                        : `${selectedItems.length} items`}
                    </div>
                  </div>
                </div>
                
                {/* Professional Note */}
                {calculateDisplayTotal() > 0 && (
                  <div className="text-xs text-[#336699] text-center mt-3 p-2 bg-[#336699]/10 rounded-[4px]">
                    {sourceType === 'progress' 
                      ? 'Professional milestone invoice ready to send'
                      : 'Professional invoice ready to send'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 