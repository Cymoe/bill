import React, { useState } from 'react';
import { 
  Clock, 
  Shield, 
  Star,
  DollarSign,
  Package,
  ChevronDown,
  Plus,
  Minus,
  Settings2,
  AlertCircle,
  Zap,
  CheckCircle,
  Wrench,
  Users,
  Award
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ServiceTemplate {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  estimated_hours?: number;
  warranty_months?: number;
  material_quality?: 'economy' | 'standard' | 'premium' | 'luxury';
  materials_list?: string[];
  skill_level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  attributes?: Record<string, any>;
  service_option_items?: Array<{
    id: string;
    quantity: number;
    line_item?: {
      id: string;
      name: string;
      price: number;
      unit: string;
    };
  }>;
}

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description?: string;
    category: string;
    icon?: string;
    templates?: ServiceTemplate[];
    min_price?: number;
    max_price?: number;
  };
  onAddToCart: (template: ServiceTemplate, quantity: number) => void;
  onCustomizePricing?: (template: ServiceTemplate) => void;
  hasCustomPricing?: boolean;
  organizationId?: string;
  onCompareToggle?: (serviceId: string, checked: boolean) => void;
  isComparing?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'installation': return <Wrench className="w-5 h-5" />;
    case 'repair': return <Settings2 className="w-5 h-5" />;
    case 'maintenance': return <Shield className="w-5 h-5" />;
    case 'inspection': return <CheckCircle className="w-5 h-5" />;
    case 'consultation': return <Users className="w-5 h-5" />;
    case 'preparation': return <Package className="w-5 h-5" />;
    case 'finishing': return <Award className="w-5 h-5" />;
    default: return <Zap className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'installation': return 'text-blue-400 bg-blue-400/10';
    case 'repair': return 'text-orange-400 bg-orange-400/10';
    case 'maintenance': return 'text-green-400 bg-green-400/10';
    case 'inspection': return 'text-purple-400 bg-purple-400/10';
    case 'consultation': return 'text-pink-400 bg-pink-400/10';
    case 'preparation': return 'text-yellow-400 bg-yellow-400/10';
    case 'finishing': return 'text-cyan-400 bg-cyan-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
};

const getQualityColor = (quality?: string) => {
  switch (quality) {
    case 'economy': return 'text-gray-400';
    case 'standard': return 'text-blue-400';
    case 'premium': return 'text-purple-400';
    case 'luxury': return 'text-amber-400';
    default: return 'text-gray-400';
  }
};

const getSkillLevelColor = (level?: string) => {
  switch (level) {
    case 'basic': return 'bg-green-500';
    case 'intermediate': return 'bg-yellow-500';
    case 'advanced': return 'bg-orange-500';
    case 'expert': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onAddToCart,
  onCustomizePricing,
  hasCustomPricing,
  organizationId,
  onCompareToggle,
  isComparing
}) => {
  const [selectedQuality, setSelectedQuality] = useState<string>('standard');
  const [quantity, setQuantity] = useState(1);
  const [showAllItems, setShowAllItems] = useState(false);

  // Find the template that matches the selected quality
  const selectedTemplate = service.templates?.find(t => 
    (t.material_quality || 'standard') === selectedQuality
  ) || service.templates?.[0];

  if (!selectedTemplate) {
    return null;
  }

  const lineItems = selectedTemplate.service_option_items || [];
  const visibleItems = showAllItems ? lineItems : lineItems.slice(0, 3);
  const hasMoreItems = lineItems.length > 3;

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const totalPrice = selectedTemplate.price * quantity;

  // Get unique quality levels from templates
  const qualityLevels = [...new Set(
    service.templates?.map(t => t.material_quality || 'standard') || []
  )].sort((a, b) => {
    const order = ['economy', 'standard', 'premium', 'luxury'];
    return order.indexOf(a) - order.indexOf(b);
  });

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg hover:border-[#444444] transition-all">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 w-full">
            <div className={`p-2 rounded-lg ${getCategoryColor(service.category)} flex-shrink-0`}>
              {getCategoryIcon(service.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 break-words">{service.name}</h3>
              {service.description && (
                <p className="text-sm text-gray-400 break-words">{service.description}</p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-lg sm:text-xl font-bold text-white">
              {service.min_price && service.max_price ? (
                service.min_price === service.max_price ? 
                  formatCurrency(service.min_price) : 
                  <span className="whitespace-nowrap">{formatCurrency(service.min_price)} - {formatCurrency(service.max_price)}</span>
              ) : (
                formatCurrency(selectedTemplate.price)
              )}
            </div>
            {service.templates && service.templates.length > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                {service.templates.length} options available
              </div>
            )}
          </div>
        </div>

        {/* Key Attributes */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {selectedTemplate.materials_list && selectedTemplate.materials_list.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">
                {selectedTemplate.materials_list.slice(0, 2).join(', ')}
                {selectedTemplate.materials_list.length > 2 && ` +${selectedTemplate.materials_list.length - 2} more`}
              </span>
            </div>
          )}
          
          {selectedTemplate.estimated_hours && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{selectedTemplate.estimated_hours}h</span>
            </div>
          )}

          {selectedTemplate.warranty_months && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>{selectedTemplate.warranty_months}mo warranty</span>
            </div>
          )}

          {selectedTemplate.skill_level && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${getSkillLevelColor(selectedTemplate.skill_level)}`} />
              <span className="text-gray-400 capitalize">{selectedTemplate.skill_level}</span>
            </div>
          )}
        </div>

        {/* Important Badges */}
        {selectedTemplate.attributes && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTemplate.attributes.permit_required && (
              <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Permit Required
              </span>
            )}
            {selectedTemplate.attributes.energy_star && (
              <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Energy Star
              </span>
            )}
            {selectedTemplate.attributes.code_compliance && (
              <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Code Compliant
              </span>
            )}
          </div>
        )}

        {/* What's Included */}
        {lineItems.length > 0 && (
          <div className="bg-[#252525]/50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              What's Included
            </h4>
            <div className="space-y-2">
              {visibleItems.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-300">
                      {item.quantity}× {item.line_item?.name || 'Unknown item'}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {formatCurrency((item.line_item?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            {hasMoreItems && (
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="mt-2 text-xs text-[#336699] hover:text-[#4477aa] flex items-center gap-1"
              >
                {showAllItems ? 'Show less' : `See all ${lineItems.length} items`}
                <ChevronDown className={`w-3 h-3 transition-transform ${showAllItems ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quality Selector - Full width on mobile */}
          {qualityLevels.length > 1 && (
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <label className="text-xs text-gray-400 whitespace-nowrap">Quality:</label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#252525] border border-[#333333] rounded text-sm text-white focus:outline-none focus:border-[#336699]"
              >
                {qualityLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mobile Layout: Quantity and Add to Cart in a row */}
          <div className="flex items-center gap-2 flex-1">
            {/* Quantity Controls */}
            <div className="flex items-center gap-1 bg-[#252525] rounded border border-[#333333] flex-shrink-0">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <div className="px-2 sm:px-3 py-1 min-w-[50px] sm:min-w-[60px] text-center">
                <span className="text-white font-medium text-sm sm:text-base">{quantity}</span>
                <span className="text-gray-500 text-xs ml-1 hidden sm:inline">{selectedTemplate.unit}</span>
              </div>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(selectedTemplate, quantity)}
              className="flex-1 bg-[#336699] hover:bg-[#4477aa] text-white font-medium py-2 px-3 sm:px-4 rounded transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
              <span className="font-mono whitespace-nowrap">{formatCurrency(totalPrice)}</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#333333]">
          <div className="flex items-center gap-3">
            {onCompareToggle && (
              <label className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={isComparing}
                  onChange={(e) => onCompareToggle(service.id, e.target.checked)}
                  className="rounded border-gray-600 bg-transparent text-[#336699] focus:ring-[#336699] focus:ring-offset-0"
                />
                Compare
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCustomizePricing && organizationId && (
              <button
                onClick={() => onCustomizePricing(selectedTemplate)}
                className={`p-2 transition-colors ${
                  hasCustomPricing ? 'text-[#F59E0B] hover:text-[#D97706]' : 'text-gray-400 hover:text-white'
                }`}
                title={hasCustomPricing ? 'Update custom pricing' : 'Customize pricing for your business'}
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};