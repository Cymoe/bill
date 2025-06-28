import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PricingModesService, PricingMode, PriceChange } from '../../services/PricingModesService';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface PricingModePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: PricingMode;
  organizationId: string;
  lineItemIds?: string[];
  onConfirm: () => Promise<void>;
}

export const PricingModePreviewModal: React.FC<PricingModePreviewModalProps> = ({
  isOpen,
  onClose,
  mode,
  organizationId,
  lineItemIds,
  onConfirm
}) => {
  const [changes, setChanges] = useState<PriceChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [groupedChanges, setGroupedChanges] = useState<Map<string, PriceChange[]>>(new Map());

  useEffect(() => {
    if (isOpen && mode) {
      fetchPreview();
    }
  }, [isOpen, mode, lineItemIds]);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      const preview = await PricingModesService.previewApplication(
        organizationId,
        mode.id,
        lineItemIds
      );
      setChanges(preview);
      
      // Group by category
      const grouped = new Map<string, PriceChange[]>();
      preview.forEach(change => {
        const category = change.category;
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        grouped.get(category)!.push(change);
      });
      setGroupedChanges(grouped);
    } catch (error) {
      console.error('Error fetching preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsApplying(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error applying mode:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getTotalSummary = () => {
    const totalOld = changes.reduce((sum, c) => sum + c.old_price, 0);
    const totalNew = changes.reduce((sum, c) => sum + c.new_price, 0);
    const averageChange = totalOld > 0 ? ((totalNew - totalOld) / totalOld) * 100 : 0;
    
    return {
      totalOld,
      totalNew,
      averageChange,
      itemCount: changes.length
    };
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      labor: '👷',
      materials: '📦',
      services: '🔧',
      installation: '🏗️',
      equipment: '⚙️',
      subcontractor: '👥',
      all: '📊'
    };
    return icons[category] || '📋';
  };

  const summary = getTotalSummary();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mode.icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-white">Apply {mode.name}</h2>
            <p className="text-sm text-gray-400">{mode.description}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Summary Box */}
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Pricing Impact Summary</h3>
                <div className={`flex items-center gap-1 text-sm ${
                  summary.averageChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {summary.averageChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(summary.averageChange).toFixed(1)}% average
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Items affected</p>
                  <p className="text-lg font-semibold text-white">{summary.itemCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current total</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(summary.totalOld)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">New total</p>
                  <p className={`text-lg font-semibold ${
                    summary.averageChange > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>{formatCurrency(summary.totalNew)}</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">Changes by Category</h3>
              
              {Array.from(groupedChanges.entries()).map(([category, items]) => {
                const categoryTotal = items.reduce((sum, item) => sum + item.new_price - item.old_price, 0);
                const categoryAvg = items.reduce((sum, item) => sum + item.change_percentage, 0) / items.length;
                
                return (
                  <details key={category} className="group">
                    <summary className="flex items-center justify-between p-3 bg-[#252525] rounded-lg cursor-pointer hover:bg-[#333333] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getCategoryIcon(category)}</span>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{category}</p>
                          <p className="text-xs text-gray-400">{items.length} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-medium ${
                          categoryAvg > 0 ? 'text-green-400' : categoryAvg < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {categoryAvg > 0 ? '+' : ''}{categoryAvg.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {categoryTotal > 0 ? '+' : ''}{formatCurrency(categoryTotal)}
                        </span>
                      </div>
                    </summary>
                    
                    <div className="mt-2 space-y-1 pl-11">
                      {items.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 text-xs">
                          <span className="text-gray-400 truncate max-w-[200px]">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">{formatCurrency(item.old_price)}</span>
                            <span className="text-gray-600">→</span>
                            <span className={`font-medium ${
                              item.change_percentage > 0 ? 'text-green-400' : item.change_percentage < 0 ? 'text-red-400' : 'text-white'
                            }`}>
                              {formatCurrency(item.new_price)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {items.length > 5 && (
                        <p className="text-xs text-gray-500 pt-1">...and {items.length - 5} more</p>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>

            {/* Warning for large changes */}
            {Math.abs(summary.averageChange) > 50 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-400">
                  <p className="font-medium">Large price change detected</p>
                  <p className="text-xs mt-1 text-yellow-400/80">
                    This mode will change prices by an average of {Math.abs(summary.averageChange).toFixed(0)}%. 
                    Make sure this aligns with your pricing strategy.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#333333]">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          disabled={isApplying}
        >
          Cancel
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {summary.itemCount} items will be updated
          </span>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isApplying}
            className="px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#336699]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? 'Applying...' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
};