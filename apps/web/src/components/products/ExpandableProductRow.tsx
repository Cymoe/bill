import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MoreVertical, Edit3, Copy, Trash2, Shield, Star, Zap, Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { Product } from '../../services/ProductService';

interface ExpandableProductRowProps {
  product: Product;
  variants: Product[];
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSelectForComparison?: (product: Product) => void;
  onGenerateVariants?: (product: Product) => void;
  isComparing?: boolean;
}

export const ExpandableProductRow: React.FC<ExpandableProductRowProps> = ({
  product,
  variants,
  onEdit,
  onDuplicate,
  onDelete,
  onSelectForComparison,
  onGenerateVariants,
  isComparing = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getQualityIcon = (tier?: string) => {
    switch (tier) {
      case 'basic':
        return <Shield className="w-4 h-4 text-gray-400" />;
      case 'standard':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'premium':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getQualityBadge = (tier?: string) => {
    switch (tier) {
      case 'basic':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
            Basic
          </span>
        );
      case 'standard':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-300">
            Standard
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900 text-purple-300">
            Premium
          </span>
        );
      default:
        return null;
    }
  };

  const getMarginColor = (margin?: number) => {
    if (!margin) return 'text-gray-500';
    if (margin >= 50) return 'text-green-500';
    if (margin >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderProductRow = (prod: Product, isVariant: boolean = false) => (
    <div
      className={`
        ${isVariant ? 'pl-12 bg-[#1a1a1a]' : 'bg-[#222222]'} 
        hover:bg-[#2a2a2a] transition-colors
      `}
    >
      <div className="px-6 py-4">
        <div className="flex items-center">
          {/* Checkbox for comparison */}
          {isComparing && (
            <input
              type="checkbox"
              onChange={() => onSelectForComparison?.(prod)}
              className="mr-4 w-4 h-4 text-[#336699] bg-[#333333] border-[#555555] rounded focus:ring-[#336699]"
            />
          )}

          {/* Expand/collapse button (only for parent products) */}
          {!isVariant && variants.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mr-3 text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Product info */}
          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <div className="flex items-center gap-2">
                {getQualityIcon(prod.quality_tier)}
                <span className="text-white font-medium">{prod.name}</span>
              </div>
              {prod.description && (
                <p className="text-sm text-gray-400 mt-1">{prod.description}</p>
              )}
            </div>

            <div className="col-span-2">
              {getQualityBadge(prod.quality_tier)}
            </div>

            <div className="col-span-2 text-right">
              <div className="text-white font-medium">{formatCurrency(prod.price)}</div>
              <div className="text-xs text-gray-500">per {prod.unit}</div>
            </div>

            <div className="col-span-2 text-center">
              {prod.total_cost ? (
                <div>
                  <div className="text-sm text-gray-400">Cost: {formatCurrency(prod.total_cost)}</div>
                  <div className={`text-sm font-medium ${getMarginColor(prod.margin_percentage)}`}>
                    {prod.margin_percentage?.toFixed(0)}% margin
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>

            <div className="col-span-1 text-center">
              <span className="text-gray-400">{prod.item_count || 0} items</span>
            </div>

            <div className="col-span-1 text-right">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 hover:bg-[#333333] rounded transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-[#333333] rounded-lg shadow-lg border border-[#555555] z-10">
                    <button
                      onClick={() => {
                        onEdit(prod);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#444444] hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    {!isVariant && variants.length === 0 && onGenerateVariants && (
                      <button
                        onClick={() => {
                          onGenerateVariants(prod);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#444444] hover:text-white transition-colors"
                      >
                        <Layers className="w-4 h-4" />
                        Generate Variants
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onDuplicate(prod);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#444444] hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        onDelete(prod);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-[#444444] hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {renderProductRow(product)}
      
      {/* Render variants when expanded */}
      {isExpanded && variants.map(variant => (
        <div key={variant.id} className="border-l-2 border-[#333333] ml-6">
          {renderProductRow(variant, true)}
        </div>
      ))}
    </>
  );
};