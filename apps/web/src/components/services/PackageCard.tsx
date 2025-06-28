import React from 'react';
import { Star, Package } from 'lucide-react';

interface PackageCardProps {
  package: any;
  onViewDetails: (pkg: any) => void;
  onSelect: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'essentials':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'complete':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    case 'deluxe':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
};

const getLevelLabel = (level: string) => {
  switch (level) {
    case 'essentials': return 'Essentials';
    case 'complete': return 'Complete';
    case 'deluxe': return 'Deluxe';
    default: return level;
  }
};


export const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onViewDetails, onSelect }) => {
  return (
    <div className="bg-[#252525] border border-[#333333] rounded-lg overflow-hidden hover:border-[#336699] transition-colors group relative">
      {/* Featured Badge */}
      {pkg.is_featured && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-[#336699] text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            Featured
          </div>
        </div>
      )}

      <div className={`p-3 ${pkg.is_featured ? 'pt-8' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base mb-1 leading-tight">{pkg.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>{pkg.industry_name}</span>
              <span>•</span>
              <span>{pkg.completion_days} days</span>
            </div>
          </div>
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${getLevelColor(pkg.level)} ml-2 flex-shrink-0`}>
            {getLevelLabel(pkg.level)}
          </span>
        </div>
        
        {pkg.description && (
          <p className="text-gray-400 text-xs mb-2 line-clamp-2">{pkg.description}</p>
        )}

        {/* What's Included */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-400 mb-1.5">Includes:</div>
          {pkg.service_package_templates && pkg.service_package_templates.length > 0 ? (
            <div className="space-y-0.5">
              {pkg.service_package_templates.slice(0, 2).map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-1.5 text-xs">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300 flex-1">{item.template?.name || 'Service'}</span>
                  {item.quantity > 1 && (
                    <span className="text-gray-500 text-xs">(×{item.quantity})</span>
                  )}
                </div>
              ))}
              {pkg.service_package_templates.length > 2 && (
                <div className="text-xs text-gray-500 pl-3">
                  +{pkg.service_package_templates.length - 2} more services
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              Click "View Details" to see what's included
            </div>
          )}
        </div>

        {/* Pricing - Horizontal Layout */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs text-gray-500">Starting at</div>
            <div className="text-lg font-bold text-white">
              {pkg.calculated_price ? (
                formatCurrency(pkg.calculated_price)
              ) : (
                <span className="text-gray-400">Quote</span>
              )}
            </div>
          </div>

          {/* Optional pricing */}
          {(pkg.optional_count || 0) > 0 && pkg.potential_price_discounted && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Complete</div>
              <div className="text-sm font-semibold text-green-400">
                {formatCurrency(pkg.potential_price_discounted || pkg.potential_price)}
              </div>
            </div>
          )}
        </div>

        {/* Optional services compact indicator */}
        {(pkg.optional_count || 0) > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
              <span>+{pkg.optional_count || 0} optional</span>
              <span>{pkg.completion_percentage || 0}% base</span>
            </div>
            <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#336699] to-green-400 transition-all duration-300"
                style={{ width: `${pkg.completion_percentage || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(pkg);
            }}
            className="py-2 border border-[#333333] text-gray-300 text-xs font-medium rounded hover:bg-[#333333] transition-colors"
          >
            View Details
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="py-2 bg-[#336699] text-white text-xs font-medium rounded hover:bg-[#4477aa] transition-colors flex items-center justify-center gap-1"
          >
            <Package className="w-3 h-3" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};