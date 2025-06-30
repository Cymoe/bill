import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Shield, 
  ChevronDown,
  Package,
  Hash,
  FileText,
  ClipboardCheck,
  Edit2,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { ServiceOptionUnitDisplay } from './ServiceOptionUnitDisplay';
import { supabase } from '../../lib/supabase';
import { ServiceCatalogService } from '../../services/ServiceCatalogService';
import { CustomizeServiceDrawer } from './CustomizeServiceDrawer';

interface ServiceTemplate {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  service_id?: string;
  estimated_hours?: number;
  warranty_months?: number;
  material_quality?: 'economy' | 'standard' | 'premium' | 'luxury';
  materials_list?: string[];
  skill_level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  user_id?: string;
  is_taxable?: boolean;
  permit_required?: boolean;
  requires_inspection?: boolean;
  minimum_quantity?: number;
  maximum_quantity?: number;
  attributes?: {
    energy_star?: boolean;
    code_compliance?: boolean;
    [key: string]: unknown;
  };
  service_option_items?: Array<{
    id: string;
    quantity: number;
    calculation_type?: 'multiply' | 'fixed' | 'per_unit';
    coverage_amount?: number;
    coverage_unit?: string;
    line_item?: {
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
    };
  }>;
  organization_id?: string;
}

interface ServiceQuickRowProps {
  template: ServiceTemplate;
  onQuantityChange: (templateId: string, quantity: number) => void;
  onAddToCart: (template: ServiceTemplate, quantity: number) => void;
  isCondensed?: boolean;
  cartQuantity?: number;
  isHighlighted?: boolean;
  onCustomized?: () => void;
  organizationId?: string;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'labor': return 'text-blue-400';
    case 'material': return 'text-green-400';
    case 'equipment': return 'text-amber-400';
    case 'service': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

export const ServiceQuickRow: React.FC<ServiceQuickRowProps> = ({
  template,
  onQuantityChange,
  onAddToCart,
  isCondensed = false,
  cartQuantity = 0,
  isHighlighted = false,
  onCustomized,
  organizationId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [alternativeItems, setAlternativeItems] = useState<Record<string, any[]>>({});
  const [showCustomizeDrawer, setShowCustomizeDrawer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEditingItemId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = () => {
    const newQuantity = cartQuantity === 0 ? (template.minimum_quantity || 1) : cartQuantity + 1;
    
    // Check maximum constraint
    if (template.maximum_quantity && newQuantity > template.maximum_quantity) {
      // Could show a toast here
      console.warn(`Maximum quantity is ${template.maximum_quantity} ${template.unit}`);
      return;
    }
    
    if (cartQuantity === 0) {
      onAddToCart(template, newQuantity);
    } else {
      onQuantityChange(template.id, newQuantity);
    }
  };

  const handleRemove = () => {
    if (cartQuantity > 0) {
      const newQuantity = cartQuantity - 1;
      
      // Check if going below minimum
      if (template.minimum_quantity && newQuantity > 0 && newQuantity < template.minimum_quantity) {
        // Remove entirely rather than having invalid quantity
        onQuantityChange(template.id, 0);
      } else {
        onQuantityChange(template.id, newQuantity);
      }
    }
  };

  const handleEditItem = async (itemId: string, costCodeId: string) => {
    if (editingItemId === itemId) {
      setEditingItemId(null);
      return;
    }

    setEditingItemId(itemId);
    
    // Fetch alternative line items with the same cost code
    if (!alternativeItems[itemId]) {
      const { data, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('cost_code_id', costCodeId)
        .neq('id', itemId)
        .order('price', { ascending: true });
      
      if (!error && data) {
        setAlternativeItems(prev => ({
          ...prev,
          [itemId]: data
        }));
      }
    }
  };

  const handleSelectAlternative = async (originalItemId: string, newItemId: string) => {
    // Find which service option item this is
    const soiToSwap = template.service_option_items?.find(soi => soi.line_item?.id === originalItemId);
    if (!soiToSwap || !template.organization_id) {
      console.error('Cannot customize - missing data');
      return;
    }

    try {
      // Build the swapped items map
      const swappedItems = {
        [soiToSwap.id]: newItemId
      };

      // Call the customization API
      const customized = await ServiceCatalogService.customizeOption(
        template.id,
        template.organization_id,
        { swappedItems }
      );

      console.log('Customization saved:', customized);
      setEditingItemId(null);
      
      // Call the refresh callback if provided
      if (onCustomized) {
        onCustomized();
      }
    } catch (error) {
      console.error('Error customizing option:', error);
    }
  };

  const getQualityLabel = (quality?: string) => {
    switch (quality) {
      case 'economy': return 'Econ';
      case 'standard': return 'Std';
      case 'premium': return 'Prem';
      case 'luxury': return 'Lux';
      default: return '';
    }
  };


  return (
    <>
      <div
        className={`grid grid-cols-12 gap-4 px-6 ${isCondensed ? 'py-2' : 'py-3'} items-center transition-all group ${
          isHighlighted ? 'bg-[#336699]/10 border-l-2 border-[#336699]' : 'hover:bg-[#1A1A1A]/50'
        }`}
      >
        {/* Service Name & Description - 8 columns */}
        <div 
          className="col-span-8 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`font-medium text-gray-100 ${isCondensed ? 'text-sm' : ''}`}>
                      {template.name}
                    </div>
                    {template.attributes?.parent_option_id && (
                      <span className="text-xs text-[#336699]">• Customized</span>
                    )}
                    {template.material_quality && (
                      <span className="text-xs text-gray-500">
                        {getQualityLabel(template.material_quality)}
                      </span>
                    )}
                    {/* Simple summary - show key info only when present */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {template.estimated_hours && (
                        <span title={`Estimated time: ${template.estimated_hours} hours`}>
                          {template.estimated_hours}h
                        </span>
                      )}
                      {template.warranty_months && (
                        <span title={`${template.warranty_months} month warranty`}>
                          {template.warranty_months}mo warranty
                        </span>
                      )}
                      {(template.permit_required || template.requires_inspection) && (
                        <span className="text-amber-500">
                          {template.permit_required && template.requires_inspection ? 'Permit + Inspection' : 
                           template.permit_required ? 'Permit' : 'Inspection'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Description appears below when expanded, no space when collapsed */}
                {isExpanded && template.description && (
                  <div className="text-xs text-gray-400 mt-1 animate-in fade-in duration-200">
                    {template.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price - 2 columns */}
        <div className="col-span-2 text-right">
          <div>
            <span className={`font-mono font-semibold ${isCondensed ? 'text-sm' : 'text-base'} text-gray-100`}>
              {formatCurrency(template.price)}
            </span>
            <span className="text-xs text-gray-500 ml-1">/{template.unit}</span>
          </div>
        </div>

        {/* Action Controls - 2 columns */}
        <div className="col-span-2 flex justify-end">
          {cartQuantity === 0 ? (
            <div className="inline-flex items-center gap-1 bg-[#1A1A1A] rounded-md p-0.5 border border-[#333333]">
              {/* Customize button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCustomizeDrawer(true);
                }}
                className="w-7 h-7 bg-[#252525] hover:bg-[#333333] active:bg-[#404040] text-gray-400 hover:text-[#336699] rounded flex items-center justify-center transition-all duration-150"
                title="Customize package"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              {/* Add button */}
              <button
                onClick={handleAdd}
                className="w-7 h-7 bg-[#336699] hover:bg-[#4477aa] active:bg-[#225588] text-white rounded flex items-center justify-center transition-all duration-150"
              >
                <span className="text-lg leading-none font-light">+</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-[#1A1A1A] rounded-md p-0.5 border border-[#333333]">
              <button
                onClick={handleRemove}
                className="w-7 h-7 bg-[#252525] hover:bg-[#404040] active:bg-[#333333] text-gray-400 hover:text-white rounded flex items-center justify-center transition-all duration-150 hover:scale-105"
              >
                <span className="text-lg leading-none font-light">−</span>
              </button>
              <span className="font-medium text-gray-100 min-w-[2rem] text-center tabular-nums">
                {cartQuantity}
              </span>
              <button
                onClick={handleAdd}
                className={`w-7 h-7 rounded flex items-center justify-center transition-all duration-150 ${
                  template.maximum_quantity && cartQuantity >= template.maximum_quantity
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#336699] hover:bg-[#4477aa] active:bg-[#225588] text-white hover:scale-105'
                }`}
                disabled={template.maximum_quantity ? cartQuantity >= template.maximum_quantity : false}
                title={template.maximum_quantity && cartQuantity >= template.maximum_quantity ? `Maximum ${template.maximum_quantity} ${template.unit}` : undefined}
              >
                <span className="text-lg leading-none font-light">+</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Expansion */}
      {isExpanded && template.service_option_items && template.service_option_items.length > 0 && (
        <div className="px-6 py-4 bg-[#1A1A1A]/50 border-l-2 border-[#336699]/20 ml-6">
          <div className="ml-6">
            {/* Line items breakdown */}
            <div className="space-y-2">
              {(() => {
                // Group items by category
                const itemsByCategory = template.service_option_items.reduce((acc, soi) => {
                  const category = soi.line_item?.cost_code?.category || 'uncategorized';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(soi);
                  return acc;
                }, {} as Record<string, typeof template.service_option_items>);
                
                // Define category display order and labels
                const categoryOrder = ['labor', 'material', 'equipment', 'service'];
                const categoryLabels: Record<string, string> = {
                  labor: 'Labor',
                  material: 'Materials',
                  equipment: 'Equipment',
                  service: 'Services'
                };
                
                // Get categorized items first, then uncategorized
                const categorizedItems = categoryOrder
                  .filter(category => itemsByCategory[category])
                  .map(category => (
                    <div key={category}>
                      <h5 className={`text-xs font-medium mb-1.5 ${getCategoryColor(category)}`}>
                        {categoryLabels[category]}
                      </h5>
                      <div className="space-y-1.5 ml-3">
                        {itemsByCategory[category].map((soi) => {
                          const lineItem = soi.line_item;
                          const costCode = lineItem?.cost_code;
                          const calcType = soi.calculation_type || 'multiply';
                          const serviceQuantity = cartQuantity || 1;
                          
                          // Calculate the actual quantity used and display
                          let actualQuantity = soi.quantity;
                          let quantityDisplay = '';
                          let pricePerUnit = 0;
                          
                          // Check if we have coverage data
                          if (soi.coverage_amount && soi.coverage_unit) {
                            // Coverage-based calculation
                            pricePerUnit = (lineItem?.price || 0) / soi.coverage_amount;
                            
                            if (soi.coverage_unit === 'sqft_per_gallon') {
                              quantityDisplay = `1 ${lineItem?.unit} per ${soi.coverage_amount} sqft`;
                            } else if (soi.coverage_unit === 'sqft_per_each') {
                              quantityDisplay = `1 per ${soi.coverage_amount} sqft`;
                            } else {
                              quantityDisplay = `${soi.coverage_amount} ${soi.coverage_unit}`;
                            }
                          } else if (calcType === 'per_unit') {
                            // Handle null quantities
                            if (soi.quantity === null || soi.quantity === undefined) {
                              quantityDisplay = '(coverage data missing)';
                              pricePerUnit = 0;
                            } else {
                              actualQuantity = soi.quantity * serviceQuantity;
                              pricePerUnit = (lineItem?.price || 0) * soi.quantity;
                              
                              // Simplified display for labor
                              if (lineItem?.unit === 'hour') {
                                const minutes = Math.round(soi.quantity * 60);
                                if (minutes < 1) {
                                  // Show per 100 units for clarity
                                  const scaledMinutes = Math.round(soi.quantity * 6000);
                                  quantityDisplay = `${scaledMinutes} min per 100 ${template.unit}`;
                                } else {
                                  quantityDisplay = `${minutes} min per ${template.unit}`;
                                }
                              } else {
                                // Simple quantity display
                                quantityDisplay = `${soi.quantity} ${lineItem?.unit} per ${template.unit}`;
                              }
                            }
                          } else if (calcType === 'fixed') {
                            // Simple display for fixed items
                            if (lineItem?.unit === 'hour') {
                              const hours = soi.quantity;
                              const minutes = hours * 60;
                              quantityDisplay = minutes >= 60 ? 
                                `${hours}h total` : 
                                `${Math.round(minutes)}min total`;
                            } else {
                              quantityDisplay = `${soi.quantity} ${lineItem?.unit} total`;
                            }
                            pricePerUnit = 0; // Fixed items don't have per-unit cost
                          } else { // multiply type
                            actualQuantity = soi.quantity * serviceQuantity;
                            pricePerUnit = (lineItem?.price || 0) * soi.quantity;
                            
                            // Simple display for materials
                            if (lineItem?.unit === template.unit && soi.quantity !== 1) {
                              // Same unit = show as waste percentage
                              const wastePercent = Math.round((soi.quantity - 1) * 100);
                              quantityDisplay = `+${wastePercent}% waste`;
                            } else {
                              quantityDisplay = `${soi.quantity} ${lineItem?.unit} per ${template.unit}`;
                            }
                          }
                          
                          const totalPrice = soi.coverage_amount ? 
                            pricePerUnit * serviceQuantity : 
                            actualQuantity * (lineItem?.price || 0);
                          
                          return (
                            <div key={soi.id} className="relative">
                              <div className="flex items-center justify-between text-sm group">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500 text-xs">•</span>
                                  <span className="text-gray-300">{lineItem?.name}</span>
                                  {quantityDisplay && quantityDisplay !== '(coverage data missing)' && (
                                    <span className="text-gray-500 text-xs">
                                      {quantityDisplay}
                                    </span>
                                  )}
                                  {/* Edit button - shows on hover */}
                                  <button 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleEditItem(soi.id, lineItem?.cost_code_id || '')}
                                    title="Quick swap alternative"
                                  >
                                    <Edit2 className="w-3 h-3 text-gray-500 hover:text-[#336699]" />
                                  </button>
                                </div>
                                <div className="text-gray-400 font-mono text-sm">
                                  {calcType === 'fixed' ? 
                                    `${formatCurrency(totalPrice)}/${template.unit}` :
                                    pricePerUnit > 0 ? 
                                      `${formatCurrency(pricePerUnit)}/${template.unit}` : 
                                      formatCurrency(totalPrice)
                                  }
                                </div>
                              </div>
                              
                              {/* Alternative items dropdown */}
                              {editingItemId === soi.id && alternativeItems[soi.id] && (
                                <div ref={dropdownRef} className="absolute left-8 top-6 z-10 bg-[#1A1A1A] border-2 border-[#336699] rounded-md shadow-xl shadow-black/50 p-1 min-w-[250px]">
                                  <div className="text-xs text-[#336699] font-medium px-2 py-1.5 border-b border-[#333333] mb-1">Select alternative:</div>
                                  {alternativeItems[soi.id].map(alt => (
                                    <button
                                      key={alt.id}
                                      onClick={() => handleSelectAlternative(lineItem?.id, alt.id)}
                                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-[#336699]/20 rounded flex items-center justify-between transition-colors"
                                    >
                                      <span className="text-gray-200">{alt.name}</span>
                                      <span className="text-gray-300 font-mono text-xs">{formatCurrency(alt.price)}</span>
                                    </button>
                                  ))}
                                  {alternativeItems[soi.id].length === 0 && (
                                    <div className="text-xs text-gray-500 px-2 py-2">No alternatives available</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                
                // Handle uncategorized items (if any)
                const uncategorizedItems = itemsByCategory['uncategorized'] ? (
                  <div key="uncategorized" className="mt-4">
                    <div className="space-y-1.5">
                      {itemsByCategory['uncategorized'].map((soi) => {
                        const lineItem = soi.line_item;
                        const costCode = lineItem?.cost_code;
                        const calcType = soi.calculation_type || 'multiply';
                        const serviceQuantity = cartQuantity || 1;
                        
                        // Calculate the actual quantity used and display
                        let actualQuantity = soi.quantity;
                        let quantityDisplay = '';
                        let pricePerUnit = 0;
                        
                        // Check if we have coverage data
                        if (soi.coverage_amount && soi.coverage_unit) {
                          // Coverage-based calculation
                          pricePerUnit = (lineItem?.price || 0) / soi.coverage_amount;
                          
                          if (soi.coverage_unit === 'sqft_per_gallon') {
                            quantityDisplay = `(1 ${lineItem?.unit} per ${soi.coverage_amount} sqft)`;
                          } else if (soi.coverage_unit === 'sqft_per_each') {
                            quantityDisplay = `(1 per ${soi.coverage_amount} sqft)`;
                          } else {
                            quantityDisplay = `(${soi.coverage_amount} ${soi.coverage_unit})`;
                          }
                        } else if (calcType === 'per_unit') {
                          // Handle null quantities
                          if (soi.quantity === null || soi.quantity === undefined) {
                            quantityDisplay = '(coverage data missing)';
                            pricePerUnit = 0;
                          } else {
                            actualQuantity = soi.quantity * serviceQuantity;
                            pricePerUnit = (lineItem?.price || 0) * soi.quantity;
                            
                            // Simplified display for labor
                            if (lineItem?.unit === 'hour') {
                              const minutes = Math.round(soi.quantity * 60);
                              if (minutes < 1) {
                                // Show per 100 units for clarity
                                const scaledMinutes = Math.round(soi.quantity * 6000);
                                quantityDisplay = `${scaledMinutes} min per 100 ${template.unit}`;
                              } else {
                                quantityDisplay = `${minutes} min per ${template.unit}`;
                              }
                            } else {
                              // Simple quantity display
                              quantityDisplay = `${soi.quantity} ${lineItem?.unit} per ${template.unit}`;
                            }
                          }
                        } else if (calcType === 'fixed') {
                          // Smart display for fixed items
                          if (lineItem?.unit === 'hour') {
                            const hours = soi.quantity;
                            const minutes = hours * 60;
                            quantityDisplay = minutes >= 60 ? 
                              `(${hours}h job total)` : 
                              `(${Math.round(minutes)}min job total)`;
                          } else {
                            quantityDisplay = `(${soi.quantity} ${lineItem?.unit} total)`;
                          }
                          pricePerUnit = 0; // Fixed items don't have per-unit cost
                        } else { // multiply type
                          actualQuantity = soi.quantity * serviceQuantity;
                          pricePerUnit = (lineItem?.price || 0) * soi.quantity;
                          
                          // Smart display for materials
                          if (lineItem?.unit === template.unit && soi.quantity !== 1) {
                            // Same unit = show as waste percentage
                            const wastePercent = Math.round((soi.quantity - 1) * 100);
                            quantityDisplay = `(+${wastePercent}% included)`;
                          } else if (soi.quantity < 0.1) {
                            // For small quantities, show per larger unit
                            const scale = Math.round(1 / soi.quantity);
                            quantityDisplay = `(1 ${lineItem?.unit} per ${scale} ${template.unit})`;
                          } else {
                            quantityDisplay = `(${soi.quantity} ${lineItem?.unit}/${template.unit})`;
                          }
                        }
                        
                        const totalPrice = soi.coverage_amount ? 
                          pricePerUnit * serviceQuantity : 
                          actualQuantity * (lineItem?.price || 0);
                        
                        return (
                          <div key={soi.id} className="relative">
                            <div className="flex items-center justify-between text-sm group">
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs">•</span>
                                <span className="text-gray-300">{lineItem?.name}</span>
                                {quantityDisplay && quantityDisplay !== '(coverage data missing)' && (
                                  <span className="text-gray-500 text-xs">
                                    {quantityDisplay}
                                  </span>
                                )}
                                {/* Edit button - shows on hover */}
                                <button 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleEditItem(soi.id, lineItem?.cost_code_id || '')}
                                  title="Quick swap alternative"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-500 hover:text-[#336699]" />
                                </button>
                              </div>
                              <div className="text-gray-400 font-mono text-sm">
                                {calcType === 'fixed' ? 
                                  `${formatCurrency(totalPrice)}/${template.unit}` :
                                  pricePerUnit > 0 ? 
                                    `${formatCurrency(pricePerUnit)}/${template.unit}` : 
                                    formatCurrency(totalPrice)
                              }
                              </div>
                            </div>
                            
                            {/* Alternative items dropdown */}
                            {editingItemId === soi.id && alternativeItems[soi.id] && (
                              <div ref={dropdownRef} className="absolute left-8 top-6 z-10 bg-[#1A1A1A] border-2 border-[#336699] rounded-md shadow-xl shadow-black/50 p-1 min-w-[250px]">
                                <div className="text-xs text-[#336699] font-medium px-2 py-1.5 border-b border-[#333333] mb-1">Select alternative:</div>
                                {alternativeItems[soi.id].map(alt => (
                                  <button
                                    key={alt.id}
                                    onClick={() => handleSelectAlternative(lineItem?.id, alt.id)}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-[#336699]/20 rounded flex items-center justify-between transition-colors"
                                  >
                                    <span className="text-gray-200">{alt.name}</span>
                                    <span className="text-gray-300 font-mono text-xs">{formatCurrency(alt.price)}</span>
                                  </button>
                                ))}
                                {alternativeItems[soi.id].length === 0 && (
                                  <div className="text-xs text-gray-500 px-2 py-2">No alternatives available</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
                
                return [...categorizedItems, uncategorizedItems];
              })()}
            </div>
            
            {/* Constraints and Additional Info */}
            <div className="mt-3 pt-3 border-t border-[#333333]/50 space-y-3">
              {/* Quantity Constraints */}
              {(template.minimum_quantity || template.maximum_quantity) && (
                <div className="flex items-center gap-4 text-xs">
                  {template.minimum_quantity && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">Min Order:</span> {template.minimum_quantity} {template.unit}
                    </div>
                  )}
                  {template.maximum_quantity && (
                    <div className="text-gray-400">
                      <span className="text-gray-500">Max Order:</span> {template.maximum_quantity} {template.unit}
                    </div>
                  )}
                </div>
              )}
              
              {/* Additional Attributes */}
              {template.attributes && Object.keys(template.attributes).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {template.attributes.energy_star && (
                    <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded">
                      Energy Star
                    </span>
                  )}
                  {template.attributes.code_compliance && (
                    <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">
                      Code Compliant
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customize Service Drawer */}
      {organizationId && (
        <CustomizeServiceDrawer
          isOpen={showCustomizeDrawer}
          onClose={() => setShowCustomizeDrawer(false)}
          serviceOption={template}
          organizationId={organizationId}
          onSave={() => {
            setShowCustomizeDrawer(false);
            if (onCustomized) {
              onCustomized();
            }
          }}
        />
      )}
    </>
  );
};