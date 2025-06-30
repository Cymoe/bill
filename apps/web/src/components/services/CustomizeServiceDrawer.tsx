import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Package, 
  Plus,
  Minus,
  Trash2,
  Search,
  Check,
  RefreshCw,
  Save,
  Calculator,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { ServiceCatalogService } from '../../services/ServiceCatalogService';

interface ServiceOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  service_id?: string;
  service_option_items?: ServiceOptionItem[];
  organization_id?: string;
  attributes?: any;
}

interface ServiceOptionItem {
  id: string;
  quantity: number;
  calculation_type?: 'multiply' | 'fixed' | 'per_unit';
  coverage_amount?: number;
  coverage_unit?: string;
  line_item?: LineItem;
}

interface LineItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  cost_code_id?: string;
  cost_code?: {
    code: string;
    name: string;
    category: string;
  };
}

interface CustomizeServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOption: ServiceOption;
  organizationId: string;
  onSave: () => void;
}

// Get relevant cost codes based on service name
const getRelevantCostCodes = (serviceName: string): string[] => {
  const lowerName = serviceName.toLowerCase();
  
  // For now, let's be more permissive and just return empty array
  // This will show all items but won't apply the "recommended" filtering
  // We'll update this once we see what cost codes actually exist
  return [];
};

export const CustomizeServiceDrawer: React.FC<CustomizeServiceDrawerProps> = ({
  isOpen,
  onClose,
  serviceOption,
  organizationId,
  onSave
}) => {
  const [currentItems, setCurrentItems] = useState<ServiceOptionItem[]>([]);
  const [availableItems, setAvailableItems] = useState<LineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  // Initialize current items when drawer opens
  useEffect(() => {
    if (isOpen && serviceOption.service_option_items) {
      setCurrentItems([...serviceOption.service_option_items]);
      loadAvailableItems();
    }
  }, [isOpen, serviceOption, organizationId]);

  // Load available line items
  const loadAvailableItems = async () => {
    setIsLoading(true);
    console.log('Loading items for service option:', serviceOption);
    console.log('Organization ID:', organizationId);
    
    try {
      let industryId: string | null = null;
      
      // Get industry_id from service or organization
      if (serviceOption.service_id) {
        const { data: service } = await supabase
          .from('services')
          .select('industry_id')
          .eq('id', serviceOption.service_id)
          .single();
        
        industryId = service?.industry_id;
        console.log('Found industry from service:', industryId);
      } else {
        console.log('No service_id, checking organization...');
        const { data: org } = await supabase
          .from('organizations')
          .select('industry_id')
          .eq('id', organizationId)
          .single();
          
        industryId = org?.industry_id;
        console.log('Found industry from organization:', industryId);
      }
      
      if (!industryId) {
        console.error('No industry_id found');
        setAvailableItems([]);
        return;
      }
      
      // Get cost codes for this industry
      const { data: costCodes, error: costCodeError } = await supabase
        .from('cost_codes')
        .select('id')
        .eq('industry_id', industryId)
        .is('organization_id', null); // System cost codes only
      
      console.log('Cost codes found:', costCodes?.length);
      if (costCodeError) console.error('Cost code error:', costCodeError);
      
      if (!costCodes || costCodes.length === 0) {
        console.error('No cost codes found for industry:', industryId);
        setAvailableItems([]);
        return;
      }
      
      const costCodeIds = costCodes.map(cc => cc.id);
      
      // Get line items for these cost codes
      const { data: items, error: itemsError } = await supabase
        .from('line_items')
        .select(`
          *,
          cost_code:cost_codes(code, name, category)
        `)
        .in('cost_code_id', costCodeIds)
        .is('organization_id', null) // System line items only for now
        .order('name');

      console.log('Available items loaded:', items?.length);
      if (itemsError) console.error('Items error:', itemsError);
      
      if (items && items.length > 0) {
        console.log('Sample items:', items.slice(0, 3));
        console.log('Cost codes in items:', [...new Set(items.map(i => i.cost_code?.name).filter(Boolean))]);
      }
      
      setAvailableItems(items || []);
    } catch (error) {
      console.error('Error loading available items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get relevant cost codes for the current service
  const relevantCostCodes = useMemo(() => {
    return getRelevantCostCodes(serviceOption.name);
  }, [serviceOption.name]);

  // Filter available items
  const filteredItems = useMemo(() => {
    let items = availableItems;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.cost_code?.name?.toLowerCase().includes(query) ||
        item.cost_code?.code?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.cost_code?.category === selectedCategory);
    }

    return items;
  }, [availableItems, searchQuery, selectedCategory]);

  // Split into recommended and other for display purposes
  const { recommendedItems, otherItems } = useMemo(() => {
    if (relevantCostCodes.length === 0 || showAllItems) {
      // If no relevant codes defined or showing all, don't split
      return { recommendedItems: filteredItems, otherItems: [] };
    }
    
    const recommended = filteredItems.filter(item => 
      relevantCostCodes.includes(item.cost_code?.name || '')
    );
    const others = filteredItems.filter(item => 
      !relevantCostCodes.includes(item.cost_code?.name || '')
    );

    return { recommendedItems: recommended, otherItems: others };
  }, [filteredItems, relevantCostCodes, showAllItems]);

  // Add item to service
  const handleAddItem = (lineItem: LineItem) => {
    const newItem: ServiceOptionItem = {
      id: `temp-${Date.now()}`,
      quantity: 1,
      calculation_type: 'multiply',
      line_item: lineItem
    };
    setCurrentItems([...currentItems, newItem]);
  };

  // Remove item from service
  const handleRemoveItem = (itemId: string) => {
    setCurrentItems(currentItems.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const handleQuantityChange = (itemId: string, quantity: number) => {
    setCurrentItems(currentItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  // Update calculation type
  const handleCalcTypeChange = (itemId: string, calcType: 'multiply' | 'fixed' | 'per_unit') => {
    setCurrentItems(currentItems.map(item => 
      item.id === itemId ? { ...item, calculation_type: calcType } : item
    ));
  };

  // Calculate total price
  const calculatePrice = () => {
    return currentItems.reduce((total, item) => {
      const basePrice = item.line_item?.price || 0;
      
      switch (item.calculation_type) {
        case 'fixed':
          return total + basePrice;
        case 'per_unit':
          return total + (basePrice * item.quantity);
        default: // multiply
          return total + (basePrice * item.quantity);
      }
    }, 0);
  };

  // Save customization
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build customization data
      const swappedItems: Record<string, string> = {};
      const removedItems: string[] = [];
      const addedItems: Array<{ line_item_id: string; quantity: number; calculation_type: string }> = [];

      // Find swapped items (items that replaced original ones)
      const originalItemIds = new Set(serviceOption.service_option_items?.map(soi => soi.line_item?.id) || []);
      const currentItemIds = new Set(currentItems.map(ci => ci.line_item?.id));

      // Find removed items
      serviceOption.service_option_items?.forEach(soi => {
        if (soi.line_item && !currentItemIds.has(soi.line_item.id)) {
          removedItems.push(soi.id);
        }
      });

      // Find added items
      currentItems.forEach(ci => {
        if (ci.line_item && !originalItemIds.has(ci.line_item.id)) {
          addedItems.push({
            line_item_id: ci.line_item.id,
            quantity: ci.quantity,
            calculation_type: ci.calculation_type || 'multiply'
          });
        }
      });

      // Call the customization API
      await ServiceCatalogService.customizeOption(
        serviceOption.id,
        organizationId,
        {
          swappedItems,
          removedItems,
          addedItems,
          priceOverride: calculatePrice()
        }
      );

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving customization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    if (serviceOption.service_option_items) {
      setCurrentItems([...serviceOption.service_option_items]);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(availableItems.map(item => item.cost_code?.category).filter(Boolean));
    return Array.from(cats);
  }, [availableItems]);


  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 h-screen w-[600px] bg-[#1A1A1A] border-l border-[#333333] shadow-2xl z-[10000] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Customize Service Option</h2>
            <p className="text-sm text-gray-400">{serviceOption.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Price Summary */}
        <div className="flex items-center justify-between bg-[#252525] rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Total Price:</span>
          </div>
          <div className="text-right">
            <span className="font-mono font-semibold text-white">
              {formatCurrency(calculatePrice())}
            </span>
            <span className="text-xs text-gray-500 ml-1">/{serviceOption.unit}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Current Items */}
        <div className="w-1/2 border-r border-[#333333] flex flex-col">
          <div className="p-4 border-b border-[#333333]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Current Items</h3>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs text-gray-400 hover:text-[#336699] transition-colors flex items-center gap-1"
              >
                <span>{showAdvancedOptions ? 'Hide' : 'Show'} advanced options</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {currentItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No items in this service package
              </p>
            ) : (
              currentItems.map((item) => (
                <div key={item.id} className="group bg-[#252525] rounded-md p-3 mb-2 hover:bg-[#2A2A2A] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{item.line_item?.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.line_item?.cost_code?.name} • {formatCurrency(item.line_item?.price || 0)}/{item.line_item?.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quantity and Calc Type */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, Math.max(0.1, item.quantity - 0.1))}
                        className="p-1 bg-[#333333] hover:bg-[#404040] rounded text-gray-400 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-[#333333] border border-[#444444] rounded text-sm text-white text-center focus:border-[#336699] focus:outline-none"
                        step="0.1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 0.1)}
                        className="p-1 bg-[#333333] hover:bg-[#404040] rounded text-gray-400 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {showAdvancedOptions ? (
                      <select
                        value={item.calculation_type}
                        onChange={(e) => handleCalcTypeChange(item.id, e.target.value as any)}
                        className="flex-1 px-2 py-1 bg-[#333333] border border-[#444444] rounded text-sm text-white"
                      >
                        <option value="multiply">Per {serviceOption.unit}</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="per_unit">Per Unit</option>
                      </select>
                    ) : (
                      <div className="flex-1 px-2 py-1 text-sm text-gray-400">
                        {item.calculation_type === 'fixed' ? 'Fixed Amount' : 
                         item.calculation_type === 'per_unit' ? 'Per Unit' : 
                         `Per ${serviceOption.unit}`}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Items */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-[#333333]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-300">Available Items</h3>
                {availableItems.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-[#252525] text-gray-400 rounded">
                    {filteredItems.length} of {availableItems.length}
                  </span>
                )}
              </div>
              {/* Temporarily removed the show all button until we fix the filtering */}
            </div>
            
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-sm text-white placeholder-gray-500"
              />
            </div>
            
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#252525] border border-[#333333] rounded-md text-sm text-white hover:border-[#444444] focus:border-[#336699] focus:outline-none focus:ring-1 focus:ring-[#336699]/20 transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat?.charAt(0).toUpperCase() + cat?.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {isLoading ? (
              <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No items found
              </p>
            ) : (
              <>
                {filteredItems.map((item) => {
                  const isAlreadyIncluded = currentItems.some(ci => ci.line_item?.id === item.id);
                  
                  return (
                    <div 
                      key={item.id}
                      className={`group bg-[#1F1F1F] rounded p-2 mb-1 hover:bg-[#252525] transition-all cursor-pointer ${
                        isAlreadyIncluded ? 'opacity-50' : ''
                      }`}
                      onClick={() => handleAddItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-white truncate">{item.name}</p>
                            {isAlreadyIncluded && (
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            <span className="font-mono text-gray-600">{item.cost_code?.code}</span> • {item.cost_code?.name} • {formatCurrency(item.price)}/{item.unit}
                          </p>
                        </div>
                        <Plus className="w-3 h-3 text-[#336699] opacity-50 group-hover:opacity-100 ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#333333] flex items-center justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#252525] hover:bg-[#333333] text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#336699] hover:bg-[#4477aa] text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Customization'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};