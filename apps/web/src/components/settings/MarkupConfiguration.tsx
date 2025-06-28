import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, Wrench, Users, HardHat, Info, Save, RefreshCw } from 'lucide-react';
import { OrganizationMarkupService, MarkupRule } from '../../services/OrganizationMarkupService';
import { formatCurrency } from '../../utils/format';

interface MarkupConfigurationProps {
  organizationId: string;
}

export const MarkupConfiguration: React.FC<MarkupConfigurationProps> = ({ organizationId }) => {
  const [markupRules, setMarkupRules] = useState<MarkupRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalRules, setOriginalRules] = useState<MarkupRule[]>([]);
  const [showExample, setShowExample] = useState(true);

  const categoryIcons = {
    labor: <HardHat className="w-5 h-5" />,
    materials: <Package className="w-5 h-5" />,
    services: <Wrench className="w-5 h-5" />,
    subcontractor: <Users className="w-5 h-5" />
  };

  const categoryDescriptions = {
    labor: 'Applied to cost codes 100-199',
    materials: 'Applied to cost codes 500-599',
    services: 'Applied to cost codes 200-299, 300-399, 600-699',
    subcontractor: 'Applied to cost codes 700-799'
  };

  useEffect(() => {
    loadMarkupRules();
  }, [organizationId]);

  const loadMarkupRules = async () => {
    try {
      setIsLoading(true);
      const rules = await OrganizationMarkupService.getMarkupRules(organizationId);
      setMarkupRules(rules);
      setOriginalRules(JSON.parse(JSON.stringify(rules)));
    } catch (error) {
      console.error('Error loading markup rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkupChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMarkupRules(prev => 
      prev.map(rule => 
        rule.category === category 
          ? { ...rule, markup_percentage: numValue }
          : rule
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updates = markupRules.map(rule => ({
        category: rule.category,
        markup_percentage: rule.markup_percentage,
        is_active: rule.is_active
      }));
      
      await OrganizationMarkupService.updateAllMarkupRules(organizationId, updates);
      setOriginalRules(JSON.parse(JSON.stringify(markupRules)));
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving markup rules:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setMarkupRules(JSON.parse(JSON.stringify(originalRules)));
    setHasChanges(false);
  };

  const calculateExample = (cost: number, category: string) => {
    const rule = markupRules.find(r => r.category === category);
    const markupPercent = rule?.markup_percentage || 0;
    const markup = cost * (markupPercent / 100);
    const price = cost + markup;
    const margin = price > 0 ? (markup / price) * 100 : 0;
    
    return { cost, markup, price, margin };
  };

  if (isLoading) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#252525] rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-[#252525] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#333333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-lg font-semibold text-white">Price Adjustment Configuration</h2>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                hasChanges 
                  ? 'bg-[#F59E0B] text-black hover:bg-[#D97706]' 
                  : 'bg-[#252525] text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 py-3 bg-[#336699]/10 border-b border-[#336699]/30">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#336699] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white">Smart Category-Based Pricing</p>
            <p className="mt-1">
              Price adjustments are automatically applied based on cost code categories. 
              This ensures consistent pricing across all estimates while maintaining flexibility.
            </p>
          </div>
        </div>
      </div>

      {/* Markup Rules */}
      <div className="p-6 space-y-4">
        {markupRules.map((rule) => (
          <div key={rule.category} className="bg-[#252525] rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#333333] rounded-lg text-gray-400">
                  {categoryIcons[rule.category as keyof typeof categoryIcons]}
                </div>
                <div>
                  <h3 className="font-medium text-white capitalize">{rule.category}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {categoryDescriptions[rule.category as keyof typeof categoryDescriptions]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    value={rule.markup_percentage}
                    onChange={(e) => handleMarkupChange(rule.category, e.target.value)}
                    className="w-20 px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white text-right focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                    step="1"
                    min="-100"
                    max="500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            {showExample && (
              <div className="mt-3 pt-3 border-t border-[#333333]">
                <div className="text-xs text-gray-500">
                  Example: $100 base → {formatCurrency(calculateExample(100, rule.category).price)} price
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Example Section */}
      <div className="px-6 pb-6">
        <div className="bg-[#252525] rounded-lg p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
            Pricing Example
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Labor ($50/hr cost)</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="text-white">{formatCurrency(50)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adjustment ({markupRules.find(r => r.category === 'labor')?.markup_percentage}%):</span>
                    <span className="text-emerald-400">+{formatCurrency(calculateExample(50, 'labor').markup)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-300">Your Price:</span>
                    <span className="text-white">{formatCurrency(calculateExample(50, 'labor').price)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Materials ($200 cost)</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="text-white">{formatCurrency(200)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adjustment ({markupRules.find(r => r.category === 'materials')?.markup_percentage}%):</span>
                    <span className="text-emerald-400">+{formatCurrency(calculateExample(200, 'materials').markup)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-300">Your Price:</span>
                    <span className="text-white">{formatCurrency(calculateExample(200, 'materials').price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};