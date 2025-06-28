import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Minus, X, Save, FileText, Package, ArrowRight, CheckCircle, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { getCollectionLabel } from '../../constants/collections';
import { EstimateService } from '../../services/EstimateService';
import { ServiceCatalogService } from '../../services/ServiceCatalogService';

interface EstimateItem {
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  description?: string;
  unit?: string;
  is_service?: boolean;
  service_items?: any[];
  line_item_count?: number;
  service_data?: any;
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
  discount_percentage?: number;
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

interface EstimateFormData {
  client_id: string;
  project_id?: string;
  items: EstimateItem[];
  total_amount: number;
  description: string;
  valid_until: string;
  status: string;
  issue_date: string;
  title?: string;
  terms?: string;
  notes?: string;
  subtotal?: number;
  discount_percentage?: number;
  discount_amount?: number;
  additional_discount_percentage?: number;
  additional_discount_amount?: number;
  discount_reason?: string;
}

interface CreateEstimateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstimateFormData) => void;
  editingEstimate?: any; // Estimate being edited
  projectContext?: {
    projectId: string;
    clientId: string;
    projectName: string;
    projectBudget: number;
  };
  preloadedItems?: EstimateItem[]; // Pre-populated items from cart
}

export const CreateEstimateDrawer: React.FC<CreateEstimateDrawerProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEstimate,
  projectContext,
  preloadedItems
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [sourceType, setSourceType] = useState<'scratch' | 'template' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'lineItems'>('services');
  const [activeType, setActiveType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectCategory, setProjectCategory] = useState<string | null>(null);
  
  // Form data
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [estimateTitle, setEstimateTitle] = useState('');
  const [estimateDescription, setEstimateDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [selectedItems, setSelectedItems] = useState<EstimateItem[]>([]);
  const [estimateNumber, setEstimateNumber] = useState('');
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validity period in days
  const [validityDays, setValidityDays] = useState(30);
  
  // Estimate-level discount
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  
  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    console.log('CreateEstimateDrawer useEffect triggered:', {
      isOpen,
      userId: user?.id,
      selectedOrgId: selectedOrg.id,
      selectedOrg: selectedOrg,
      projectCategory,
      editingEstimate: !!editingEstimate
    });
    
    if (isOpen && user && selectedOrg.id && selectedOrg.name !== 'Loading...') {
      loadData();
    }
  }, [isOpen, user?.id, selectedOrg.id, projectCategory, editingEstimate]);

  // Load estimate data when editing - but only after data is loaded
  useEffect(() => {
    if (isOpen && editingEstimate && projects.length > 0) {
      console.log('Setting form data from editing estimate:', {
        estimateId: editingEstimate.id,
        projectId: editingEstimate.project_id,
        availableProjects: projects.length
      });
      
      // Set form data from existing estimate
      setSelectedClient(editingEstimate.client_id || '');
      setSelectedProject(editingEstimate.project_id || '');
      setEstimateTitle(editingEstimate.title || '');
      setEstimateDescription(editingEstimate.description || '');
      setIssueDate(editingEstimate.issue_date ? editingEstimate.issue_date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setValidUntil(editingEstimate.valid_until ? editingEstimate.valid_until.split('T')[0] : '');
      setTerms(editingEstimate.terms || '');
      setNotes(editingEstimate.notes || '');
      setAdditionalDiscount(editingEstimate.additional_discount_percentage || 0);
      setDiscountReason(editingEstimate.discount_reason || '');
      
      // Load estimate items
      loadEstimateItems();
    }
  }, [isOpen, editingEstimate, projects.length]);

  // Handle project context
  useEffect(() => {
    if (isOpen && projectContext && !editingEstimate) {
      // Pre-fill with project information
      if (projectContext.clientId) {
        setSelectedClient(projectContext.clientId);
      }
      if (projectContext.projectId) {
        setSelectedProject(projectContext.projectId);
      }
      if (projectContext.projectName) {
        setEstimateTitle(`Estimate for ${projectContext.projectName}`);
      }
      // Set source type to scratch to show the items selection
      setSourceType('scratch');
    }
  }, [isOpen, projectContext, editingEstimate]);

  // Handle preloaded items from cart
  useEffect(() => {
    if (isOpen && preloadedItems && preloadedItems.length > 0 && !editingEstimate) {
      console.log('Loading preloaded items:', preloadedItems);
      // Process preloaded items to ensure service packages have the correct metadata
      const processedItems = preloadedItems.map(item => {
        if (item.service_data && item.service_data.service_option_items) {
          // This is a service package
          return {
            ...item,
            is_service: true,
            service_items: item.service_data.service_option_items,
            line_item_count: item.service_data.service_option_items?.length || 0
          };
        }
        return item;
      });
      setSelectedItems(processedItems);
      setSourceType('scratch'); // Use scratch mode when we have preloaded items
    }
  }, [isOpen, preloadedItems, editingEstimate]);

  // Load project category when project context is provided
  useEffect(() => {
    if (isOpen && projectContext?.projectId && user && selectedOrg.id) {
      loadProjectCategory();
    }
  }, [isOpen, projectContext?.projectId, user, selectedOrg.id]);

  // Auto-calculate validity date based on days
  useEffect(() => {
    if (issueDate && validityDays) {
      const issue = new Date(issueDate);
      const valid = new Date(issue);
      valid.setDate(valid.getDate() + validityDays);
      setValidUntil(valid.toISOString().split('T')[0]);
    }
  }, [issueDate, validityDays]);

  // Generate estimate number when opening
  useEffect(() => {
    if (isOpen && !editingEstimate && !estimateNumber) {
      generateEstimateNumber();
    }
  }, [isOpen, editingEstimate]);

  const generateEstimateNumber = async () => {
    // Professional fallback: Use current year and timestamp
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const timestamp = Date.now().toString().slice(-6);
    const generatedNumber = `EST-${currentYear}-${timestamp}`;
    
    setEstimateNumber(generatedNumber);
  };

  const loadEstimateItems = async () => {
    if (!editingEstimate || !user) return;
    
    try {
      const { data: items, error } = await supabase
        .from('estimate_items')
        .select('*, product:products(*)')
        .eq('estimate_id', editingEstimate.id);
        
      if (error) throw error;
      
      const estimateItems: EstimateItem[] = (items || []).map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.price || item.unit_price || item.product?.price || 0,
        unit: item.product?.unit || 'ea',
        description: item.description || item.product?.description
      }));
      
      setSelectedItems(estimateItems);
      setSourceType('scratch'); // Default to scratch mode when editing
    } catch (error) {
      console.error('Error loading estimate items:', error);
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
      
      // Get organization ID - fallback to localStorage if context not ready
      let orgId = selectedOrg.id;
      if (!orgId || selectedOrg.name === 'Loading...') {
        orgId = localStorage.getItem('selectedOrgId') || '';
        console.log('Using fallback organization ID from localStorage:', orgId);
      }
      
      if (!orgId) {
        console.error('No organization ID available');
        setIsLoading(false);
        return;
      }
      
      // Build base queries array
      const queries = [
        supabase.from('clients').select('*').eq('organization_id', orgId),
        supabase.from('projects').select('*').eq('organization_id', orgId).order('name'),
        // Get all line items (both org-specific and shared)
        supabase.from('line_items')
          .select('*, cost_code:cost_codes(code, name, category)')
          .or(`organization_id.eq.${orgId},organization_id.is.null`),
        supabase.from('trades')
          .select('id, name')
          .order('name')
      ];

      // Note: We'll use invoice templates for now until estimate templates are created
      let templateQuery = supabase.from('invoice_templates')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });
      
      // If we have a project category, filter templates by it
      if (projectCategory) {
        templateQuery = templateQuery.eq('category_id', projectCategory);
      }
      
      // Execute all queries
      const [clientsRes, projectsRes, lineItemsRes, tradesRes] = await Promise.all(queries);
      const templatesRes = await templateQuery;

      if (clientsRes.error) throw clientsRes.error;
      if (projectsRes.error) throw projectsRes.error;
      if (lineItemsRes.error) throw lineItemsRes.error;
      if (tradesRes.error) console.error('Trades error:', tradesRes.error);
      if (templatesRes.error) console.error('Templates error:', templatesRes.error);
      
      // Load service templates using ServiceCatalogService
      let servicesData: any[] = [];
      try {
        servicesData = await ServiceCatalogService.listTemplates(orgId);
        console.log('Loaded services:', servicesData.length);
      } catch (error) {
        console.error('Error loading services:', error);
      }
      
      // Process line items - convert to Product format for compatibility
      const allLineItems = (lineItemsRes.data || []).map((item: any) => ({
        ...item,
        price: item.base_price || 0,
        unit: item.unit || 'ea',
        trade_id: item.trade_id || null,
        // Add category from cost code
        type: item.cost_code?.category || 'material'
      }));
      
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
      
      setClients(clientsRes.data || []);
      setProjects(projectsRes.data as Project[] || []);
      setServices(servicesData);
      setLineItems(allLineItems as Product[]);
      setTemplates(processedTemplates);
      setTrades(tradesRes.data || []);
      
      // Debug logging
      console.log('CreateEstimateDrawer - Data loaded:', {
        organizationId: orgId,
        clients: clientsRes.data?.length || 0,
        projects: projectsRes.data?.length || 0,
        projectsData: projectsRes.data,
        services: servicesData.length,
        lineItems: allLineItems.length,
        templates: processedTemplates.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    // Add template items to existing items
    if (template.items) {
      const newItems: EstimateItem[] = template.items.map(item => {
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

  const addService = (service: any) => {
    // Add service as a single item with metadata about line items
    setSelectedItems([...selectedItems, {
      product_id: service.id,
      product_name: service.name,
      quantity: 1,
      price: service.price || 0,
      unit: service.unit || 'ea',
      description: service.service_name || service.description || '',
      // Store line items for display purposes
      is_service: true,
      service_items: service.service_option_items,
      line_item_count: service.service_option_items?.length || 0
    }]);
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

  const toggleItemExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getClientDiscount = () => {
    if (!selectedClient) return 0;
    const client = clients.find(c => c.id === selectedClient);
    return client?.discount_percentage || 0;
  };

  const calculateCustomerDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercentage = getClientDiscount();
    return subtotal * (discountPercentage / 100);
  };

  const calculateAdditionalDiscount = () => {
    const subtotal = calculateSubtotal();
    const customerDiscount = calculateCustomerDiscount();
    // Apply additional discount to the already discounted amount
    const afterCustomerDiscount = subtotal - customerDiscount;
    return afterCustomerDiscount * (additionalDiscount / 100);
  };

  const calculateTotalDiscount = () => {
    return calculateCustomerDiscount() + calculateAdditionalDiscount();
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const totalDiscount = calculateTotalDiscount();
    return subtotal - totalDiscount;
  };

  const handleSave = async () => {
    if (!selectedClient) {
      alert('Please select a client for the estimate.');
      return;
    }

    if (!estimateTitle) {
      alert('Please provide a title for the estimate.');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Please add at least one item to the estimate.');
      return;
    }

    if (!validUntil) {
      alert('Please set a validity date for the estimate.');
      return;
    }

    const formData: EstimateFormData = {
      client_id: selectedClient,
      project_id: selectedProject || undefined,
      items: selectedItems,
      total_amount: calculateTotal(),
      title: estimateTitle,
      description: estimateDescription,
      valid_until: validUntil,
      status: 'draft',
      issue_date: issueDate,
      terms: terms,
      notes: notes,
      // Include discount information
      subtotal: calculateSubtotal(),
      discount_percentage: getClientDiscount(),
      discount_amount: calculateCustomerDiscount(),
      additional_discount_percentage: additionalDiscount,
      additional_discount_amount: calculateAdditionalDiscount(),
      discount_reason: discountReason
    };

    // Enhanced data with estimate number
    const enhancedFormData = {
      ...formData,
      estimate_number: estimateNumber || `EST-${Date.now().toString().slice(-6)}`,
      validity_days: validityDays,
      // Add professional metadata
      created_via: 'professional_drawer',
      template_used: sourceType === 'template'
    };

    setIsSaving(true);
    try {
      console.log('Saving enhanced estimate:', enhancedFormData);
      await onSave(enhancedFormData);
      handleClose();
    } catch (error) {
      console.error('Error saving estimate:', error);
      alert('Failed to save estimate. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSourceType(null);
    setSelectedClient('');
    setSelectedProject('');
    setEstimateTitle('');
    setEstimateDescription('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setValidUntil('');
    setSelectedItems([]);
    setSearchTerm('');
    setActiveTab('services');
    setActiveType('all');
    setAddedTemplateId(null);
    setEstimateNumber('');
    setTerms('');
    setNotes('');
    setValidityDays(30);
    setAdditionalDiscount(0);
    setDiscountReason('');
    
    onClose();
  };

  // Filter logic
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Group services by industry
  const groupedServices = filteredServices.reduce((groups: any, service: any) => {
    const industryName = service.industry_name || 'Uncategorized';
    if (!groups[industryName]) {
      groups[industryName] = [];
    }
    groups[industryName].push(service);
    return groups;
  }, {} as Record<string, any[]>);

  // Sort industry names alphabetically
  const sortedIndustryNames = Object.keys(groupedServices).sort();

  // Group line items by category (from cost code)
  const groupedLineItems = filteredLineItems.reduce((groups, item) => {
    const category = item.type || 'Other';
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(item);
    return groups;
  }, {} as Record<string, Product[]>);

  // Sort category names alphabetically
  const sortedCategoryNames = Object.keys(groupedLineItems).sort();

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
              <h1 className="text-lg font-semibold">{editingEstimate ? 'Edit Estimate' : 'Create Estimate'}</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!selectedClient || !estimateTitle || selectedItems.length === 0 || isSaving}
              className="px-4 py-1.5 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              <Save className="w-3 h-3" />
              {isSaving ? (editingEstimate ? 'Updating...' : 'Creating...') : (editingEstimate ? 'Update & Send' : 'Create & Get Paid')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-60px)]">
          {/* Left Column - Items Selection (40% width) */}
          <div className="w-[40%] border-r border-[#333333] flex flex-col">
            {/* Source Type Selection */}
            {!sourceType && !editingEstimate && (
              <div className="p-4 border-b border-[#333333]">
                <p className="text-sm text-gray-400 mb-3">Choose how to create your estimate:</p>
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
                          <div className="text-xs text-gray-400">Build your estimate item by item</div>
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
                </div>
              </div>
            )}

            {/* Items Selection */}
            {(sourceType === 'scratch' || editingEstimate) && (
              <>
                {/* Back to options button */}
                {!editingEstimate && (
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
                      onClick={() => setActiveTab('services')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-[4px] transition-colors ${
                        activeTab === 'services'
                          ? 'bg-[#336699] text-white'
                          : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                      }`}
                    >
                      Services
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
                      placeholder={`Search ${activeTab === 'services' ? 'services' : 'line items'}...`}
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
                  ) : activeTab === 'services' ? (
                    filteredServices.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {searchTerm ? 'No services found' : (
                          <div>
                            <p className="mb-2">No services available</p>
                            <p className="text-xs">Services will appear here as they are configured</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {sortedIndustryNames.map(industryName => (
                          <div key={industryName}>
                            {/* Industry Header */}
                            <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                              <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                {industryName} ({groupedServices[industryName].length})
                              </h4>
                            </div>
                            
                            {/* Industry Services */}
                            <div className="divide-y divide-[#2A2A2A]">
                              {groupedServices[industryName].map((service: any) => (
                                <div
                                  key={service.id}
                                  className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                                  onClick={() => addService(service)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white truncate">
                                        {service.name}
                                        {service.line_item_count > 0 && (
                                          <span className="ml-2 text-xs text-[#336699] font-normal">
                                            ({service.line_item_count} items)
                                          </span>
                                        )}
                                      </div>
                                      {service.service_name && (
                                        <p className="text-xs text-[#336699] mt-0.5 truncate">{service.service_name}</p>
                                      )}
                                      {service.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{service.description}</p>
                                      )}
                                    </div>
                                    <div className="text-right ml-3 flex-shrink-0">
                                      <div className="font-mono text-sm text-white">
                                        {formatCurrency(service.price || 0)}
                                      </div>
                                      <div className="text-xs text-gray-400">/{service.unit || 'ea'}</div>
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
                        {sortedCategoryNames.map(categoryName => (
                          <div key={categoryName}>
                            {/* Category Header */}
                            <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                              <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                {categoryName} ({groupedLineItems[categoryName].length})
                              </h4>
                            </div>
                            
                            {/* Category Items */}
                            <div className="divide-y divide-[#2A2A2A]">
                              {groupedLineItems[categoryName].map(item => (
                                <div
                                  key={item.id}
                                  className="px-3 py-2 bg-[#333333] hover:bg-[#404040] cursor-pointer transition-colors group"
                                  onClick={() => addLineItem(item)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white truncate">
                                        {item.name}
                                        {item.cost_code && (
                                          <span className="ml-2 text-xs text-gray-500">[{item.cost_code.code}]</span>
                                        )}
                                      </div>
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
          </div>

          {/* Right Column - Estimate Details (60% width) */}
          <div className="flex-1 flex flex-col">
            {/* Compact Estimate Info Section */}
            <div className="p-4 border-b border-[#333333] overflow-y-auto" style={{ maxHeight: '40%' }}>
              {/* Estimate Number and Title Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={estimateTitle}
                    onChange={(e) => setEstimateTitle(e.target.value)}
                    placeholder="Estimate Title *"
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#336699]/10 border border-[#336699]/30 rounded-[4px]">
                  <span className="text-xs text-gray-400">EST#</span>
                  <span className="text-sm font-mono font-bold text-[#336699]">
                    {estimateNumber?.split('-').slice(-1)[0] || '...'}
                  </span>
                </div>
              </div>

              {/* Two Column Layout for Essential Fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* Client and Project */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Client *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      setSelectedClient(e.target.value);
                      if (e.target.value !== selectedClient) {
                        setSelectedProject('');
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.discount_percentage && client.discount_percentage > 0 ? `(${client.discount_percentage}% discount)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    <option value="">No project</option>
                    {projects
                      .filter(project => !selectedClient || project.client_id === selectedClient)
                      .map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Valid For
                  </label>
                  <select
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
              </div>

              {/* Collapsible Additional Fields */}
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-white transition-colors mb-2">
                  Additional Details (Description, Terms, Notes, Discounts)
                </summary>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <textarea
                      value={estimateDescription}
                      onChange={(e) => setEstimateDescription(e.target.value)}
                      placeholder="Brief description of work..."
                      rows={2}
                      className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder="Payment terms, warranties..."
                      rows={2}
                      className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional information..."
                      rows={2}
                      className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                    />
                  </div>

                  {/* Additional Discount Section */}
                  <div className="border-t border-[#333333] pt-3">
                    <h4 className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-2">
                      Additional Discount
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Discount %
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={additionalDiscount}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                              setAdditionalDiscount(value);
                            }}
                            className="w-full px-3 py-1.5 pr-8 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] font-mono"
                            min="0"
                            max="100"
                            step="0.5"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Reason
                        </label>
                        <select
                          value={discountReason}
                          onChange={(e) => setDiscountReason(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                        >
                          <option value="">No reason</option>
                          <option value="seasonal">Seasonal Promotion</option>
                          <option value="volume">Volume Discount</option>
                          <option value="referral">Referral Discount</option>
                          <option value="first_time">First Time Customer</option>
                          <option value="loyalty">Loyalty Discount</option>
                          <option value="competitive">Competitive Pricing</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    {additionalDiscount > 0 && (
                      <p className="mt-2 text-xs text-purple-400">
                        Additional discount of {formatCurrency(calculateAdditionalDiscount())} will be applied
                      </p>
                    )}
                  </div>
                </div>
              </details>
            </div>

            {/* Selected Items Section - Now with proper flex growth and scrolling */}
            <div className="flex-1 min-h-0 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-300">
                  Estimate Items ({selectedItems.length})
                </h3>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Scrollable items container */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {!sourceType ? 'Select a method to add items' : 'Click items on the left to add them'}
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {selectedItems.map((item, index) => {
                      const isExpanded = expandedItems.has(index);
                      return (
                        <div 
                          key={index} 
                          className={`rounded-[4px] p-3 ${
                            item.is_service 
                              ? 'bg-[#1A2332] border border-[#336699]/20' 
                              : 'bg-[#1E1E1E]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Expand/collapse button for services */}
                            {item.is_service && item.service_items?.length > 0 && (
                              <button
                                onClick={() => toggleItemExpanded(index)}
                                className="mt-0.5 p-0.5 hover:bg-[#333333] rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            )}
                            
                            {/* Product info section - better width management */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {item.is_service && (
                                  <Package className="w-4 h-4 text-[#336699]" />
                                )}
                                <div className="text-sm text-white font-medium">
                                  {item.product_name || 'Unknown Item'}
                                  {item.is_service && item.line_item_count > 0 && (
                                    <span className="ml-2 text-xs text-[#336699] font-normal">
                                      ({item.line_item_count} items)
                                    </span>
                                  )}
                                </div>
                              </div>
                              {item.is_service && (
                                <div className="text-xs text-[#336699] mb-1">Service Package</div>
                              )}
                              {item.description && (
                                <div className="text-xs text-gray-400 mb-2 line-clamp-2">
                                  {item.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                {formatCurrency(item.price)} × {item.quantity} = 
                                <span className="text-[#388E3C] font-medium ml-1">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Quantity controls - stacked vertically for space */}
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
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
                                className="w-12 text-center px-1 py-1 bg-[#333333] border border-[#555555] rounded-[2px] text-white text-sm font-medium"
                              />
                              <button
                                onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(index)}
                              className="w-full py-1 text-xs text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                          
                        {/* Expanded content for services */}
                        {item.is_service && item.service_items?.length > 0 && isExpanded && (
                          <div className="mt-3 pl-7 border-l-2 border-[#336699]/20">
                            <div className="text-xs text-gray-400 mb-2">Included items:</div>
                            <div className="space-y-2">
                              {item.service_items.map((serviceItem: any, idx: number) => {
                                const lineItem = serviceItem.line_item;
                                if (!lineItem) return null;
                                return (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex-1">
                                      <span className="text-gray-300">{lineItem.name}</span>
                                      {lineItem.cost_code && (
                                        <span className="ml-2 text-gray-500">[{lineItem.cost_code.code}]</span>
                                      )}
                                    </div>
                                    <div className="text-gray-400">
                                      {serviceItem.quantity} × {formatCurrency(lineItem.price)} = {formatCurrency(serviceItem.quantity * lineItem.price)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-2 pt-2 border-t border-[#333333] text-xs text-gray-500">
                              Note: Service items cannot be edited individually
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Total Summary - Compact and fixed at bottom */}
            <div className="border-t border-[#333333] px-4 py-3 bg-[#1E1E1E] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Valid for {validityDays} days</span>
                  {validUntil && (
                    <span>Until {new Date(validUntil).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="text-right">
                  {/* Show subtotal and discounts if applicable */}
                  {(getClientDiscount() > 0 || additionalDiscount > 0) && (
                    <div className="space-y-1 mb-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-400">Subtotal:</span>
                        <span className="font-mono text-sm text-gray-300">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {getClientDiscount() > 0 && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-purple-400">Good Customer Discount ({getClientDiscount()}%):</span>
                          <span className="font-mono text-sm text-purple-400">-{formatCurrency(calculateCustomerDiscount())}</span>
                        </div>
                      )}
                      {additionalDiscount > 0 && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-orange-400">
                            Additional Discount ({additionalDiscount}%{discountReason ? ` - ${discountReason.replace('_', ' ')}` : ''}):
                          </span>
                          <span className="font-mono text-sm text-orange-400">-{formatCurrency(calculateAdditionalDiscount())}</span>
                        </div>
                      )}
                      {(getClientDiscount() > 0 || additionalDiscount > 0) && (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#333333]">
                          <span className="text-xs text-gray-400">They're Saving:</span>
                          <span className="font-mono text-sm text-green-400">-{formatCurrency(calculateTotalDiscount())}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="font-mono text-lg font-bold text-white">{formatCurrency(calculateTotal())}</div>
                  <div className="text-xs text-gray-400">{selectedItems.length} items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};