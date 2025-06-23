import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Upload, ChevronRight, ChevronDown, ChevronLeft, Package, Wrench, Truck, Users, Briefcase, Grid, List, Trash2, X } from 'lucide-react';
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
import { CostCodeForm } from '../components/cost-codes/CostCodeForm';

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
  industry?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
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

interface CostCodesPageProps {
  triggerAddCostCode?: number;
}

export default function CostCodesPage({ triggerAddCostCode }: CostCodesPageProps) {
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
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [selectedCostCodes, setSelectedCostCodes] = useState<Set<string>>(new Set());
  const [costCodeItemCounts, setCostCodeItemCounts] = useState<Record<string, number>>({});
  const [availableIndustries, setAvailableIndustries] = useState<Array<{id: string, name: string, count: number}>>([]);
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  const [showNewCostCodeModal, setShowNewCostCodeModal] = useState(false);
  const [sortField, setSortField] = useState<'code' | 'name' | 'items'>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle trigger from parent component
  useEffect(() => {
    if (triggerAddCostCode && triggerAddCostCode > 0) {
      setShowNewCostCodeModal(true);
    }
  }, [triggerAddCostCode]);
  
  // Load data
  useEffect(() => {
    if (selectedOrg?.id) {
      loadCostCodes();
      loadTradeCategories();
    }
  }, [selectedOrg?.id, selectedOrg?.industry_id]);
  
  // Update available industries when cost codes change
  useEffect(() => {
    const industries = new Map<string, {id: string, name: string, count: number}>();
    
    costCodes.forEach(code => {
      if (code.industry) {
        const key = code.industry.id;
        if (!industries.has(key)) {
          industries.set(key, {
            id: code.industry.id,
            name: code.industry.name,
            count: 0
          });
        }
        industries.get(key)!.count++;
      }
    });
    
    setAvailableIndustries(Array.from(industries.values()).sort((a, b) => a.name.localeCompare(b.name)));
  }, [costCodes]);

  const loadCostCodes = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setIsLoading(true);
      
      // Use CostCodeService which handles industry filtering and merging
      const costCodes = await CostCodeService.list(selectedOrg.id);
      setCostCodes(costCodes);
      
      // Update cost code item counts from the data
      const counts: Record<string, number> = {};
      costCodes.forEach(code => {
        if (code.item_count !== undefined) {
          counts[code.id] = code.item_count;
        }
      });
      setCostCodeItemCounts(counts);
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


  // Filter and sort cost codes based on search, selected industry, and sorting options
  const filteredCostCodes = useMemo(() => {
    let filtered = costCodes;

    // Filter by selected industry
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(code => code.industry?.id === selectedIndustry);
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

    // Sort the filtered results
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'items':
          const aCount = costCodeItemCounts[a.id] || 0;
          const bCount = costCodeItemCounts[b.id] || 0;
          comparison = aCount - bCount;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [costCodes, selectedIndustry, searchTerm, sortField, sortDirection, costCodeItemCounts]);

  // Group filtered cost codes by industry
  const groupedFilteredCostCodes = useMemo(() => {
    const grouped = new Map<string, CostCode[]>();
    
    filteredCostCodes.forEach(code => {
      const industryName = code.industry?.name || 'Unknown Industry';
      if (!grouped.has(industryName)) {
        grouped.set(industryName, []);
      }
      grouped.get(industryName)!.push(code);
    });
    
    // Sort industries alphabetically
    return new Map([...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filteredCostCodes]);

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
    
    // Ensure the industry is expanded when viewing a cost code
    if (costCode.industry?.name && !expandedIndustries.has(costCode.industry.name)) {
      setExpandedIndustries(new Set([...expandedIndustries, costCode.industry.name]));
    }
    
    try {
      // Line items are now standard and tied only to cost codes
      const { data, error } = await supabase
        .from('line_items')
        .select(`
          *,
          cost_code:cost_codes(name, code)
        `)
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
  
  const handleBulkDelete = async () => {
    if (selectedCostCodes.size === 0) return;
    
    const count = selectedCostCodes.size;
    const confirmMessage = `Are you sure you want to delete ${count} cost code${count > 1 ? 's' : ''}? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    
    try {
      // Delete each selected cost code
      const deletePromises = Array.from(selectedCostCodes).map(id => 
        CostCodeService.delete(id)
      );
      
      await Promise.all(deletePromises);
      
      // Clear selection and reload
      setSelectedCostCodes(new Set());
      await loadCostCodes();
    } catch (error) {
      console.error('Error deleting cost codes:', error);
      alert('Failed to delete some cost codes. Please try again.');
    }
  };
  
  const toggleIndustryExpanded = (industryName: string) => {
    const newExpanded = new Set(expandedIndustries);
    if (newExpanded.has(industryName)) {
      newExpanded.delete(industryName);
    } else {
      newExpanded.add(industryName);
    }
    setExpandedIndustries(newExpanded);
  };

  // Calculate previous and next cost codes within the same industry
  const navigationContext = useMemo(() => {
    if (!selectedCostCode || !selectedCostCode.industry) return null;
    
    // Get all cost codes in the same industry
    const industryCodes = costCodes.filter(
      code => code.industry?.id === selectedCostCode.industry?.id
    ).sort((a, b) => a.code.localeCompare(b.code));
    
    const currentIndex = industryCodes.findIndex(code => code.id === selectedCostCode.id);
    
    return {
      previous: currentIndex > 0 ? industryCodes[currentIndex - 1] : null,
      next: currentIndex < industryCodes.length - 1 ? industryCodes[currentIndex + 1] : null,
      currentIndex,
      totalCount: industryCodes.length
    };
  }, [selectedCostCode, costCodes]);

  return (
    <div className="bg-transparent border border-[#333333] border-t-0">
      {/* Bulk Actions Bar - Show when items are selected */}
      {selectedCostCodes.size > 0 && !selectedCostCode && (
        <div className="bg-[#336699] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">
              {selectedCostCodes.size} cost code{selectedCostCodes.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedCostCodes(new Set())}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkGenerator(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              Generate Products
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}
      
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
                  {selectedIndustry === 'all' ? `All Cost Codes (${filteredCostCodes.length})` : 
                    `${availableIndustries.find(ind => ind.id === selectedIndustry)?.name || 'Select Industry'} (${filteredCostCodes.length})`}
                </button>
                
                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1 max-h-96 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedIndustry('all');
                        setShowFilterMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#333333] flex items-center justify-between group"
                    >
                      <span className="font-medium">All Cost Codes</span>
                      <span className="text-gray-400 text-xs bg-[#333333] px-2 py-1 rounded group-hover:bg-[#444444]">
                        {costCodes.length} total
                      </span>
                    </button>
                    
                    {availableIndustries.length > 0 && (
                      <>
                        <div className="border-t border-[#333333] my-1" />
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">▶ Filter by Industry</div>
                        {availableIndustries.map(industry => {
                          // Find the first cost code to get the industry icon
                          const industryCode = costCodes.find(c => c.industry?.id === industry.id);
                          const icon = industryCode?.industry?.icon || '';
                          
                          return (
                            <button
                              key={industry.id}
                              onClick={() => {
                                setSelectedIndustry(industry.id);
                                setShowFilterMenu(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#333333] flex items-center justify-between group"
                            >
                              <span className={`flex items-center gap-2 ${selectedIndustry === industry.id ? 'font-medium text-[#336699]' : ''}`}>
                                {icon && <span className="text-base">{icon}</span>}
                                {industry.name}
                              </span>
                              <span className="text-gray-400 text-xs bg-[#333333] px-2 py-1 rounded group-hover:bg-[#444444]">
                                {industry.count} codes
                              </span>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Search Input */}
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cost codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1E1E1E] border border-[#333333] pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-full"
                />
              </div>
            </div>

            {/* Right side - View toggle and actions */}
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <select
                className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field as 'code' | 'name' | 'items');
                  setSortDirection(direction as 'asc' | 'desc');
                }}
              >
                <option value="code-asc" className="bg-[#1E1E1E] text-white">Code (A-Z)</option>
                <option value="code-desc" className="bg-[#1E1E1E] text-white">Code (Z-A)</option>
                <option value="name-asc" className="bg-[#1E1E1E] text-white">Name (A-Z)</option>
                <option value="name-desc" className="bg-[#1E1E1E] text-white">Name (Z-A)</option>
                <option value="items-desc" className="bg-[#1E1E1E] text-white">Most Items</option>
                <option value="items-asc" className="bg-[#1E1E1E] text-white">Least Items</option>
              </select>
              
              {/* Expand/Collapse All button */}
              <button
                onClick={() => {
                  if (expandedIndustries.size === 0) {
                    // Expand all
                    const allIndustries = new Set(Array.from(groupedFilteredCostCodes.keys()));
                    setExpandedIndustries(allIndustries);
                  } else {
                    // Collapse all
                    setExpandedIndustries(new Set());
                  }
                }}
                className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
              >
                {expandedIndustries.size === 0 ? (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Expand All
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Collapse All
                  </>
                )}
              </button>
              
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
                  className="text-[#336699] hover:text-[#4A7BB7] transition-colors text-sm flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to {selectedCostCode.industry?.name || 'Cost Codes'}
                </button>
                <span className="text-gray-600">&gt;</span>
                <span className="text-white font-medium">
                  {selectedCostCode.code} • {selectedCostCode.name}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {loadingLineItems ? 'Loading...' : `${lineItems.length} items`}
              </div>
            </div>

            {/* Industry Context Bar */}
            <div className="px-6 py-3 bg-[#1E1E1E] border-b border-[#333333] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {selectedCostCode.industry?.name && (
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {selectedCostCode.industry.name}
                    </span>
                  )}
                  {selectedCostCode.category && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        selectedCostCode.category === 'labor' ? 'bg-blue-400/20 text-blue-400' :
                        selectedCostCode.category === 'material' ? 'bg-green-400/20 text-green-400' :
                        selectedCostCode.category === 'equipment' ? 'bg-yellow-400/20 text-yellow-400' :
                        selectedCostCode.category === 'subcontractor' ? 'bg-purple-400/20 text-purple-400' :
                        'bg-orange-400/20 text-orange-400'
                      }`}>
                        {selectedCostCode.category.charAt(0).toUpperCase() + selectedCostCode.category.slice(1)}
                      </span>
                    </>
                  )}
                  {selectedCostCode.organization_id && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs px-2 py-0.5 bg-[#336699]/20 text-[#336699] rounded">
                        Custom
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {navigationContext && (
                  <>
                    <span className="text-xs text-gray-500">
                      {navigationContext.currentIndex + 1} of {navigationContext.totalCount}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigationContext.previous && handleCostCodeClick(navigationContext.previous)}
                        disabled={!navigationContext.previous}
                        className={`p-1 rounded transition-colors ${
                          navigationContext.previous 
                            ? 'text-gray-400 hover:bg-[#333333] hover:text-white' 
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                        title={navigationContext.previous ? `Previous: ${navigationContext.previous.name}` : 'No previous code'}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigationContext.next && handleCostCodeClick(navigationContext.next)}
                        disabled={!navigationContext.next}
                        className={`p-1 rounded transition-colors ${
                          navigationContext.next 
                            ? 'text-gray-400 hover:bg-[#333333] hover:text-white' 
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                        title={navigationContext.next ? `Next: ${navigationContext.next.name}` : 'No next code'}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Line Items Content */}
            <div className="bg-[#0A0A0A]">
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
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading cost codes...</div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View - Grouped by Industry with Accordion */
          <div>
            {Array.from(groupedFilteredCostCodes.entries()).map(([industryName, codes], index) => {
              const isExpanded = expandedIndustries.has(industryName);
              const itemCount = codes.reduce((sum, code) => sum + (costCodeItemCounts[code.id] || 0), 0);
              
              return (
                <div key={industryName} className="border-b border-[#333333] last:border-b-0">
                  {/* Industry Header - Clickable */}
                  <button
                    onClick={() => toggleIndustryExpanded(industryName)}
                    className="w-full px-6 py-4 bg-[#1A1A1A] hover:bg-[#222222] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {industryName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {codes.length} codes • {itemCount} items
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isExpanded && (
                        <label className="flex items-center gap-2 text-sm text-gray-400 mr-4">
                          <input
                            type="checkbox"
                            checked={codes.every(code => selectedCostCodes.has(code.id))}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                // Select all codes in this industry
                                const newSelected = new Set(selectedCostCodes);
                                codes.forEach(code => newSelected.add(code.id));
                                setSelectedCostCodes(newSelected);
                              } else {
                                // Deselect all codes in this industry
                                const newSelected = new Set(selectedCostCodes);
                                codes.forEach(code => newSelected.delete(code.id));
                                setSelectedCostCodes(newSelected);
                              }
                            }}
                            className="w-4 h-4 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          Select all
                        </label>
                      )}
                      <div className="text-sm text-gray-400 group-hover:text-gray-300">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    </div>
                  </button>
                  
                  {/* Cost Codes for this Industry - Only show when expanded */}
                  {isExpanded && (
                    <div className="divide-y divide-[#333333]">
                      {codes.map((code) => (
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
                  ))}
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact View - Grouped by Industry with Accordion */
          <div className="">
            {Array.from(groupedFilteredCostCodes.entries()).map(([industryName, codes]) => {
              const isExpanded = expandedIndustries.has(industryName);
              const itemCount = codes.reduce((sum, code) => sum + (costCodeItemCounts[code.id] || 0), 0);
              
              return (
                <div key={industryName} className="border-b border-[#333333] last:border-b-0">
                  {/* Industry Header - Clickable */}
                  <button
                    onClick={() => toggleIndustryExpanded(industryName)}
                    className="w-full px-6 py-4 bg-[#1A1A1A] hover:bg-[#222222] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        {industryName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {codes.length} codes • {itemCount} items
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {isExpanded && (
                        <label className="flex items-center gap-2 text-sm text-gray-400 mr-4">
                          <input
                            type="checkbox"
                            checked={codes.every(code => selectedCostCodes.has(code.id))}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                // Select all codes in this industry
                                const newSelected = new Set(selectedCostCodes);
                                codes.forEach(code => newSelected.add(code.id));
                                setSelectedCostCodes(newSelected);
                              } else {
                                // Deselect all codes in this industry
                                const newSelected = new Set(selectedCostCodes);
                                codes.forEach(code => newSelected.delete(code.id));
                                setSelectedCostCodes(newSelected);
                              }
                            }}
                            className="w-4 h-4 bg-[#1E1E1E] border-[#333333] text-[#336699] focus:ring-[#336699]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          Select all
                        </label>
                      )}
                      <div className="text-sm text-gray-400 group-hover:text-gray-300">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    </div>
                  </button>
                  
                  {/* Cost Code Grid for this Industry - Only show when expanded */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {codes.map((code) => (
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
                  ))}
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
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
      
      {/* Add Cost Code Modal */}
      <Modal
        isOpen={showNewCostCodeModal}
        onClose={() => setShowNewCostCodeModal(false)}
        title="Add Cost Code"
        size="md"
      >
        <CostCodeForm
          onSubmit={async (data) => {
            await CostCodeService.create({
              name: data.name,
              code: data.code,
              description: data.description,
              category: data.category as 'labor' | 'material' | 'equipment' | 'subcontractor' | 'service',
              industry_id: data.industry_id,
              organization_id: selectedOrg?.id,
              is_active: true
            });
            
            setShowNewCostCodeModal(false);
            await loadCostCodes();
          }}
          onCancel={() => setShowNewCostCodeModal(false)}
          submitLabel="Add Cost Code"
        />
      </Modal>
    </div>
  );
}