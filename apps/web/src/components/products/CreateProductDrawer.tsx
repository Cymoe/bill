import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductService } from '../../services/ProductService';
import { CostCodeService } from '../../services/CostCodeService';
import { LineItemService } from '../../services/LineItemService';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Minus, X, Save } from 'lucide-react';
import { PRODUCT_COLLECTIONS } from '../../constants/collections';
import { SERVICE_TYPES } from '../../constants/serviceTypes';
import { advancedSearch, SearchableField } from '../../utils/searchUtils';
import { OrganizationContext } from '../layouts/DashboardLayout';

interface LineItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
  cost_code_id?: string;
}

interface CostCode {
  id: string;
  name: string;
  code: string;
}

interface SelectedLineItem extends LineItem {
  quantity: number;
}

interface CreateProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedItemIds?: string[];
}

export const CreateProductDrawer: React.FC<CreateProductDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedItemIds = []
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [category, setCategory] = useState('');
  const [serviceType, setServiceType] = useState('service_call');
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [selectedLineItems, setSelectedLineItems] = useState<SelectedLineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productPrice, setProductPrice] = useState(0);
  const [generateVariants, setGenerateVariants] = useState(true);

  useEffect(() => {
    if (isOpen && selectedOrg?.id) {
      fetchLineItems();
      fetchCostCodes();
    }
  }, [isOpen, selectedOrg?.id]);

  // Handle pre-selected items
  useEffect(() => {
    if (isOpen && preSelectedItemIds.length > 0 && lineItems.length > 0) {
      const preSelectedItems = lineItems
        .filter(item => preSelectedItemIds.includes(item.id))
        .map(item => ({ ...item, quantity: 1 }));
      
      if (preSelectedItems.length > 0) {
        setSelectedLineItems(preSelectedItems);
        // Auto-calculate initial price based on selected items
        const totalCost = preSelectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const markup = markupPercentage / 100;
        setProductPrice(totalCost * (1 + markup));
      }
    }
  }, [isOpen, preSelectedItemIds, lineItems, markupPercentage]);

  const fetchCostCodes = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      // Use CostCodeService to get industry-filtered cost codes
      const costCodes = await CostCodeService.list(selectedOrg.id);
      setCostCodes(costCodes.map(cc => ({ id: cc.id, name: cc.name, code: cc.code })));
    } catch (error) {
      console.error('Error fetching cost codes:', error);
    }
  };

  const fetchLineItems = async () => {
    if (!selectedOrg?.id) {
      console.log('CreateProductDrawer: No organization ID, skipping fetch');
      return;
    }
    
    try {
      setIsLoading(true);
      // Use LineItemService to get properly filtered line items
      const data = await LineItemService.list(selectedOrg.id);
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = lineItems.filter(item => {
    // Advanced search filter
    if (searchTerm) {
      const searchableFields: SearchableField[] = [
        { 
          key: 'name', 
          weight: 2.0, // Higher weight for item names
          transform: (item) => item.name || ''
        },
        { 
          key: 'description', 
          weight: 1.5, // High weight for descriptions
          transform: (item) => item.description || ''
        },
        { 
          key: 'unit', 
          weight: 0.8,
          transform: (item) => item.unit || ''
        },
        { 
          key: 'price', 
          weight: 1.0,
          transform: (item) => formatCurrency(item.price || 0)
        }
      ];

      const searchResults = advancedSearch([item], searchTerm, searchableFields, {
        minScore: 0.2,
        requireAllTerms: false
      });

      return searchResults.length > 0;
    }
    return true;
  });

  // Group filtered items by cost code
  const groupedLineItems = filteredItems.reduce((groups, item) => {
    const costCode = costCodes.find(c => c.id === item.cost_code_id);
    const costCodeName = costCode?.name || 'Unassigned';
    
    if (!groups[costCodeName]) {
      groups[costCodeName] = [];
    }
    groups[costCodeName].push(item);
    
    return groups;
  }, {} as Record<string, LineItem[]>);

  // Sort cost code names alphabetically
  const sortedCostCodeNames = Object.keys(groupedLineItems).sort();

  const addLineItem = (item: LineItem) => {
    setSelectedLineItems([...selectedLineItems, { ...item, quantity: 1 }]);
  };

  const removeLineItem = (itemId: string) => {
    setSelectedLineItems(selectedLineItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    setSelectedLineItems(selectedLineItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const calculateSubtotal = () => {
    return selectedLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const markup = subtotal * (markupPercentage / 100);
    return subtotal + markup;
  };

  const handleSave = async () => {
    if (!productName.trim() || selectedLineItems.length === 0) return;

    try {
      setIsSaving(true);

      // Prepare line items for the service
      const lineItems = selectedLineItems.map(item => ({
        line_item_id: item.id,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price
      }));

      // Create the product bundle using ProductService
      const newProduct = await ProductService.create({
        user_id: user?.id,
        organization_id: selectedOrg.id,
        name: productName,
        description: productDescription,
        price: calculateTotal(),
        unit: 'project',
        type: 'service',
        is_base_product: true,
        category: category || null,
        service_type: serviceType,
        status: 'active',
        quality_tier: 'standard',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lineItems
      });

      // Generate variants if requested
      if (generateVariants && newProduct) {
        await supabase.rpc('generate_product_variants', {
          p_product_id: newProduct.id,
          p_basic_multiplier: 0.85,
          p_premium_multiplier: 1.25
        });
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setProductName('');
    setProductDescription('');
    setCategory('');
    setServiceType('service_call');
    setMarkupPercentage(0);
    setSelectedLineItems([]);
    setSearchTerm('');
    setActiveType('all');
    onClose();
  };

  const types = ['all', 'material', 'labor', 'equipment', 'service', 'subcontractor'];

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[80%] max-w-[1200px] bg-[#121212] shadow-xl transform transition-transform z-[9999] ${
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
              <h1 className="text-lg font-semibold">Create Product</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!productName.trim() || selectedLineItems.length === 0 || isSaving}
              className="px-4 py-1.5 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              <Save className="w-3 h-3" />
              {isSaving ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>

        {/* Main Content - Compact Layout */}
        <div className="flex h-[calc(100%-60px)]">
          {/* Left Column - Cost Code Items (40% width) */}
          <div className="w-[40%] border-r border-[#333333] flex flex-col">
            {/* Search and Filters */}
            <div className="p-3 border-b border-[#333333] space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cost code items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                />
              </div>
              
              {/* Type Filter Pills */}
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
            </div>

            {/* Line Items List - Compact */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {searchTerm ? 'No items found' : 'No items available'}
                </div>
              ) : (
                <div>
                  {sortedCostCodeNames.map(costCodeName => (
                    <div key={costCodeName}>
                      {/* Cost Code Header */}
                      <div className="sticky top-0 bg-[#336699]/20 backdrop-blur-sm border-b border-[#336699]/30 px-3 py-2 z-10">
                        <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                          {costCodeName} ({groupedLineItems[costCodeName].length})
                        </h4>
                      </div>
                      
                      {/* Cost Code Items */}
                      <div className="divide-y divide-[#333333]">
                        {groupedLineItems[costCodeName].map(item => (
                          <div
                            key={item.id}
                            className="px-3 py-2 hover:bg-[#1E1E1E] cursor-pointer transition-colors"
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
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Details (60% width) */}
          <div className="flex-1 flex flex-col">
            {/* Product Info Section */}
            <div className="p-4 border-b border-[#333333]">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Product Name *"
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
                <div className="col-span-2">
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    {SERVICE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Collection
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    {PRODUCT_COLLECTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Markup %
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                      min="0"
                      max="100"
                      placeholder="Markup %"
                      className="flex-1 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                    />
                    <span className="text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
              
              {/* Generate Variants Checkbox */}
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateVariants}
                    onChange={(e) => setGenerateVariants(e.target.checked)}
                    className="w-4 h-4 text-[#336699] bg-[#333333] border-[#555555] rounded focus:ring-[#336699] focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">
                    Auto-generate Basic & Premium variants
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Creates price tiers at 85% (Basic) and 125% (Premium)
                </p>
              </div>
            </div>

            {/* Selected Items Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  Selected Items ({selectedLineItems.length})
                </h3>
                {selectedLineItems.length > 0 && (
                  <button
                    onClick={() => setSelectedLineItems([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {selectedLineItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Click items on the left to add them
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedLineItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-[#1E1E1E] rounded-[4px]">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="w-12 text-center px-1 py-1 bg-[#333333] border border-[#555555] rounded-[2px] text-white text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary - Fixed at bottom */}
            <div className="border-t border-[#333333] p-4 bg-[#1E1E1E]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {markupPercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Markup ({markupPercentage}%)</span>
                    <span className="font-mono text-white">
                      {formatCurrency(calculateSubtotal() * (markupPercentage / 100))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#333333]">
                  <span className="text-white">Total</span>
                  <span className="font-mono text-white">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 