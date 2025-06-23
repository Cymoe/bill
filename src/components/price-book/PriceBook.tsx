import { useState, useEffect, useMemo, useRef } from 'react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { LineItemForm } from './LineItemForm';
import { LineItemModal } from '../modals/LineItemModal';
import { EditLineItemModal } from '../modals/EditLineItemModal';
import { LineItemService } from '../../services/LineItemService';
import { IndustryService } from '../../services/IndustryService';
import { CostCodeService } from '../../services/CostCodeService';
import { LineItem, Industry } from '../../types';
import { MoreVertical, Filter, ChevronDown, ChevronRight, Plus, Copy, Star, Trash2, Edit3, Calculator, Search, Upload, Download, FileText, List, LayoutGrid, Settings, Columns, FileSpreadsheet, Tag } from 'lucide-react';
import { PageHeaderBar } from '../common/PageHeaderBar';
import './price-book.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import React from 'react';
import { CostCodeExportService } from '../../services/CostCodeExportService';

// Using LineItem interface from types instead of local Product interface



// Add TypeScript declaration for the window object
declare global {
  interface Window {
    openLineItemModal?: () => void;
  }
}

export const PriceBook: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { } = React.useContext(LayoutContext);
  const { selectedOrg } = React.useContext(OrganizationContext);
  const [showNewLineItemModal, setShowNewLineItemModal] = useState(false);
  const [showEditLineItemModal, setShowEditLineItemModal] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<LineItem | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const [selectedLineItem, setSelectedLineItem] = useState<LineItem | null>(null);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClosingDropdown, setIsClosingDropdown] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [trades, setTrades] = useState<{ id: string; name: string; code: string; industry?: { id: string; name: string; icon?: string; color?: string } }[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('all');
  const [groupedTrades, setGroupedTrades] = useState<Map<string, typeof trades>>(new Map());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('all');
  const [condensed, setCondensed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pricebook-condensed') === 'true';
    }
    return false;
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [viewMode, setViewMode] = useState<'expanded' | 'condensed'>('expanded');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCostCodes, setIsLoadingCostCodes] = useState(true);
  const [activeIndustries, setActiveIndustries] = useState<Industry[]>([]);
  
  // Add state for expanded industries - all collapsed by default
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  
  // Function to toggle industry expansion
  const toggleIndustryExpansion = (industryName: string) => {
    setExpandedIndustries((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(industryName)) {
        newSet.delete(industryName);
      } else {
        newSet.add(industryName);
      }
      return newSet;
    });
  };
  
  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';
  
  const togglePriceSort = () => {
    setPriceSort(priceSort === 'asc' ? 'desc' : 'asc');
  };
  
  const handleEditLineItem = (lineItem: LineItem) => {
    setEditingLineItem(lineItem);
    setShowEditLineItemModal(true);
  };

  const handleSaveEdit = async (data: Partial<LineItem>) => {
    try {
      if (!editingLineItem?.id) return;
      
      await LineItemService.update(editingLineItem.id, data);
      
      setShowEditLineItemModal(false);
      setEditingLineItem(null);
      await fetchLineItems();
    } catch (error) {
      console.error('Error updating line item:', error);
    }
  };

  const handleToggleFavorite = async (lineItem: LineItem) => {
    try {
      await LineItemService.update(lineItem.id, {
        favorite: !lineItem.favorite
      });
      await fetchLineItems();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToEstimate = async (lineItem: LineItem) => {
    // TODO: Implement add to estimate functionality
    console.log('Add to estimate:', lineItem);
  };

  const handleDeleteLineItem = async (lineItem: LineItem) => {
    if (confirm('Are you sure you want to delete this line item?')) {
      try {
        await LineItemService.delete(lineItem.id);
        await fetchLineItems();
      } catch (error) {
        console.error('Error deleting line item:', error);
      }
    }
  };

  const handleDuplicateLineItem = async (lineItem: LineItem) => {
    try {
      await LineItemService.create({
        name: `${lineItem.name} (Copy)`,
        description: lineItem.description,
        price: lineItem.price,
        unit: lineItem.unit,
        category: lineItem.category,
        user_id: user?.id || '',
        organization_id: selectedOrg?.id || '',
        status: lineItem.status,
        favorite: false,
        vendor_id: lineItem.vendor_id,
        cost_code_id: lineItem.cost_code_id
      });

      await fetchLineItems();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error duplicating line item:', error);
    }
  };


  // Functions for the new menu options
  const handleImportItems = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedOrg?.id || !user?.id) return;
      
      try {
        const result = await CostCodeExportService.importFromFile(file, selectedOrg.id, user.id);
        
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
          alert(`Import completed with errors:\n- ${result.success} items imported successfully\n- ${result.errors.length} errors\n\nCheck console for details.`);
        } else {
          alert(`Successfully imported ${result.success} items!`);
        }
        
        // Refresh the line items list
        await fetchLineItems();
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Failed to import file. Please check the format and try again.');
      }
    };
    input.click();
  };

  const handleExportToCSV = async () => {
    try {
      await CostCodeExportService.exportToCSV(filteredLineItems, trades);
      console.log('CSV export completed');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV');
    }
  };

  const handleExportToExcel = async () => {
    try {
      await CostCodeExportService.exportToExcel(filteredLineItems, trades);
      console.log('Excel export completed');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const handlePrintPriceBook = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cost Codes - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .type-material { color: #3b82f6; }
          .type-labor { color: #10b981; }
          .type-equipment { color: #f97316; }
          .type-service { color: #06b6d4; }
          .type-subcontractor { color: #a855f7; }
          .type-permits { color: #eab308; }
          .type-other { color: #6b7280; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Cost Codes</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Items: ${filteredLineItems.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Cost Code</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Price</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLineItems.map(lineItem => {
              const trade = trades.find(t => t.id === lineItem.cost_code_id);
              const costCodeDisplay = trade ? `${trade.code} ${trade.name}` : (lineItem.cost_code ? `${lineItem.cost_code.code} ${lineItem.cost_code.name}` : '—');
              return `
                <tr>
                  <td>${costCodeDisplay}</td>
                  <td>${lineItem.name}</td>
                  <td>${lineItem.description || ''}</td>
                  <td class="type-${lineItem.category}">${lineItem.category || ''}</td>
                  <td>${formatCurrency(lineItem.price)}</td>
                  <td>${lineItem.unit}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer;">
          Print
        </button>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      
      // Handle dropdown outside clicks
      const target = event.target as HTMLElement;
      const isDropdownContent = dropdownRef.current && dropdownRef.current.contains(target);
      const isThreeDotsButton = target.closest('button')?.querySelector('.lucide-more-vertical');
      
      if (!isDropdownContent && !isThreeDotsButton && activeDropdown) {
        setIsClosingDropdown(true);
        setActiveDropdown(null);
        // Reset the flag after a short delay
        setTimeout(() => setIsClosingDropdown(false), 100);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (selectedOrg?.id) {
      fetchLineItems();
    }
  }, [user?.id, selectedOrg?.id]);

  const fetchActiveIndustries = async () => {
    try {
      if (!selectedOrg?.id) return;
      
      const industries = await IndustryService.getOrganizationIndustries(selectedOrg.id);
      setActiveIndustries(industries);
    } catch (error) {
      console.error('Error fetching active industries:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      setIsLoadingCostCodes(true);
      console.log('Fetching cost codes for organization:', selectedOrg?.id);
      
      if (!selectedOrg?.id) {
        console.log('No organization selected, skipping cost codes fetch');
        setTrades([]);
        return;
      }

      // Use our industry-aware CostCodeService
      const data = await CostCodeService.list(selectedOrg.id);
      console.log('Industry-filtered cost codes fetched:', data?.length || 0);
      setTrades(data || []);
      
      // Also get grouped version for dropdown
      const grouped = await CostCodeService.listGroupedByIndustry(selectedOrg.id);
      setGroupedTrades(grouped);
    } catch (err) {
      console.error('Error in fetchTrades:', err);
      setTrades([]);
    } finally {
      setIsLoadingCostCodes(false);
    }
  };

  const fetchLineItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== FETCH LINE ITEMS DEBUG START ===');
      console.log('Current organization:', {
        id: selectedOrg?.id,
        name: selectedOrg?.name,
        industry: selectedOrg?.industry,
        industry_id: (selectedOrg as any)?.industry_id || 'not set'
      });
      
      if (!selectedOrg?.id) {
        console.error('No organization selected');
        setError('No organization selected');
        setIsLoading(false);
        return;
      }
      
      // Fetch active industries first
      console.log('Fetching active industries...');
      await fetchActiveIndustries();
      
      // Fetch cost codes filtered by industries
      console.log('Fetching cost codes...');
      await fetchTrades();
      
      // Use LineItemService to fetch line items (now filtered by industries)
      console.log('Calling LineItemService.list() for org:', selectedOrg.id);
      const data = await LineItemService.list(selectedOrg.id);
      
      console.log('Line items response:', {
        totalCount: data?.length || 0,
        hasData: !!data && data.length > 0,
        isEmpty: !data || data.length === 0
      });
      
      // Debug: group by organization_id and industry_id
      if (data && data.length > 0) {
        const orgBreakdown: any = {};
        const industryBreakdown: any = {};
        
        data.forEach(item => {
          const orgKey = item.organization_id || 'template';
          const indKey = item.industry_id || 'none';
          
          orgBreakdown[orgKey] = (orgBreakdown[orgKey] || 0) + 1;
          industryBreakdown[indKey] = (industryBreakdown[indKey] || 0) + 1;
        });
        
        console.log('Items by organization_id:', orgBreakdown);
        console.log('Items by industry_id:', industryBreakdown);
        console.log('Sample items (first 3):', data.slice(0, 3).map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          organization_id: item.organization_id,
          industry_id: item.industry_id,
          cost_code_id: item.cost_code_id,
          price: item.price
        })));
      } else {
        console.log('NO LINE ITEMS RETURNED');
      }
      
      console.log('=== FETCH LINE ITEMS DEBUG END ===');
      
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
      console.error('Error details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load line items');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get the cost code for a line item
  const getTrade = (lineItem: LineItem): string => {
    if (!lineItem.cost_code_id) return '—';
    
    // Check if cost_code is already populated from the service
    if (lineItem.cost_code) {
      return `${lineItem.cost_code.code} ${lineItem.cost_code.name}`;
    }
    
    // Fall back to searching in trades array
    const trade = trades.find(t => t.id === lineItem.cost_code_id);
    if (!trade) return '—';
    
    return `${trade.code} ${trade.name}`;
  };
  

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase.from('vendors').select('*').order('name');
      if (!error && data) setVendors(data);
    };
    fetchVendors();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredLineItems = useMemo(() => {
    let filtered = [...lineItems];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.status === selectedStatus);
    }
    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(lineItem => lineItem.favorite);
    }
    // Date added/updated filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (selectedDateRange === '7d') cutoff.setDate(now.getDate() - 7);
      if (selectedDateRange === '30d') cutoff.setDate(now.getDate() - 30);
      filtered = filtered.filter(lineItem =>
        new Date(lineItem.updated_at || lineItem.created_at || '') >= cutoff
      );
    }
    // Vendor filter
    if (selectedVendorId !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.vendor_id === selectedVendorId);
    }

    // Filter by cost_code_id (if not 'all')
    if (selectedTradeId !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.cost_code_id === selectedTradeId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lineItem => {
        return (
          lineItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lineItem.description && lineItem.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.category?.toLowerCase() === activeCategory);
    }

    // Apply price filter
    if (minPrice !== '') {
      filtered = filtered.filter(lineItem => lineItem.price >= parseFloat(minPrice));
    }

    if (maxPrice !== '') {
      filtered = filtered.filter(lineItem => lineItem.price <= parseFloat(maxPrice));
    }

    // Apply unit filter
    if (selectedUnit !== 'any') {
      filtered = filtered.filter(lineItem => lineItem.unit.toLowerCase() === selectedUnit.toLowerCase());
    }

    // Sort by price
    return filtered.sort((a, b) => {
      if (priceSort === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }, [lineItems, selectedStatus, showFavoritesOnly, selectedDateRange, selectedVendorId, selectedTradeId, searchTerm, activeCategory, minPrice, maxPrice, selectedUnit, priceSort]);
  
  // Group filtered line items by industry
  const groupedLineItems = useMemo(() => {
    const grouped = new Map<string, typeof filteredLineItems>();
    
    filteredLineItems.forEach(item => {
      // Find the cost code for this item to get industry info
      const costCode = trades.find(t => t.id === item.cost_code_id);
      const industryName = costCode?.industry?.name || 'Unknown Industry';
      
      if (!grouped.has(industryName)) {
        grouped.set(industryName, []);
      }
      grouped.get(industryName)!.push(item);
    });
    
    // Sort industries alphabetically
    return new Map([...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filteredLineItems, trades]);

  useEffect(() => {
    localStorage.setItem('pricebook-condensed', String(condensed));
  }, [condensed]);

  return (
    <div className="bg-transparent border border-[#333333] border-t-0">
      {/* Stats Section */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL ITEMS</div>
            <div className="text-lg font-semibold mt-1">{lineItems.length}</div>
            <div className="text-xs text-gray-500">({formatCurrency(lineItems.reduce((sum, item) => sum + item.price, 0))})</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">QUOTED LAST 30 DAYS</div>
            <div className="text-lg font-semibold mt-1">127</div>
            <div className="text-xs text-gray-500">(items quoted)</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">RECENTLY UPDATED</div>
            <div className="text-lg font-semibold mt-1">45</div>
            <div className="text-xs text-gray-500">(last 7 days)</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">NEEDS REVIEW</div>
            <div className="text-lg font-semibold text-[#F9D71C] mt-1">12</div>
            <div className="text-xs text-gray-500">(outdated pricing)</div>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="border-t border-[#333333] px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {['All', 'Material', 'Labor', 'Equipment', 'Service', 'Subcontractor', 'Permits', 'Other'].map((category) => {
            const getCategoryColor = (cat: string, isActive: boolean) => {
              if (!isActive) {
                return 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]';
              }
              
              switch (cat.toLowerCase()) {
                case 'all':
                  return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                case 'material':
                  return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                case 'labor':
                  return 'bg-green-500/20 text-green-300 border border-green-500/30';
                case 'equipment':
                  return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
                case 'service':
                  return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
                case 'subcontractor':
                  return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
                case 'permits':
                  return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
                case 'other':
                  return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
                default:
                  return 'bg-[#1E1E1E] text-gray-300 border border-[#555555]';
              }
            };
            
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category.toLowerCase())}
                className={`px-3 py-1.5 text-xs rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  getCategoryColor(category, activeCategory === category.toLowerCase())
                }`}
              >
                <div className="flex flex-col items-center">
                  <span>{category}</span>
                  <span className="text-xs opacity-70">({category === 'All' ? lineItems.length : lineItems.filter(item => item.category?.toLowerCase() === category.toLowerCase()).length})</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Controls */}
      <div className="border-t border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Filters */}
          <div className="flex items-center gap-3">
            <select
              className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
              value={selectedTradeId}
              onChange={(e) => setSelectedTradeId(e.target.value)}
            >
              <option value="all" className="bg-[#1E1E1E] text-white">All Cost Codes ({lineItems.length})</option>
              {Array.from(groupedTrades.entries()).map(([industryName, codes]) => (
                <optgroup 
                  key={industryName} 
                  label={`━━━  ${industryName.toUpperCase()}  ━━━`}
                  className="bg-[#1E1E1E] text-gray-400 font-bold"
                >
                  {codes.map(trade => (
                    <option 
                      key={trade.id} 
                      value={trade.id} 
                      className="bg-[#1E1E1E] text-white pl-4"
                    >
                      {trade.code} — {trade.name} ({lineItems.filter(item => item.cost_code_id === trade.id).length})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>

              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] p-4">
                  <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Status
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Vendor Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Vendor
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                      >
                        <option value="all">All Vendors</option>
                        {vendors.map(vendor => (
                          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Favorites Toggle */}
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showFavoritesOnly}
                          onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-[#336699] bg-[#333333] border-[#555555] focus:ring-[#336699]"
                        />
                        <span className="text-sm text-white">Show favorites only</span>
                      </label>
                    </div>

                    {/* Clear Filters */}
                    <div className="pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          setActiveCategory('all');
                          setSelectedStatus('all');
                          setSelectedTradeId('all');
                          setSelectedVendorId('all');
                          setMinPrice('');
                          setMaxPrice('');
                          setShowFavoritesOnly(false);
                          setSelectedDateRange('all');
                          setShowFilterMenu(false);
                        }}
                        className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 text-sm font-medium transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - View options */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCondensed(!condensed)}
              className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
              title="Toggle compact view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] py-2">
                  <button
                    onClick={handleImportItems}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Items
                  </button>
                  <div className="border-t border-[#333333] my-1" />
                  <button
                    onClick={handleExportToCSV}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export to CSV
                  </button>
                  <button
                    onClick={handleExportToExcel}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export to Excel
                  </button>
                  <div className="border-t border-[#333333] my-1" />
                  <button
                    onClick={handlePrintPriceBook}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Print Cost Codes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="border-t border-[#333333] px-6 py-3 bg-[#1E1E1E]/50">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider items-center">
          <div className="col-span-3">COST CODE</div>
          <div className="col-span-5">ITEM</div>
          <div className="col-span-3 text-right">PRICE</div>
          <div className="col-span-1 text-right"></div>
        </div>
      </div>
      
      {/* Table Content */}
      <div className="border-t border-[#333333]">
        {(isLoading || isLoadingCostCodes) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-8 h-8 border-2 border-[#336699] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">{isLoadingCostCodes ? 'Loading cost codes...' : 'Loading items...'}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Cost Codes</h3>
            <p className="text-gray-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchLineItems()}
              className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-[8px] font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredLineItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[#333333] rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No cost code items yet</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            Start building your cost codes by adding materials, labor, and services. This will help you create accurate estimates and invoices.
          </p>
          <button
            onClick={() => setShowNewLineItemModal(true)}
              className="bg-white hover:bg-gray-100 text-[#121212] px-6 py-3 rounded-[4px] font-medium transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
          <div>
          {Array.from(groupedLineItems.entries()).map(([industryName, items]) => {
            // Find industry details from first item's cost code
            const firstItemCostCode = trades.find(t => t.id === items[0]?.cost_code_id);
            const industryIcon = firstItemCostCode?.industry?.icon || '';
            
            return (
              <div key={industryName}>
                {/* Industry Header - Clickable */}
                <div 
                  className="px-6 py-3 bg-[#1A1A1A] border-y border-[#333333] sticky top-0 z-10 hover:bg-[#222222] cursor-pointer transition-colors"
                  onClick={() => toggleIndustryExpansion(industryName)}
                >
                  <div className="flex items-center gap-2">
                    {/* Chevron icon for expand/collapse */}
                    {expandedIndustries.has(industryName) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    
                    {industryIcon && <span className="text-lg">{industryIcon}</span>}
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      {industryName}
                    </h3>
                    <span className="text-xs text-gray-500">({items.length} items)</span>
                  </div>
                </div>
                
                {/* Line Items for this Industry - Only show when expanded */}
                {expandedIndustries.has(industryName) && items.map((lineItem) => (
            <div
              key={lineItem.id}
              onClick={() => {
                // Don't open edit modal if dropdown is active or just closed
                if (activeDropdown || isClosingDropdown) {
                  if (activeDropdown) setActiveDropdown(null);
                  return;
                }
                handleEditLineItem(lineItem);
              }}
                className={`grid grid-cols-12 gap-4 px-6 ${condensed ? 'py-2' : 'py-4'} items-center hover:bg-[#1A1A1A] transition-colors cursor-pointer border-b border-[#333333]/50 last:border-b-0 group`}
              >
                {/* Cost Code Column */}
                <div className={`col-span-3 ${condensed ? 'text-xs' : 'text-sm'} text-gray-300`}>
                  {condensed ? (
                    <div className="truncate text-xs" title={getTrade(lineItem)}>
                      {getTrade(lineItem)}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {(() => {
                        const trade = getTrade(lineItem);
                        const parts = trade.split(' ');
                        const code = parts[0]; // e.g., "24.00"
                        const name = parts.slice(1).join(' '); // e.g., "General Construction"
                        
                        return (
                          <>
                            <div className="font-mono text-xs text-gray-500">{code}</div>
                            <div 
                              className="text-sm font-medium truncate"
                              title={name} // Tooltip with full name
                            >
                              {name}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                  
                {/* Item Column */}
                <div className="col-span-5">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`font-medium text-gray-100 truncate ${condensed ? 'text-sm' : ''}`}>{lineItem.name}</div>
                        <div 
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            lineItem.category === 'material' ? 'bg-blue-400' :
                            lineItem.category === 'labor' ? 'bg-green-400' :
                            lineItem.category === 'equipment' ? 'bg-orange-400' :
                            lineItem.category === 'service' ? 'bg-cyan-400' :
                            lineItem.category === 'subcontractor' ? 'bg-purple-400' :
                            lineItem.category === 'permits' ? 'bg-yellow-400' :
                            lineItem.category === 'other' ? 'bg-gray-400' :
                            'bg-gray-400'
                          }`}
                          title={lineItem.category === 'subcontractor' ? 'subcontractor' : lineItem.category}
                        />
                      </div>
                      {!condensed && lineItem.description && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">{lineItem.description}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Column */}
                <div className="col-span-3 text-right">
                  <div className={`font-mono font-semibold text-gray-100 ${condensed ? 'text-sm' : ''}`}>
                    {formatCurrency(lineItem.price)}
                  </div>
                  {!condensed && <div className="text-xs text-gray-400 capitalize">{lineItem.unit}</div>}
                </div>

                {/* Actions Column */}
                <div className="col-span-1 text-right relative">
                  <button
                  onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    
                    if (activeDropdown === lineItem.id) {
                      setActiveDropdown(null);
                    } else {
                      setActiveDropdown(lineItem.id);
                    }
                  }}
                    className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                {/* Dropdown Menu */}
                {activeDropdown === lineItem.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-8 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1"
                  >
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLineItem(lineItem);
                        setActiveDropdown(null);
                      }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                      Edit Item
                  </button>
                    
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateLineItem(lineItem);
                      }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors"
                  >
                      <Copy className="w-4 h-4 mr-3 text-gray-400" />
                      Duplicate
                  </button>
                    
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(lineItem);
                      }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors"
                  >
                      <Star className={`w-4 h-4 mr-3 ${lineItem.favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                      {lineItem.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                    
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToEstimate(lineItem);
                      }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors"
                  >
                      <Calculator className="w-4 h-4 mr-3 text-[#F9D71C]" />
                      Add to Current Estimate
                  </button>
                    
                    <div className="border-t border-[#333333] my-1" />
                    
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLineItem(lineItem);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#333333] transition-colors"
                  >
                      <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                      Delete
                  </button>
                </div>
                )}
              </div>
            </div>
          ))}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Create Line Item Modal */}
      <Modal
        isOpen={showNewLineItemModal}
          onClose={() => setShowNewLineItemModal(false)}
        title="Add Line Item"
        size="md"
      >
        <LineItemForm
          onSubmit={async (data) => {
            try {
              await LineItemService.create({
                name: data.name,
                description: data.description,
                price: data.price,
                unit: data.unit,
                category: data.type, // Map 'type' from form to 'category' in database
                cost_code_id: data.cost_code_id || undefined,
                user_id: user?.id || '',
                organization_id: selectedOrg?.id || '',
                status: 'published',
                favorite: false
              });
              
              setShowNewLineItemModal(false);
              await fetchLineItems();
            } catch (error) {
              console.error('Error creating line item:', error);
            }
          }}
          onCancel={() => setShowNewLineItemModal(false)}
          submitLabel="Add Item"
        />
      </Modal>

      {/* Edit Line Item Drawer */}
      <SlideOutDrawer
        isOpen={showEditLineItemModal}
          onClose={() => {
            setShowEditLineItemModal(false);
            setEditingLineItem(null);
          }}
        title="Edit Line Item"
        width="md"
      >
        {editingLineItem && (
          <LineItemForm
            onSubmit={async (data: { name: string; description: string; price: number; unit: string; category: string; cost_code_id: string }) => {
              await handleSaveEdit(data);
            }}
            onCancel={() => {
              setShowEditLineItemModal(false);
              setEditingLineItem(null);
            }}
            initialData={editingLineItem}
            submitLabel="Save Changes"
          />
        )}
      </SlideOutDrawer>
      </div>
  );
};

export default PriceBook;