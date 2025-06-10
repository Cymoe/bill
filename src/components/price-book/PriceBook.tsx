import { useState, useEffect, useMemo, useRef } from 'react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { LineItemForm } from './LineItemForm';
import { LineItemModal } from '../modals/LineItemModal';
import { EditLineItemModal } from '../modals/EditLineItemModal';
import { MoreVertical, Filter, ChevronDown, Plus, Copy, Star, Trash2, Edit3, Calculator, Search, Upload, Download, FileText, List, LayoutGrid, Settings, Columns } from 'lucide-react';
import { PageHeaderBar } from '../common/PageHeaderBar';
import './price-book.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutContext } from '../layouts/DashboardLayout';
import React from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id: string;
  created_at: string;
  type: string;
  cost_code_id?: string;
  status: string;
  favorite: boolean;
  updated_at: string;
  vendor_id: string;
  sku?: string;
}



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
  const { isConstrained, isMinimal, isCompact } = React.useContext(LayoutContext);
  const [showNewLineItemModal, setShowNewLineItemModal] = useState(false);
  const [showEditLineItemModal, setShowEditLineItemModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClosingDropdown, setIsClosingDropdown] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [trades, setTrades] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('all');
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
  
  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';
  
  const togglePriceSort = () => {
    setPriceSort(priceSort === 'asc' ? 'desc' : 'asc');
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditLineItemModal(true);
  };

  const handleSaveEdit = async (data: Partial<Product>) => {
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          unit: data.unit,
          type: data.type,
          cost_code_id: data.cost_code_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      setShowEditLineItemModal(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: `${product.name} (Copy)`,
          description: product.description,
          price: product.price,
          unit: product.unit,
          type: product.type,
          user_id: user?.id,
          status: product.status,
          favorite: false,
          vendor_id: product.vendor_id,
          cost_code_id: product.cost_code_id
        });

      if (error) throw error;
      await fetchProducts();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error duplicating product:', error);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      await fetchProducts();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleFavorite = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ favorite: !product.favorite })
        .eq('id', product.id);

      if (error) throw error;
      await fetchProducts();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleAddToEstimate = async (product: Product) => {
    try {
      // Create a new draft invoice/estimate with this product
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user?.id,
          client_id: null, // Will be set later
          amount: product.price,
          status: 'draft',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: null
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Add the product as an invoice item
      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert({
          invoice_id: invoice.id,
          product_id: product.id,
          description: product.description,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price
        });

      if (itemError) throw itemError;

      setActiveDropdown(null);
      
      // Navigate to the invoice/estimate page
      navigate(`/invoices?new=${invoice.id}`);
      
    } catch (error) {
      console.error('Error adding to estimate:', error);
      alert('Failed to add item to estimate. Please try again.');
    }
  };

  // Functions for the new menu options
  const handleImportItems = () => {
    // TODO: Implement import functionality
    console.log('Import items clicked');
  };

  const handleExportToCSV = () => {
    // TODO: Implement export to CSV functionality
    console.log('Export to CSV clicked');
  };

  const handlePrintPriceBook = () => {
    // TODO: Implement print cost codes functionality
    console.log('Print cost codes clicked');
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
    fetchProducts();
  }, [user?.id]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching line items for user:', user?.id);
      
      // Only fetch products that are NOT base products (i.e., they are line items)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .or('is_base_product.is.null,is_base_product.eq.false')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Line items fetched:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load line items');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get the cost code for a product
  const getTrade = (product: Product): string => {
    if (!product.cost_code_id) return '—';
    
    const trade = trades.find(t => t.id === product.cost_code_id);
    if (!trade) return '—';
    
    return `${trade.code} ${trade.name}`;
  };
  
  // Fetch trades from DB
  useEffect(() => {
    const fetchTrades = async () => {
      const { data, error } = await supabase
        .from('cost_codes')
        .select('id, name, code')
        .order('code');
      if (!error && data) setTrades(data);
    };
    fetchTrades();
  }, []);

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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }
    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(product => product.favorite);
    }
    // Date added/updated filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (selectedDateRange === '7d') cutoff.setDate(now.getDate() - 7);
      if (selectedDateRange === '30d') cutoff.setDate(now.getDate() - 30);
      filtered = filtered.filter(product =>
        new Date(product.updated_at || product.created_at) >= cutoff
      );
    }
    // Vendor filter
    if (selectedVendorId !== 'all') {
      filtered = filtered.filter(product => product.vendor_id === selectedVendorId);
    }

    // Filter by cost_code_id (if not 'all')
    if (selectedTradeId !== 'all') {
      filtered = filtered.filter(product => product.cost_code_id === selectedTradeId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const sku = product.sku || '';
        return (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.type.toLowerCase() === activeCategory);
    }

    // Apply price filter
    if (minPrice !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(minPrice));
    }

    if (maxPrice !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(maxPrice));
    }

    // Apply unit filter
    if (selectedUnit !== 'any') {
      filtered = filtered.filter(product => product.unit.toLowerCase() === selectedUnit.toLowerCase());
    }

    // Sort by price
    return filtered.sort((a, b) => {
      if (priceSort === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }, [products, selectedStatus, showFavoritesOnly, selectedDateRange, selectedVendorId, selectedTradeId, searchTerm, activeCategory, minPrice, maxPrice, selectedUnit, priceSort]);

  useEffect(() => {
    localStorage.setItem('pricebook-condensed', String(condensed));
  }, [condensed]);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <PageHeaderBar 
        title="Cost Codes"
        searchPlaceholder="Search items..."
        onSearch={(query) => setSearchInput(query)}
        searchValue={searchInput}
        addButtonLabel="Add Item"
        onAddClick={() => setShowNewLineItemModal(true)}
      />
      
      {/* Unified Stats + Table Container */}
      <div className="bg-[#333333]/30 border border-[#333333] rounded-[4px]">
        {/* Stats Section */}
        <div className={`${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50 rounded-t-[4px]`}>
          {isMinimal || isConstrained ? (
            // Compact 4-column row for constrained/minimal
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">ITEMS</div>
                <div className="text-base font-semibold mt-1">{products.length}</div>
          </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">QUOTED</div>
                <div className="text-base font-semibold mt-1">127</div>
        </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">UPDATED</div>
                <div className="text-base font-semibold mt-1">45</div>
                      </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">REVIEW</div>
                <div className="text-base font-semibold text-[#F9D71C] mt-1">12</div>
              </div>
            </div>
          ) : (
            // Full 4-column layout for desktop
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL ITEMS</div>
                <div className="text-lg font-semibold mt-1">{products.length}</div>
                <div className="text-xs text-gray-500">({formatCurrency(products.reduce((sum, p) => sum + p.price, 0))})</div>
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
          )}
                    </div>

        {/* Table Controls Header */}
        <div className={`${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
          <div className={`flex items-center justify-between ${isMinimal ? 'gap-2' : 'gap-4'}`}>
            {/* Left side - Filters */}
            <div className={`flex items-center ${isMinimal ? 'gap-2' : 'gap-3'}`}>
              <select
                className={`bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699] ${
                  isMinimal ? 'px-2 py-1.5 text-xs min-w-[120px]' : isConstrained ? 'px-2 py-1.5 text-xs min-w-[140px]' : 'px-3 py-2 text-sm'
                }`}
                value={selectedTradeId}
                onChange={(e) => setSelectedTradeId(e.target.value)}
              >
                <option value="all">All Cost Codes ({products.length})</option>
                {trades.map(trade => (
                  <option key={trade.id} value={trade.id}>
                    {trade.code} {trade.name} ({products.filter(p => p.cost_code_id === trade.id).length})
                  </option>
                ))}
              </select>

              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white hover:bg-[#333333] transition-colors flex items-center gap-2 ${
                    isMinimal ? 'px-2 py-1.5 text-xs' : isConstrained ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                  }`}
                >
                  <Filter className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  {!isMinimal && !isConstrained && 'More Filters'}
                    </button>

                {showFilterMenu && (
                  <div className={`absolute top-full ${isConstrained ? 'right-0' : 'left-0'} mt-2 ${isConstrained ? 'w-56' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-[9999] p-4`}>
                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Status
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
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
                            className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
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
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
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
                            className="form-checkbox h-4 w-4 text-[#336699] bg-[#333333] border-[#555555] rounded focus:ring-[#336699]"
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
                          className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 rounded-[4px] text-sm font-medium transition-colors"
                        >
                          Clear All Filters
                    </button>
                  </div>
                    </div>
                  </div>
                )}
                      </div>
                    </div>

            {/* Right side - Options menu only */}
            <div className="relative" ref={optionsMenuRef}>
            <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 hover:bg-[#333333] rounded-[4px] transition-colors"
            >
                <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333]">
                    Data Management
                    </div>
                  <button
                    onClick={() => {
                      handleImportItems();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Upload className="w-3 h-3 mr-3 text-gray-400" />
                    Import Items
              </button>
                  <button
                    onClick={() => {
                      handleExportToCSV();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Download className="w-3 h-3 mr-3 text-gray-400" />
                    Export to CSV
                    </button>
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333] border-t border-[#333333] mt-1">
                    View Options
                  </div>
                  <button
                    onClick={() => {
                      handlePrintPriceBook();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <FileText className="w-3 h-3 mr-3 text-gray-400" />
                    Print Cost Codes
                  </button>
                </div>
              )}
                  </div>
                </div>
        
          {/* Category Pills */}
          <div className={`flex items-center ${isMinimal ? 'mt-2 pt-2' : 'mt-3 pt-3'} border-t border-[#333333]/50`}>
            <span className={`text-xs text-gray-400 uppercase tracking-wider mr-2 flex-shrink-0 ${isMinimal ? 'hidden' : ''}`}>Categories:</span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 flex-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#336699] text-white'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                All ({products.length})
              </button>
              <button
                onClick={() => setActiveCategory('material')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'material'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `${isMinimal ? 'Mat' : 'Material'} (${products.filter(p => p.type === 'material').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Material</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'material').length})</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setActiveCategory('labor')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'labor'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `${isMinimal ? 'Lab' : 'Labor'} (${products.filter(p => p.type === 'labor').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Labor</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'labor').length})</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setActiveCategory('equipment')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'equipment'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `${isMinimal ? 'Eq' : 'Equipment'} (${products.filter(p => p.type === 'equipment').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Equipment</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'equipment').length})</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setActiveCategory('service')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'service'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `${isMinimal ? 'Svc' : 'Service'} (${products.filter(p => p.type === 'service').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Service</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'service').length})</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setActiveCategory('subcontractor')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'subcontractor'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `Sub (${products.filter(p => p.type === 'subcontractor').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Subcontractor</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'subcontractor').length})</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setActiveCategory('permits')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'permits'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `${isMinimal ? 'Pmt' : 'Permits'} (${products.filter(p => p.type === 'permits').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Permits</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'permits').length})</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setActiveCategory('other')}
                className={`${isMinimal ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'} rounded-[4px] font-medium transition-colors flex-shrink-0 ${
                  activeCategory === 'other'
                    ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#333333] border border-[#555555]'
                }`}
              >
                {isMinimal || isConstrained ? (
                  `Other (${products.filter(p => p.type === 'other').length})`
                ) : (
                  <div className="flex flex-col items-center">
                    <span>Other</span>
                    <span className="text-xs opacity-70">({products.filter(p => p.type === 'other').length})</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Table Column Headers */}
        <div className={`${isMinimal ? 'px-4 py-2' : isConstrained ? 'px-4 py-2' : 'px-6 py-3'} border-b border-[#333333]/50 bg-[#1E1E1E]/50`}>
          <div className={`grid ${isMinimal ? 'grid-cols-8' : isConstrained ? 'grid-cols-8' : 'grid-cols-12'} gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider items-center`}>
            {!isMinimal && !isConstrained && <div className="col-span-2">COST CODE</div>}
            <div className={`${isMinimal ? 'col-span-5' : isConstrained ? 'col-span-5' : 'col-span-6'}`}>ITEM</div>
            <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-2' : 'col-span-3'} text-right`}>PRICE</div>
            <div className={`col-span-1 text-right`}></div>
          </div>
        </div>
        
      {/* Table Content */}
        <div className="overflow-hidden rounded-b-[4px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-2 border-[#336699] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading cost codes...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-400 text-2xl">⚠</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Error Loading Cost Codes</h3>
              <p className="text-gray-400 mb-6 max-w-md">{error}</p>
              <button
                onClick={() => fetchProducts()}
                className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-[8px] font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
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
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  // Don't open edit modal if dropdown is active or just closed
                  if (activeDropdown || isClosingDropdown) {
                    if (activeDropdown) setActiveDropdown(null);
                    return;
                  }
                  handleEditProduct(product);
                }}
                  className={`grid ${isMinimal ? 'grid-cols-8' : isConstrained ? 'grid-cols-8' : 'grid-cols-12'} gap-4 ${isMinimal ? 'px-4 py-3' : isConstrained ? 'px-4 py-3' : 'px-6 py-4'} items-center hover:bg-[#1A1A1A] transition-colors cursor-pointer border-b border-[#333333]/50 last:border-b-0`}
                >
                  {/* Cost Code Column - Hidden in minimal mode */}
                  {!isMinimal && !isConstrained && (
                    <div className="col-span-2 text-sm text-gray-300">
                      {getTrade(product)}
                    </div>
                  )}
                    
                  {/* Item Column */}
                  <div className={`${isMinimal ? 'col-span-5' : isConstrained ? 'col-span-5' : 'col-span-6'}`}>
                    <div className={`flex items-center ${isMinimal ? 'gap-2' : 'gap-3'}`}>
                      <span className={`text-xs px-2 py-1 rounded-[2px] font-medium min-w-[60px] text-center ${
                        product.type === 'material' ? 'bg-blue-500/20 text-blue-300' :
                        product.type === 'labor' ? 'bg-green-500/20 text-green-300' :
                        product.type === 'equipment' ? 'bg-orange-500/20 text-orange-300' :
                        product.type === 'service' ? 'bg-cyan-500/20 text-cyan-300' :
                        product.type === 'subcontractor' ? 'bg-purple-500/20 text-purple-300' :
                        product.type === 'permits' ? 'bg-yellow-500/20 text-yellow-300' :
                        product.type === 'other' ? 'bg-gray-500/20 text-gray-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {product.type === 'subcontractor' ? 'sub' : product.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-gray-100 truncate ${isMinimal ? 'text-sm' : ''}`}>{product.name}</div>
                        {product.description && !isMinimal && !isConstrained && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className={`${isMinimal ? 'col-span-2' : isConstrained ? 'col-span-2' : 'col-span-3'} text-right`}>
                    <div className={`font-mono font-semibold text-gray-100 ${isMinimal ? 'text-sm' : ''}`}>
                      {formatCurrency(product.price)}
                    </div>
                    {!isMinimal && !isConstrained && (
                      <div className="text-xs text-gray-400 capitalize">{product.unit}</div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className={`${isMinimal ? 'col-span-1' : isConstrained ? 'col-span-1' : 'col-span-1'} text-right relative`}>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      
                      if (activeDropdown === product.id) {
                        setActiveDropdown(null);
                      } else {
                        setActiveDropdown(product.id);
                      }
                    }}
                      className={`${isMinimal ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-[2px] hover:bg-[#333333] transition-colors`}
                    >
                      <MoreVertical className={`${isMinimal ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400`} />
                    </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === product.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 top-8 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1"
                    >
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
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
                          handleDuplicateProduct(product);
                        }}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors"
                    >
                        <Copy className="w-4 h-4 mr-3 text-gray-400" />
                        Duplicate
                    </button>
                      
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(product);
                        }}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors"
                    >
                        <Star className={`w-4 h-4 mr-3 ${product.favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                        {product.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                      
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToEstimate(product);
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
                          handleDeleteProduct(product);
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
          )}
        </div>
        </div>

      {/* Create Line Item Modal */}
      <Modal
        isOpen={showNewLineItemModal}
          onClose={() => setShowNewLineItemModal(false)}
        title="Add Line Item"
        size="md"
      >
        <LineItemForm
          onSubmit={async (data: { name: string; description: string; price: number; unit: string; type: string; cost_code_id: string }) => {
            try {
              const { error } = await supabase
                .from('products')
                .insert({
                  ...data,
                  user_id: user?.id,
                  status: 'active',
                  favorite: false,
                  vendor_id: null,
                  cost_code_id: data.cost_code_id || null
                });

              if (error) throw error;
              
            setShowNewLineItemModal(false);
              await fetchProducts();
            } catch (error) {
              console.error('Error creating product:', error);
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
            setEditingProduct(null);
          }}
        title="Edit Line Item"
        width="md"
      >
        {editingProduct && (
          <LineItemForm
            onSubmit={async (data: { name: string; description: string; price: number; unit: string; type: string; cost_code_id: string }) => {
              await handleSaveEdit(data);
            }}
            onCancel={() => {
              setShowEditLineItemModal(false);
              setEditingProduct(null);
            }}
            initialData={editingProduct}
            submitLabel="Save Changes"
          />
        )}
      </SlideOutDrawer>
      </div>
  );
};

export default PriceBook;