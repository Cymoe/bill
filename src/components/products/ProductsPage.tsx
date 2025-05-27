import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProductComparisonModal from './ProductComparisonModal';
import { MoreVertical, ChevronDown, Filter, Upload, Download, Printer, ChevronRight, BarChart3, Package, Search, Plus } from 'lucide-react';
import { ProductVariantComparison } from './ProductVariantComparison';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductAssemblyForm } from './ProductAssemblyForm';
import { ProductOptionsDemo } from './ProductOptionsDemo';
import { PageHeader } from '../common/PageHeader';
import { NewButton } from '../common/NewButton';
import TabMenu from '../common/TabMenu';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';

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
  const location = useLocation();
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
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';

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

  // Contextual Onboarding Component
  const ContextualOnboarding = () => {
    // Show onboarding if no products OR if tutorial=true in URL
    if (products.length > 0 && !showTutorial) return null;

    return (
      <div className="max-w-4xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
      </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Product Management</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Build your product catalog with materials, labor, and services. Create variants, track pricing, 
            and streamline your estimating process. Let's add your first product.
          </p>
        </div>

        {/* Video Section */}
        <div className="mb-8">
          <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center">
                <span className="text-[#336699] mr-2">🎥</span>
                Watch: Product Catalog Setup
              </h3>
              <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">6 min</span>
            </div>
            
            {/* Video Embed Container */}
            <div className="relative w-full h-0 pb-[56.25%] bg-[#333333] rounded-[4px] overflow-hidden">
              {/* Replace this iframe src with your actual Loom video URL */}
              <iframe
                src="https://www.loom.com/embed/0c9786a7fd61445bbb23b6415602afe4"
                frameBorder="0"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                title="Product Catalog Setup"
              ></iframe>
              
              {/* Placeholder for when no video is set */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl">▶</span>
                  </div>
                  <p className="text-gray-400 text-sm">Video coming soon</p>
                  <p className="text-gray-500 text-xs">Replace iframe src with your Loom URL</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mt-3">
              Learn how to build a comprehensive product catalog that speeds up your estimating 
              and keeps your pricing consistent across all projects.
            </p>
          </div>
        </div>

        {/* Quick Start Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Step 1 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#336699]">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#336699] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                1
              </div>
              <h3 className="text-white font-bold">Add Your First Product</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Start with a common material, service, or labor item you use frequently in projects.
            </p>
      <button
        onClick={() => setEditingProduct('new')}
              className="w-full bg-[#336699] text-white py-2 px-4 rounded-[4px] hover:bg-[#2A5580] transition-colors font-medium"
      >
              CREATE PRODUCT
      </button>
    </div>

          {/* Step 2 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                2
              </div>
              <h3 className="text-gray-400 font-bold">Create Variants</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Add different sizes, grades, or options for your products to cover all scenarios.
            </p>
            <button
              disabled
              className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium"
            >
              COMING NEXT
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                3
              </div>
              <h3 className="text-gray-400 font-bold">Use in Estimates</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Build estimates faster by selecting products from your catalog with consistent pricing.
            </p>
            <button
              disabled
              className="w-full bg-[#9E9E9E] text-gray-500 py-2 px-4 rounded-[4px] cursor-not-allowed font-medium"
            >
              COMING NEXT
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
          <h3 className="text-white font-bold mb-4 flex items-center">
            <span className="text-[#F9D71C] mr-2">💡</span>
            Pro Tips for Product Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Include all costs</p>
                  <p className="text-gray-400 text-xs">Factor in material, labor, overhead, and profit margins</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Use clear naming</p>
                  <p className="text-gray-400 text-xs">Make products easy to find with descriptive names</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Update prices regularly</p>
                  <p className="text-gray-400 text-xs">Keep pricing current with market rates and supplier costs</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-white text-sm font-medium">Organize by trade</p>
                  <p className="text-gray-400 text-xs">Group products by trade for easier navigation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm mb-4">
            Common product categories to get you started:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setEditingProduct('new')}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              🧱 Materials
            </button>
            <button
              onClick={() => setEditingProduct('new')}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              👷 Labor
            </button>
            <button
              onClick={() => setEditingProduct('new')}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              🔧 Tools & Equipment
            </button>
            <button
              onClick={() => setEditingProduct('new')}
              className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
            >
              🚚 Services
            </button>
          </div>
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-[#333333]">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              />
            </div>
            <button
              onClick={() => setEditingProduct('new')}
              className="w-10 h-10 bg-[#F9D71C] hover:bg-[#e9c91c] text-[#121212] rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Products:</span>
            <span className="font-mono font-medium">{products.length}</span>
            <span className="text-gray-500 text-xs">({recentProducts.length} recent)</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Most Used:</span>
            <span className="font-mono font-medium text-[#F9D71C]">{mostUsedType.type}</span>
          </div>
          <div className="w-px h-4 bg-[#333333]" />
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Avg Price:</span>
            <span className="font-mono font-medium text-[#336699]">{formatCurrency(averagePrice)}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium text-white min-w-[180px] hover:bg-[#252525] transition-colors appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Trades ({trades.length})</option>
                {trades.map(trade => (
                  <option key={trade.id} value={trade.id}>{trade.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[#252525] transition-colors ${
                  showFilterMenu ? 'bg-[#252525]' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
              
              {/* More Filters Dropdown */}
              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-4">
                  <div className="space-y-4">
                    {/* Variant Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Product Type
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={selectedVariantFilter}
                        onChange={(e) => setSelectedVariantFilter(e.target.value)}
                      >
                        <option value="all">All Products</option>
                        <option value="with-variants">With Variants</option>
                        <option value="without-variants">Without Variants</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Price Range
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="w-1/2 bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        />
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="w-1/2 bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                        />
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          resetFilters();
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
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1E1E1E] border border-[#333333] rounded-[4px] overflow-hidden">
              <button
                className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewMode === 'list' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-[#252525]'
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewMode === 'cards' ? 'bg-[#336699] text-white' : 'text-gray-400 hover:bg-[#252525]'
                }`}
                onClick={() => setViewMode('cards')}
              >
                Cards
              </button>
            </div>
            <div className="relative" ref={optionsMenuRef}>
              <button
                className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] w-8 h-8 flex items-center justify-center hover:bg-[#252525] transition-colors"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handleImportItems(); }}
                  >
                    Import Products
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handleExportToCSV(); }}
                  >
                    Export to CSV
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); handlePrintPriceBook(); }}
                  >
                    Print Products
                  </button>
                </div>
              )}
            </div>
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
              products.length === 0 || showTutorial ? (
                <ContextualOnboarding />
              ) : (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-lg mb-4">No products match your search</div>
                  <div className="text-gray-500 text-sm">Try adjusting your filters or search terms</div>
                </div>
              )
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
              products.length === 0 || showTutorial ? (
                <ContextualOnboarding />
              ) : (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-lg mb-4">No products match your search</div>
                  <div className="text-gray-500 text-sm">Try adjusting your filters or search terms</div>
                          </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-[#333333] rounded-[4px] p-6 border border-[#404040] hover:border-[#336699] transition-colors">
                    <h3 className="text-white font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#336699] font-bold">{formatCurrency(product.price || 0)}</span>
                        <button
                        onClick={() => setEditingProduct(product)}
                        className="bg-[#336699] text-white px-3 py-1 rounded text-sm hover:bg-[#2A5580] transition-colors"
                      >
                        Edit
                        </button>
                      </div>
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
  );
};