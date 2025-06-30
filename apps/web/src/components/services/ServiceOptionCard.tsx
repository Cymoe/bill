import React, { useState } from 'react';
import { 
  Clock, 
  Shield, 
  Star,
  Package,
  ChevronDown,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle
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
  attributes?: Record<string, unknown>;
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
  organization_id?: string;
}

interface ServiceOptionCardProps {
  template: ServiceTemplate;
  onAddToCart: (template: ServiceTemplate, quantity: number) => void;
}

const getQualityColor = (quality?: string) => {
  switch (quality) {
    case 'economy': return 'text-gray-400';
    case 'standard': return 'text-blue-400';
    case 'premium': return 'text-purple-400';
    case 'luxury': return 'text-amber-400';
    default: return 'text-gray-400';
  }
};

const getQualityBgColor = (quality?: string) => {
  switch (quality) {
    case 'economy': return 'bg-gray-400/10';
    case 'standard': return 'bg-blue-400/10';
    case 'premium': return 'bg-purple-400/10';
    case 'luxury': return 'bg-amber-400/10';
    default: return 'bg-gray-400/10';
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

export const ServiceOptionCard: React.FC<ServiceOptionCardProps> = ({
  template,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showAllItems, setShowAllItems] = useState(false);

  const lineItems = template.service_option_items || [];
  const visibleItems = showAllItems ? lineItems : lineItems.slice(0, 2);
  const hasMoreItems = lineItems.length > 2;

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const totalPrice = template.price * quantity;

  return (
    <div className="bg-[#252525] border border-[#333333] rounded-lg hover:border-[#444444] transition-all">
      <div className="p-4">
        {/* Header with name and quality badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-medium">{template.name}</h4>
              {template.material_quality && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${getQualityColor(template.material_quality)} ${getQualityBgColor(template.material_quality)}`}>
                  {template.material_quality.charAt(0).toUpperCase() + template.material_quality.slice(1)}
                </span>
              )}
            </div>
            {template.description && (
              <p className="text-sm text-gray-400">{template.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {formatCurrency(template.price)}
              <span className="text-sm text-gray-500 font-normal">/{template.unit}</span>
            </div>
          </div>
        </div>

        {/* Key Attributes Row */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
          {template.materials_list && template.materials_list.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Package className="w-3.5 h-3.5" />
              <span className="text-xs">
                {template.materials_list.slice(0, 2).join(', ')}
                {template.materials_list.length > 2 && ` +${template.materials_list.length - 2}`}
              </span>
            </div>
          )}
          
          {template.estimated_hours && (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{template.estimated_hours}h</span>
            </div>
          )}

          {template.warranty_months && (
            <div className="flex items-center gap-1 text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-xs">{template.warranty_months}mo</span>
            </div>
          )}

          {template.skill_level && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getSkillLevelColor(template.skill_level)}`} />
              <span className="text-xs text-gray-400 capitalize">{template.skill_level}</span>
            </div>
          )}
        </div>

        {/* Important Badges */}
        {template.attributes && (
          <div className="flex flex-wrap gap-2 mb-3">
            {template.attributes.permit_required && (
              <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Permit Required
              </span>
            )}
            {template.attributes.energy_star && (
              <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3" />
                Energy Star
              </span>
            )}
            {template.attributes.code_compliance && (
              <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Code Compliant
              </span>
            )}
          </div>
        )}

        {/* Line Items Preview */}
        {lineItems.length > 0 && (
          <div className="bg-[#1A1A1A]/50 rounded p-3 mb-3">
            <h5 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Includes:
            </h5>
            <div className="space-y-1">
              {visibleItems.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-500">•</span>
                    <span>{item.quantity}× {item.line_item?.name || 'Unknown item'}</span>
                  </div>
                  <span className="text-gray-500">
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
        <div className="flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] rounded border border-[#333333]">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="px-3 py-1 min-w-[50px] text-center">
              <span className="text-white font-medium text-sm">{quantity}</span>
              <span className="text-gray-500 text-xs ml-1">{template.unit}</span>
            </div>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => onAddToCart(template, quantity)}
            className="flex-1 bg-[#336699] hover:bg-[#4477aa] text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Add to Cart
            <span className="font-mono">{formatCurrency(totalPrice)}</span>
          </button>

        </div>
      </div>
    </div>
  );
};