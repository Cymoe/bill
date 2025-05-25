import { useState, useEffect, useRef, useMemo } from 'react';
import ProductComparisonModal from './ProductComparisonModal';
import { MoreVertical, ChevronDown, Filter, Upload, Download, Printer, ChevronRight, BarChart3, Package } from 'lucide-react';
import { ProductVariantComparison } from './ProductVariantComparison';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductAssemblyForm } from './ProductAssemblyForm';
import { ProductOptionsDemo } from './ProductOptionsDemo';
import { PageHeader } from '../common/PageHeader';
import { NewButton } from '../common/NewButton';

// Product type
export type Product = {
  id: string;
  name: string;
  description: string;
  price?: number;
  unit?: string;
  user_id: string;
  created_at?: string;
  type?: string;
  items?: { lineItemId: string; quantity: number }[];
  category?: string;
  premium?: boolean;
  lineItems?: any[];
  packages?: any[];
  is_base_product?: boolean;
  parent_product_id?: string;
  variant_name?: string;
  trade?: { id: string; name: string };
  trade_id?: string;
  status?: string;
  variant?: boolean;
  parent_name?: string;
  variants?: Product[];
};

interface LineItem {
  lineItemId: string;
  quantity: number;
  unit: string;
  price: number;
  type?: string;
}

interface SaveData {
  name: string;
  description: string;
  items: LineItem[];
}

// Category colors moved to utility functions for better maintainability

// Accept editingProduct and setEditingProduct as props
export interface ProductsPageProps {
  editingProduct: Product | 'new' | null;
  setEditingProduct: (p: Product | 'new' | null) => void;
}

export const ProductsPage = ({ editingProduct, setEditingProduct }: ProductsPageProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);
  const [selectedVariantProduct, setSelectedVariantProduct] = useState<Product | null>(null);
  const [showVariantComparison, setShowVariantComparison] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVariantFilter, setSelectedVariantFilter] = useState('all');
  const [collapseVariants, setCollapseVariants] = useState(false);
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [comparingProduct, setComparingProduct] = useState<any>(null);
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle closing the product form drawer with animation
  const handleCloseProductForm = () => {
    setIsClosingDrawer(true);
    setTimeout(() => {
      setEditingProduct(null);
      setIsClosingDrawer(false);
    }, 300);
  };

  // Handle closing the variant comparison drawer with animation
  const handleCloseVariantComparison = () => {
    setIsClosingDrawer(true);
    setTimeout(() => {
      setSelectedVariantProduct(null);
      setShowVariantComparison(false);
      setIsClosingDrawer(false);
    }, 300);
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchTrades();
    }
  }, [user]);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('id, name')
        .order('name');
      if (!error && data) setTrades(data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch all products with trade information
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*, trade:trades(id, name)')
        .order('created_at', { ascending: false });
      if (productsError) throw productsError;

      // Fetch all product_line_items
      const { data: pliData, error: pliError } = await supabase
        .from('product_line_items')
        .select('*');
      if (pliError) throw pliError;

      // Attach line items to each product
      const productsWithItems = (productsData || []).map((product) => ({
        ...product,
        items: pliData.filter((pli) => pli.product_id === product.id)
      }));

      // Separate base products and variants
      const baseProducts = productsWithItems.filter(p => p.is_base_product === true);
      const variants = productsWithItems.filter(p => p.is_base_product === false && p.parent_product_id);

      // Group variants by their parent product
      const baseProductsWithVariants = baseProducts.map(baseProduct => {
        const productVariants = variants.filter(v => v.parent_product_id === baseProduct.id);
        return {
          ...baseProduct,
          variants: productVariants
        };
      });

      // Add standalone products (those without variants) to the list
      const standaloneProducts = productsWithItems.filter(
        p => p.is_base_product !== true && !p.parent_product_id
      );

      // Combine base products with variants and standalone products
      const allProducts = [...baseProductsWithVariants, ...standaloneProducts];

      setProducts(allProducts);
      console.log('Fetched products:', allProducts.length);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term, category, and other filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter (trade)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.trade_id === selectedCategory);
    }

    // Variant filter
    if (selectedVariantFilter !== 'all') {
      if (selectedVariantFilter === 'with-variants') {
        filtered = filtered.filter(product => product.variants && product.variants.length > 0);
      } else if (selectedVariantFilter === 'without-variants') {
        filtered = filtered.filter(product => !product.variants || product.variants.length === 0);
      }
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (selectedDateRange === '7d') cutoff.setDate(now.getDate() - 7);
      if (selectedDateRange === '30d') cutoff.setDate(now.getDate() - 30);
      if (selectedDateRange === '90d') cutoff.setDate(now.getDate() - 90);
      filtered = filtered.filter(product => new Date(product.created_at || '') >= cutoff);
    }

    // Price range filter
    if (priceMin) {
      filtered = filtered.filter(product => product.price && product.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter(product => product.price && product.price <= parseFloat(priceMax));
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (sortBy === 'price') {
        const aValue = a.price || 0;
        const bValue = b.price || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else { // created_at
        const aValue = new Date(a.created_at || '');
        const bValue = new Date(b.created_at || '');
        return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
    });
  }, [products, searchTerm, selectedCategory, selectedVariantFilter, selectedDateRange, priceMin, priceMax, sortBy, sortOrder]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedVariantFilter('all');
    setSelectedDateRange('all');
    setPriceMin('');
    setPriceMax('');
    setSortBy('created_at');
    setSortOrder('desc');
    setSearchInput('');
  };

  // Functions for the options menu
  const handleImportItems = () => {
    console.log('Import items');
  };

  const handleExportToCSV = () => {
    console.log('Export to CSV');
  };

  const handlePrintPriceBook = () => {
    console.log('Print price book');
  };

  // Calculate summary metrics
  const recentProducts = products.filter(product => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(product.created_at || '') >= thirtyDaysAgo;
  });

  const averagePrice = products.length > 0 
    ? products.filter(p => p.price).reduce((sum, p) => sum + (p.price || 0), 0) / products.filter(p => p.price).length 
    : 0;

  const mostUsedType = useMemo(() => {
    const typeCounts = products.reduce((acc, product) => {
      const type = product.type || 'material';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCounts).reduce((max, [type, count]) => 
      count > max.count ? { type, count } : max, 
      { type: 'Material', count: 0 }
    );
  }, [products]);

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="w-12 h-12 border-4 border-[#336699] border-t-transparent rounded animate-spin mb-4"></div>
      <p className="text-white text-lg font-['Roboto']">Loading products...</p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 bg-[#333333] rounded flex items-center justify-center mb-4 border-l-4 border-[#336699]">
        <Package size={32} className="text-[#336699] opacity-60" />
      </div>
      <h3 className="text-xl font-bold text-white font-['Roboto_Condensed'] uppercase mb-2">No products found</h3>
      <p className="text-gray-400 text-center max-w-md mb-6 font-['Roboto']">Try adjusting your filters or create your first product to get started.</p>
      <button
        onClick={() => setEditingProduct('new')}
        className="flex items-center gap-2 px-4 py-2 bg-[#336699] hover:bg-opacity-80 text-white rounded transition-colors"
      >
        <span className="text-lg">+</span> New Product
      </button>
    </div>
  );

  // Helper functions for UI elements
  const getVariantColor = (variant: any) => {
    if (variant.variant_name?.toLowerCase().includes('premium')) return 'bg-[#336699] opacity-90';
    if (variant.variant_name?.toLowerCase().includes('standard')) return 'bg-[#336699]';
    if (variant.variant_name?.toLowerCase().includes('medium')) return 'bg-[#336699] opacity-70';
    return 'bg-[#336699] opacity-50';
  };

  const getCategoryEmoji = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'interior': return '🏠';
      case 'exterior': return '🏡';
      case 'installation': return '🔧';
      case 'construction': return '🏗️';
      default: return '📦';
    }
  };

  // Handle actions
  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      setDeletingProduct(null);
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full p-0 m-0 overflow-hidden">
        <PageHeaderBar
          title="Products"
          searchPlaceholder="Search products..."
          searchValue={searchInput}
          onSearch={setSearchInput}
          onAddClick={() => setEditingProduct('new')}
          addButtonLabel="Product"
        />
        
        {/* Product Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#333333]">
          {/* Total Products */}
          <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Total Products</div>
            <div className="text-3xl font-bold text-white mb-1">{products.length}</div>
            <div className="text-sm text-gray-400">In inventory</div>
          </div>
          
          {/* Recent Additions */}
          <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10b981]"></div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Added This Month</div>
            <div className="text-3xl font-bold text-[#10b981] mb-1">{recentProducts.length}</div>
            <div className="text-sm text-gray-400">Last 30 days</div>
          </div>
          
          {/* Average Price */}
          <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6]"></div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Average Price</div>
            <div className="text-3xl font-bold text-[#3b82f6] mb-1">{formatCurrency(averagePrice)}</div>
            <div className="text-sm text-gray-400">Per item</div>
          </div>
          
          {/* Most Used Type */}
          <div className="relative bg-[#1a1a1a] p-6 hover:bg-[#222222] transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#F9D71C]"></div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Most Used</div>
            <div className="text-3xl font-bold text-[#F9D71C] mb-1">{mostUsedType.type}</div>
            <div className="text-sm text-gray-400">{mostUsedType.count} items</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
          {/* Left side - View Mode and Primary Filter */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggles - More Prominent */}
            <div className="flex bg-[#333333] border border-gray-700 rounded overflow-hidden">
              <button
                className={`px-4 py-2 ${viewMode === 'list' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                className={`px-4 py-2 ${viewMode === 'cards' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
            </div>

            {/* Primary Trade Filter - More Prominent */}
            <div className="relative">
              <select
                className="bg-[#232323] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#336699] appearance-none cursor-pointer pr-10 min-w-[200px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Trades ({trades.length})</option>
                {trades.map(trade => (
                  <option key={trade.id} value={trade.id}>{trade.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>

            {/* More Filters Button */}
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-[#232323] border border-gray-700 rounded text-white hover:bg-[#2A2A2A] transition-colors"
              >
                <Filter size={16} />
                More Filters
              </button>
              {showFilterMenu && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-[#232323] border border-gray-700 rounded shadow-lg z-50">
                  <div className="p-4 space-y-4">
                    {/* Variant Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Product Type</label>
                      <select
                        value={selectedVariantFilter}
                        onChange={(e) => setSelectedVariantFilter(e.target.value)}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="all">All Products</option>
                        <option value="with-variants">With Variants</option>
                        <option value="without-variants">Without Variants</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Date Added</label>
                      <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Price Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-');
                          setSortBy(field);
                          setSortOrder(order as 'asc' | 'desc');
                        }}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="created_at-desc">Newest First</option>
                        <option value="created_at-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="price-desc">Price High-Low</option>
                        <option value="price-asc">Price Low-High</option>
                      </select>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-between pt-2">
                      <button 
                        className="px-4 py-2 bg-[#232323] text-gray-400 rounded text-sm hover:bg-[#2A2A2A]"
                        onClick={resetFilters}
                      >
                        Reset All
                      </button>
                      <button 
                        className="px-4 py-2 bg-[#336699] text-white rounded text-sm hover:bg-[#2851A3]"
                        onClick={() => setShowFilterMenu(false)}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Options Menu */}
          <div className="flex items-center">
            <div className="relative" ref={optionsMenuRef}>
              <button
                className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#232323] transition-colors"
                onClick={() => setShowOptionsMenu(v => !v)}
                aria-label="More options"
              >
                <MoreVertical size={20} className="text-gray-400" />
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-[#232323] border border-gray-700 rounded shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handleImportItems(); }}
                  >
                    Import Products
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handleExportToCSV(); }}
                  >
                    Export to CSV
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handlePrintPriceBook(); }}
                  >
                    Print Products
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* List View */}
          {viewMode === 'list' && (
            <div className="px-0 py-2 w-full">
              {isLoading ? (
                <LoadingIndicator />
              ) : filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-[#121212] rounded overflow-hidden">
                      {/* Base Product Header - Entire row clickable */}
                      <div
                        className="bg-[#333333] p-4 flex justify-between items-center cursor-pointer hover:bg-[#1E1E1E] transition-colors"
                        onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedProductId === product.id ? 'transform rotate-90' : ''}`} />
                          <div>
                            <h2 className="text-xl font-bold text-white">{product.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-400 text-sm">
                                {product.trade?.name || 'General'} •
                                {product.variants && product.variants.length > 0 ?
                                  <span className="bg-[#336699] text-white text-xs px-2 py-0.5 rounded ml-1">{product.variants.length} variants</span> :
                                  <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded ml-1">No variants</span>
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="bg-[#336699] hover:bg-opacity-80 text-white px-4 py-2 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create a new variant product with parent info pre-filled
                              setEditingProduct({
                                id: '',
                                name: '',
                                description: '',
                                user_id: user?.id || '',
                                status: 'draft',
                                is_base_product: false,
                                parent_product_id: product.id,
                                parent_name: product.name,
                                category: product.category,
                                variant: true // Flag to indicate this is a variant
                              });
                            }}
                          >
                            + Add Variant
                          </button>
                          <button
                            className="bg-[#336699] hover:bg-opacity-80 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Use our new variant comparison drawer instead of the modal
                              setSelectedVariantProduct(product);
                              setShowVariantComparison(true);
                            }}
                          >
                            <BarChart3 size={16} />
                            Compare
                          </button>
                        </div>
                      </div>

                      {/* Variants List - Only shown when expanded and not collapsed */}
                      {expandedProductId === product.id && !collapseVariants && product.variants && product.variants.length > 0 && (
                        <div className="p-4 space-y-2 relative">
                          {/* Vertical connecting line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#336699] opacity-70"></div>

                          {product.variants.map((variant: any, idx: number) => (
                            <div
                              key={variant.id}
                              className="flex items-center justify-between p-4 border border-gray-700 rounded border-l-4 border-[#336699] cursor-pointer hover:bg-[#333333] transition-colors relative ml-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open the drawer to edit this variant
                                setEditingProduct(variant);
                              }}
                            >
                              {/* Horizontal connecting line */}
                              <div className="absolute left-[-12px] top-1/2 w-3 h-0.5 bg-[#336699] opacity-70"></div>

                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded ${getVariantColor(variant.variant_name)} border-2 border-[#336699] flex items-center justify-center">
                                  <span className="text-[8px] text-white font-bold">{idx + 1}</span>
                                </div>
                                <span className="font-medium text-white font-['Roboto']">{variant.variant_name || variant.name}</span>
                                <span className="text-gray-400 text-sm font-['Roboto']">({variant.items?.length || 0} items)</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium font-['Roboto_Condensed'] text-white font-['Roboto_Condensed']">{formatCurrency(variant.price || 0)}</span>
                                <button
                                  className="bg-[#336699] hover:bg-opacity-80 text-white px-4 py-2 rounded transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Clone this variant logic
                                    setEditingProduct({
                                      id: '',
                                      name: `${variant.name} (Copy)`,
                                      description: variant.description,
                                      user_id: user?.id || '',
                                      status: 'draft',
                                      is_base_product: false,
                                      parent_product_id: product.id,
                                      parent_name: product.name,
                                      price: variant.price,
                                      unit: variant.unit,
                                      trade_id: variant.trade_id,
                                      category: product.category,
                                      variant: true // Flag to indicate this is a variant
                                    });
                                  }}
                                >
                                  Clone Variant
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* If this is a standalone product with no variants */}
                      {expandedProductId === product.id && (!product.variants || product.variants.length === 0) && (
                        <div className="p-4">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#333333] transition-colors rounded border-l-4 border-[#336699]"
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-sm">({product.items?.length || 0} items)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold font-['Roboto_Condensed'] text-white">{formatCurrency(product.price || 0)}</span>
                              <button
                                className="bg-[#336699] hover:bg-opacity-80 text-white px-4 py-2 rounded transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Create a variant of this product
                                  setEditingProduct({
                                    id: '',
                                    name: '',
                                    description: '',
                                    user_id: user?.id || '',
                                    status: 'draft',
                                    is_base_product: false,
                                    parent_product_id: product.id,
                                    parent_name: product.name,
                                    category: product.category,
                                    variant: true // Flag to indicate this is a variant
                                  });
                                }}
                              >
                                + Add Variant
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card View */}
          {viewMode === 'cards' && (
            <div className="px-0 py-2 w-full">
              {isLoading ? (
                <LoadingIndicator />
              ) : filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-[#121212] rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                    >
                      <div className="p-5 border-b border-gray-700">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-xl font-bold font-['Roboto_Condensed'] mb-1 text-white">{product.name}</h2>
                            <div className="text-sm text-gray-400 font-['Roboto'] font-['Roboto'] mb-2">
                              {product.trade?.name || 'General'} •
                              {product.variants && product.variants.length > 0 ?
                                <span className="bg-[#336699] text-white text-xs px-2 py-0.5 rounded ml-1">{product.variants.length} variants</span> :
                                <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded ml-1">No variants</span>
                              }
                            </div>
                          </div>
                          <div className="text-4xl">
                            {getCategoryEmoji(product.category || '')}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
                      </div>

                      {product.variants && product.variants.length > 0 ? (
                        <div className="p-3 bg-[#333333] border-b border-gray-700">
                          <div className="text-sm font-medium font-['Roboto_Condensed'] text-gray-300 mb-2">Available Variants:</div>
                          <div className="space-y-1.5">
                            {product.variants.map((variant: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-1 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Open the drawer to edit this variant
                                  setEditingProduct(variant);
                                }}
                              >
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded mr-2 ${getVariantColor(variant.variant_name)}`}></div>
                                  <span className="text-sm truncate max-w-[160px] text-white">{variant.variant_name || variant.name}</span>
                                </div>
                                <span className="text-lg font-medium text-white mb-1 font-['Roboto_Condensed']">{formatCurrency(variant.price || 0)}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-[#336699] hover:bg-opacity-80 text-white py-2 px-4 rounded text-sm font-medium font-['Roboto_Condensed'] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVariantProduct(product);
                              setShowVariantComparison(true);
                            }}
                          >
                            <BarChart3 size={16} />
                            Compare Variants
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#333333] border-b border-gray-700">
                          <div className="text-sm font-medium font-['Roboto_Condensed'] text-gray-300 mb-2">No variants available</div>
                          <button
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-[#336699] hover:bg-opacity-80 text-white py-2 px-4 rounded text-sm font-medium font-['Roboto_Condensed'] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create a new variant product with parent info pre-filled
                              setEditingProduct({
                                id: '',
                                name: '',
                                description: '',
                                user_id: user?.id || '',
                                status: 'draft',
                                is_base_product: false,
                                parent_product_id: product.id,
                                parent_name: product.name,
                                category: product.category,
                                variant: true // Flag to indicate this is a variant
                              });
                            }}
                          >
                            + Add Variant
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {deletingProduct && (
          <DeleteConfirmationModal
            title="Delete Product"
            message="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={() => confirmDelete((deletingProduct as Product).id)}
            onCancel={() => setDeletingProduct(null)}
          />
        )}

        {/* Product drawer moved to GlobalProductDrawer component */}
        {/* Demo: Product Options Configurator */}
        <div className="mt-12 flex justify-center">
          <ProductOptionsDemo />
        </div>

        {/* Product Comparison Modal */}
        {comparingProduct && (
          <ProductComparisonModal
            baseProduct={comparingProduct}
            onClose={() => setComparingProduct(null)}
          />
        )}

        {/* Product Variant Comparison Drawer */}
        {showVariantComparison && selectedVariantProduct && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end transition-opacity ${isClosingDrawer ? 'opacity-0' : 'opacity-100'}`}>
            <div
              className={`bg-[#121212] w-full max-w-4xl overflow-y-auto transition-transform duration-300 ease-in-out ${isClosingDrawer ? 'transform translate-x-full' : 'transform translate-x-0'}`}
            >
              <div className="sticky top-0 bg-[#121212] z-10 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Compare {selectedVariantProduct.name} Variants</h2>
                <button
                  onClick={handleCloseVariantComparison}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ProductVariantComparison
                  baseProductId={selectedVariantProduct.id}
                  onSelectVariant={(variantId) => {
                    // Find the variant
                    const variant = selectedVariantProduct.variants?.find(v => v.id === variantId);
                    if (variant) {
                      handleCloseVariantComparison();
                      // Open the variant in the product form
                      setTimeout(() => {
                        setEditingProduct(variant as Product);
                      }, 300);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};