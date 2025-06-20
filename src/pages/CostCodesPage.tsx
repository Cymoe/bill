import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Upload, ChevronRight, Package, Wrench, Truck, Users, Briefcase, Grid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationContext } from '../components/layouts/DashboardLayout';
import { PageHeader } from '../components/common/PageHeader';
import { PageHeaderBar } from '../components/common/PageHeaderBar';
import { NewButton } from '../components/common/NewButton';
import { formatCurrency } from '../utils/format';
import { ViewToggle, ViewMode } from '../components/common/ViewToggle';
import { Modal } from '../components/common/Modal';
import { BulkProductGenerator } from '../components/products/BulkProductGenerator';
import { CostCodeService } from '../services/CostCodeService';

interface CostCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'service';
  organization_id?: string;
  industry_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TradeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  code_range_start: string;
  code_range_end: string;
  icon: string;
  color: string;
  category_type: 'construction' | 'specialty_trade' | 'service' | 'home_service' | 'business_ops';
}

const categoryIcons = {
  labor: Users,
  material: Package,
  equipment: Wrench,
  subcontractor: Truck,
  service: Briefcase
};

const categoryColors = {
  labor: 'text-blue-400',
  material: 'text-green-400',
  equipment: 'text-yellow-400',
  subcontractor: 'text-purple-400',
  service: 'text-orange-400'
};

export default function CostCodesPage() {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  
  // State
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [selectedCostCode, setSelectedCostCode] = useState<CostCode | null>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [loadingLineItems, setLoadingLineItems] = useState(false);
  const [tradeCategories, setTradeCategories] = useState<TradeCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTradeCategory, setSelectedTradeCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [selectedCostCodes, setSelectedCostCodes] = useState<Set<string>>(new Set());
  const [costCodeItemCounts, setCostCodeItemCounts] = useState<Record<string, number>>({});
  
  // Load data
  useEffect(() => {
    if (selectedOrg?.id) {
      loadCostCodes();
      loadTradeCategories();
      loadCostCodeItemCounts();
    }
  }, [selectedOrg?.id, selectedOrg?.industry_id]);

  const loadCostCodes = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoading(true);
      
      // Use CostCodeService which handles industry filtering and merging
      const costCodes = await CostCodeService.list(selectedOrg.id);
      setCostCodes(costCodes);
    } catch (error) {
      console.error('Error loading cost codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTradeCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_categories')
        .select('*')
        .eq('is_active', true)
        .order('code_range_start');

      if (error) throw error;
      setTradeCategories(data || []);
    } catch (error) {
      console.error('Error loading trade categories:', error);
    }
  };

  const loadCostCodeItemCounts = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('line_items')
        .select('cost_code_id')
        .eq('organization_id', selectedOrg.id);

      if (error) throw error;
      
      // Count items per cost code
      const counts: Record<string, number> = {};
      (data || []).forEach(item => {
        if (item.cost_code_id) {
          counts[item.cost_code_id] = (counts[item.cost_code_id] || 0) + 1;
        }
      });
      
      setCostCodeItemCounts(counts);
    } catch (error) {
      console.error('Error loading cost code item counts:', error);
    }
  };

  // Filter cost codes based on search and trade category
  const filteredCostCodes = useMemo(() => {
    let filtered = costCodes;

    // Filter by trade category dropdown
    if (selectedTradeCategory !== 'all') {
      const category = tradeCategories.find(cat => cat.slug === selectedTradeCategory);
      if (category) {
        filtered = filtered.filter(code => {
          const majorCode = code.code.substring(0, 2);
          return majorCode >= category.code_range_start && majorCode <= category.code_range_end;
        });
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(code => 
        code.code.toLowerCase().includes(term) ||
        code.name.toLowerCase().includes(term) ||
        (code.description && code.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [costCodes, selectedTradeCategory, searchTerm, tradeCategories]);

  // Group cost codes by major code for grid view
  const groupedCostCodes = useMemo(() => {
    const groups = new Map<string, CostCode[]>();
    
    filteredCostCodes.forEach(code => {
      const majorCode = code.code.substring(0, 2);
      if (!groups.has(majorCode)) {
        groups.set(majorCode, []);
      }
      groups.get(majorCode)!.push(code);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredCostCodes]);


  const toggleCostCode = (codeId: string) => {
    const newSelected = new Set(selectedCostCodes);
    if (newSelected.has(codeId)) {
      newSelected.delete(codeId);
    } else {
      newSelected.add(codeId);
    }
    setSelectedCostCodes(newSelected);
  };

  const handleExportCSV = async () => {
    const csv = [
      ['Code', 'Name', 'Description', 'Category', 'Unit', 'Base Price'],
      ...filteredCostCodes.map(code => [
        code.code,
        code.name,
        code.description || '',
        code.category,
        code.unit,
        code.base_price?.toString() || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCostCodeClick = async (costCode: CostCode) => {
    setSelectedCostCode(costCode);
    setLoadingLineItems(true);
    
    try {
      const { data, error } = await supabase
        .from('line_items')
        .select(`
          *,
          cost_code:cost_codes(name, code)
        `)
        .eq('organization_id', selectedOrg?.id)
        .eq('cost_code_id', costCode.id)
        .order('name');

      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error('Error loading line items for cost code:', error);
      setLineItems([]);
    } finally {
      setLoadingLineItems(false);
    }
  };

  const handleBackToCostCodes = () => {
    setSelectedCostCode(null);
    setLineItems([]);
  };

  return (
    <div className="bg-transparent border border-[#333333] border-t-0">
      {/* Filters Section - Only show when not in drill-down view */}
      {!selectedCostCode && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Trade category filter and search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {selectedTradeCategory === 'all' ? 'All Industries' : 
                    tradeCategories.find(cat => cat.slug === selectedTradeCategory)?.name || 'Select Industry'}
                </button>
                
                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedTradeCategory('all');
                        setShowFilterMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333]"
                    >
                      All Industries
                    </button>
                    {tradeCategories
                      .filter(cat => cat.category_type === 'specialty_trade')
                      .map(category => (
                      <button
                        key={category.slug}
                        onClick={() => {
                          setSelectedTradeCategory(category.slug);
                          setShowFilterMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333]"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - View toggle and actions */}
            <div className="flex items-center gap-3">
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              
              <button
                onClick={handleExportCSV}
                className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Content */}
      <div className="border-t border-[#333333]">
        {selectedCostCode ? (
          /* Line Items View */
          <div>
            {/* Breadcrumb */}
            <div className="px-6 py-4 bg-[#1A1A1A] border-b border-[#333333] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToCostCodes}
                  className="text-[#336699] hover:text-[#4A7BB7] transition-colors text-sm flex items-center gap-2"
                >
                  ← Back to Cost Codes
                </button>
                <span className="text-gray-500">/</span>
                <span className="text-white font-medium">
                  {selectedCostCode.name} ({selectedCostCode.code})
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {loadingLineItems ? 'Loading...' : `${lineItems.length} items`}
              </div>
            </div>

            {/* Line Items Content */}
            {loadingLineItems ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading line items...</div>
              </div>
            ) : lineItems.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center">
                <div>
                  <div className="text-gray-400 mb-2">No items found for this cost code</div>
                  <button className="text-[#336699] hover:text-[#4A7BB7] text-sm">
                    + Add first item
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#333333]">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-6 py-4 hover:bg-[#1E1E1E] transition-colors flex items-center gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-[#1E1E1E] rounded text-blue-400">
                        <Package className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="text-gray-400 text-sm">{item.unit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading cost codes...</div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="divide-y divide-[#333333]">
            {filteredCostCodes.map((code) => {
              return (
                <div
                  key={code.id}
                  className="px-6 py-4 hover:bg-[#1E1E1E] transition-colors flex items-center gap-4 cursor-pointer"
                  onClick={() => handleCostCodeClick(code)}
                >
                  <input
                    type="checkbox"
                    checked={selectedCostCodes.has(code.id)}
                    onChange={() => toggleCostCode(code.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                  />
                  
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[#336699] font-mono text-sm">{code.code}</span>
                        <h3 className="text-white font-medium">{code.name}</h3>
                        {code.organization_id && (
                          <span className="text-xs px-2 py-0.5 bg-[#336699]/20 text-[#336699] rounded">Custom</span>
                        )}
                      </div>
                      {code.description && (
                        <p className="text-gray-400 text-sm mt-1">{code.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[#336699] font-medium text-sm">
                        {costCodeItemCounts[code.id] || '-'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact View - Compact Grid */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCostCodes.map((code) => {
                return (
                  <div
                    key={code.id}
                    className="bg-[#1E1E1E] border border-[#333333] p-3 hover:border-[#336699] transition-colors cursor-pointer"
                    onClick={() => handleCostCodeClick(code)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[#336699] font-mono text-xs">{code.code}</span>
                      <input
                        type="checkbox"
                        checked={selectedCostCodes.has(code.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleCostCode(code.id);
                        }}
                        className="w-3 h-3 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium text-sm line-clamp-2">{code.name}</h3>
                      {code.organization_id && (
                        <span className="text-xs px-1.5 py-0.5 bg-[#336699]/20 text-[#336699] rounded shrink-0">Custom</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#336699] font-medium">
                        {costCodeItemCounts[code.id] || '-'} items
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Product Generator */}
      {showBulkGenerator && (
        <BulkProductGenerator
          isOpen={showBulkGenerator}
          onClose={() => setShowBulkGenerator(false)}
          onSuccess={() => {
            setShowBulkGenerator(false);
            setSelectedCostCodes(new Set());
          }}
          preSelectedCostCodes={Array.from(selectedCostCodes)}
        />
      )}
    </div>
  );
}