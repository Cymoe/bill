import React, { useState } from 'react';
import { 
  Clock, 
  Shield, 
  Package, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Award,
  Wrench,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ServiceOption } from '../../services/ServiceCatalogService';
import { formatCurrency } from '../../utils/format';

interface EnhancedServiceOptionCardProps {
  option: ServiceOption;
  isSelected: boolean;
  onSelect: () => void;
  industryName?: string;
}

export const EnhancedServiceOptionCard: React.FC<EnhancedServiceOptionCardProps> = ({ 
  option, 
  isSelected, 
  onSelect,
  industryName 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isBaseOption = option.name === 'Standard' || option.is_popular;
  
  // Parse materials list
  const parsedMaterials = option.materials_list?.map(material => {
    const [name, quantity, unit] = material.split(':');
    return { name, quantity, unit };
  }) || [];

  // Get quality badge color
  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'economy': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'standard': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'premium': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'luxury': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Format attribute key for display
  const formatAttributeKey = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format attribute value for display
  const formatAttributeValue = (value: any): string => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value.replace(/_/g, ' ');
    return String(value);
  };

  // Identify key attributes to highlight
  const getKeyAttributes = () => {
    if (!option.attributes) return [];
    
    const priorityKeys = [
      'fire_rating', 'wind_rating', 'energy_rating', 'warranty_type', 
      'coverage', 'thickness', 'insulation_value', 'efficiency_rating',
      'voc_level', 'ada_compliant', 'lead_time', 'noise_reduction'
    ];
    
    return Object.entries(option.attributes)
      .filter(([key]) => priorityKeys.includes(key))
      .slice(0, 3);
  };

  const keyAttributes = getKeyAttributes();

  return (
    <div
      className={`border transition-all ${
        isSelected 
          ? 'border-[#336699] bg-[#336699]/10' 
          : 'border-[#333333] hover:border-[#444444]'
      }`}
    >
      {/* Main Card Content */}
      <div
        onClick={onSelect}
        className="p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-white font-medium">
                {option.name}
              </h4>
              
              {/* Quality Badge */}
              {option.material_quality && (
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getQualityColor(option.material_quality)}`}>
                  {option.material_quality.charAt(0).toUpperCase() + option.material_quality.slice(1)}
                </span>
              )}
              
              {/* Popular Badge */}
              {isBaseOption && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-[#336699]/20 text-[#336699] border border-[#336699]/50">
                  <Star className="w-3 h-3 inline mr-1" />
                  Popular
                </span>
              )}
              
              {/* Key Attributes as Badges */}
              {keyAttributes.map(([key, value]) => (
                <span key={key} className="px-2 py-0.5 text-xs rounded bg-gray-700/50 text-gray-300">
                  {formatAttributeKey(key)}: {formatAttributeValue(value)}
                </span>
              ))}
            </div>
            
            {option.description && (
              <p className="text-sm text-gray-400 mt-1">{option.description}</p>
            )}

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {option.estimated_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {option.estimated_hours}h
                </span>
              )}
              {option.warranty_months && (
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {option.warranty_months}mo warranty
                </span>
              )}
              {parsedMaterials.length > 0 && (
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {parsedMaterials.length} materials
                </span>
              )}
              {option.skill_level && (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {option.skill_level}
                </span>
              )}
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="font-mono text-lg text-white">
              {formatCurrency(option.price)}
            </div>
            <div className="text-xs text-gray-400">
              per {option.unit.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <div className="border-t border-[#333333] px-4 py-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>View Details</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="border-t border-[#333333] p-4 bg-[#1A1A1A]">
          <div className="space-y-4">
            {/* Materials List */}
            {parsedMaterials.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Included Materials
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {parsedMaterials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{material.name}</span>
                      <span className="text-white font-mono">
                        {material.quantity} {material.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Attributes */}
            {option.attributes && Object.keys(option.attributes).length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Technical Specifications
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(option.attributes).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{formatAttributeKey(key)}:</span>
                      <span className="text-white">
                        {formatAttributeValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-[#333333]">
              {option.estimated_hours && (
                <div className="text-center">
                  <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="text-sm text-white">{option.estimated_hours} hours</div>
                </div>
              )}
              {option.warranty_months && (
                <div className="text-center">
                  <Shield className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-400">Warranty</div>
                  <div className="text-sm text-white">{option.warranty_months} months</div>
                </div>
              )}
              {option.material_quality && (
                <div className="text-center">
                  <Award className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-400">Quality</div>
                  <div className="text-sm text-white capitalize">{option.material_quality}</div>
                </div>
              )}
              {option.skill_level && (
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-400">Skill Level</div>
                  <div className="text-sm text-white capitalize">{option.skill_level}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};