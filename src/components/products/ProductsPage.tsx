import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProductComparisonModal from './ProductComparisonModal';
import { MoreVertical, ChevronDown, Filter, Upload, Download, Printer, ChevronRight, BarChart3, Package, Search, Plus } from 'lucide-react';
import { ProductVariantComparison } from './ProductVariantComparison';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductAssemblyForm } from './ProductAssemblyForm';
import { ProductOptionsDemo } from './ProductOptionsDemo';
import { PageHeader } from '../common/PageHeader';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { NewButton } from '../common/NewButton';
import TabMenu from '../common/TabMenu';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { LayoutContext } from '../layouts/DashboardLayout';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { isConstrained, availableWidth } = React.useContext(LayoutContext);
  
  // Initialize state from URL parameters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Revenue-driven product filters - initialize from URL
  const [selectedProfitTier, setSelectedProfitTier] = useState<string>(searchParams.get('profitTier') || 'all');
  const [selectedUsageFrequency, setSelectedUsageFrequency] = useState(searchParams.get('usage') || 'all');
  const [selectedPriceStrategy, setSelectedPriceStrategy] = useState(searchParams.get('strategy') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [collapseVariants, setCollapseVariants] = useState(false);
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>(searchParams.get('trade') || 'all');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');
  const [selectedDateRange, setSelectedDateRange] = useState(searchParams.get('dateRange') || 'all');

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [comparingProduct, setComparingProduct] = useState<any>(null);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  
  // Refs for click outside
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Check if tutorial mode is enabled via URL parameter
  const showTutorial = searchParams.get('tutorial') === 'true';

  // Function to update URL parameters
  const updateUrlParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === 'all' || value === '' || value === 'list') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Debounce search input and update URL
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      updateUrlParams({ search: searchInput });
    }, 300);
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

    // Trade filter (from tabs)
    if (selectedTrade !== 'all') {
      filtered = filtered.filter(product => product.trade_id === selectedTrade);
    }
    
    // Category filter (from dropdown - now secondary)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.trade_id === selectedCategory);
    }

    // Profit tier filter (revenue-driven)
    if (selectedProfitTier !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        switch (selectedProfitTier) {
          case 'premium': return price >= 500;
          case 'high': return price >= 200 && price < 500;
          case 'medium': return price >= 50 && price < 200;
          case 'low': return price >= 10 && price < 50;
          case 'minimal': return price < 10;
          default: return true;
        }
      });
    }

    // Usage frequency filter (business impact)
    if (selectedUsageFrequency !== 'all') {
      // This would need usage tracking data to be fully implemented
      // For now, we'll use variants as a proxy for popularity
      filtered = filtered.filter(product => {
        const hasVariants = product.variants && product.variants.length > 0;
        const variantCount = product.variants?.length || 0;
        
        switch (selectedUsageFrequency) {
          case 'frequent': return hasVariants && variantCount >= 3;
          case 'regular': return hasVariants && variantCount >= 1;
          case 'occasional': return !hasVariants || variantCount === 0;
          default: return true;
        }
      });
    }

    // Price strategy filter (competitive positioning)
    if (selectedPriceStrategy !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        switch (selectedPriceStrategy) {
          case 'premium': return price >= 300; // Premium pricing strategy
          case 'competitive': return price >= 50 && price < 300; // Market competitive
          case 'value': return price < 50; // Value pricing
          default: return true;
        }
      });
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
  }, [products, searchTerm, selectedCategory, selectedProfitTier, selectedUsageFrequency, selectedPriceStrategy, selectedDateRange, sortBy, sortOrder]);

  // Reset filters function
  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedTrade('all');
    setSelectedProfitTier('all');
    setSelectedUsageFrequency('all');
    setSelectedPriceStrategy('all');
    setSelectedDateRange('all');
    setSortBy('price');
    setSortOrder('desc');
    setSearchInput('');
    // Clear URL parameters
    setSearchParams({}, { replace: true });
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

  // Filter products by selected trade for stats
  const tradeFilteredProducts = selectedTrade === 'all' 
    ? products 
    : products.filter(p => p.trade_id === selectedTrade);
    
  const averagePrice = tradeFilteredProducts.length > 0 
    ? tradeFilteredProducts.filter(p => p.price).reduce((sum, p) => sum + (p.price || 0), 0) / tradeFilteredProducts.filter(p => p.price).length 
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

  const getVariantTextColor = (variantName: string) => {
    const name = variantName.toLowerCase();
    if (name.includes('premium') || name.includes('high') || name.includes('deluxe')) {
      return 'text-[#FF8C00]'; // Orange for premium variants
    }
    if (name.includes('medium') || name.includes('regular')) {
      return 'text-[#4A90E2]'; // Bright blue for medium variants
    }
    if (name.includes('standard') || name.includes('basic') || name.includes('economy') || name.includes('budget')) {
      return 'text-[#8E8E93]'; // Muted gray for standard/basic variants
    }
    return 'text-white'; // Default white for other variants
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
      <div className="pt-6">
        {/* Header */}
        <PageHeaderBar
          title="Products"
          searchPlaceholder="Search products..."
          onSearch={(query) => setSearchInput(query)}
          searchValue={searchInput}
          addButtonLabel="Add Product"
          onAddClick={() => setEditingProduct('new')}
        />
        
        {/* Stats Bar */}
        <div className="bg-[#1A1A1A] border-b border-[#333333]">
          <div className={`px-8 flex items-center ${isConstrained ? 'gap-3' : 'gap-6'} text-sm overflow-x-auto py-4`}>
            {isConstrained ? (
              // Ultra-compact stats for constrained view
              <>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-gray-400 text-xs">Items:</span>
                  <span className="font-mono font-medium text-[#388E3C] text-xs">{tradeFilteredProducts.length}</span>
                </div>
                <div className="w-px h-3 bg-[#333333]" />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-gray-400 text-xs">Premium:</span>
                  <span className="font-mono font-medium text-[#F9D71C] text-xs">{tradeFilteredProducts.filter(p => (p.price || 0) >= 500).length}</span>
                </div>
              </>
            ) : (
              // Full stats for normal view
              <>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Catalog Value:</span>
                  <span className="font-mono font-medium text-[#388E3C]">{formatCurrency(tradeFilteredProducts.reduce((sum, p) => sum + (p.price || 0), 0))}</span>
                  <span className="text-gray-500 text-xs">({tradeFilteredProducts.length} items)</span>
                </div>
                <div className="w-px h-4 bg-[#333333]" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Premium Items:</span>
                  <span className="font-mono font-medium text-[#F9D71C]">{tradeFilteredProducts.filter(p => (p.price || 0) >= 500).length}</span>
                  <span className="text-gray-500 text-xs">($500+)</span>
                </div>
                <div className="w-px h-4 bg-[#333333]" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Avg Price:</span>
                  <span className="font-mono font-medium text-[#336699]">{formatCurrency(averagePrice)}</span>
                </div>
                <div className="w-px h-4 bg-[#333333]" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">With Variants:</span>
                  <span className="font-mono font-medium text-[#9E9E9E]">{tradeFilteredProducts.filter(p => p.variants && p.variants.length > 0).length}</span>
                  <span className="text-gray-500 text-xs">(popular)</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#1A1A1A] border-b border-[#333333]">
          <div className="px-8 flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] ${isConstrained ? 'px-2 py-1 text-xs min-w-[120px]' : 'px-3 py-2 text-sm min-w-[200px]'} font-medium text-white hover:bg-[#252525] transition-colors appearance-none cursor-pointer`}
                  value={selectedTrade}
                  onChange={(e) => {
                    setSelectedTrade(e.target.value);
                    updateUrlParams({ trade: e.target.value });
                  }}
                >
                  <option value="all">All Trades ({products.length})</option>
                  {trades.map(trade => {
                    const tradeProductCount = products.filter(p => p.trade_id === trade.id).length;
                    return (
                      <option key={trade.id} value={trade.id}>
                        {trade.name} ({tradeProductCount})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative" ref={filterMenuRef}>
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`bg-[#1E1E1E] border border-[#333333] rounded-[4px] ${isConstrained ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} font-medium flex items-center gap-2 hover:bg-[#252525] transition-colors ${
                    showFilterMenu ? 'bg-[#252525]' : ''
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {!isConstrained && <span>More Filters</span>}
                </button>
                
                {/* More Filters Dropdown */}
                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      {/* Profit Tier Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Profit Tier
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedProfitTier}
                          onChange={(e) => {
                            setSelectedProfitTier(e.target.value);
                            updateUrlParams({ profitTier: e.target.value });
                          }}
                        >
                          <option value="all">All Price Ranges</option>
                          <option value="premium">Premium ($500+)</option>
                          <option value="high">High Margin ($200-500)</option>
                          <option value="medium">Standard ($50-200)</option>
                          <option value="low">Budget ($10-50)</option>
                          <option value="minimal">Basic (Under $10)</option>
                        </select>
                      </div>

                      {/* Usage Frequency Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Usage Frequency
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedUsageFrequency}
                          onChange={(e) => {
                            setSelectedUsageFrequency(e.target.value);
                            updateUrlParams({ usage: e.target.value });
                          }}
                        >
                          <option value="all">All Products</option>
                          <option value="frequent">Frequently Used (3+ Variants)</option>
                          <option value="regular">Regularly Used (Has Variants)</option>
                          <option value="occasional">Occasionally Used</option>
                        </select>
                      </div>

                      {/* Price Strategy Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Pricing Strategy
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedPriceStrategy}
                          onChange={(e) => {
                            setSelectedPriceStrategy(e.target.value);
                            updateUrlParams({ strategy: e.target.value });
                          }}
                        >
                          <option value="all">All Strategies</option>
                          <option value="premium">Premium Pricing ($300+)</option>
                          <option value="competitive">Market Competitive ($50-300)</option>
                          <option value="value">Value Pricing (Under $50)</option>
                        </select>
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

        {/* Content Area */}
        <div>
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
            <div className="bg-[#1A1A1A] rounded-[4px] overflow-hidden">
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="border-b border-[#333333] last:border-b-0">
                  {/* Base Product Header - Entire row clickable */}
                  <div
                    className={`${isConstrained ? 'pl-4 pr-6 py-2' : 'pl-6 pr-8 py-3'} flex justify-between items-center cursor-pointer hover:bg-[#252525] transition-colors`}
                    onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedProductId === product.id ? 'transform rotate-90' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className={`${isConstrained ? 'text-sm' : 'text-base'} font-semibold text-white truncate`}>{product.name}</h2>
                          <span className={`text-gray-400 ${isConstrained ? 'text-xs' : 'text-sm'}`}>
                            {product.trade?.name || 'General'}
                          </span>
                          {product.variants && product.variants.length > 0 && (
                            <span className="bg-[#336699] text-white text-xs px-2 py-0.5 rounded">
                              {product.variants.length} variants
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        className={`bg-[#336699] hover:bg-opacity-80 text-white ${isConstrained ? 'px-3 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'} rounded transition-colors flex items-center gap-2 font-medium`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${product.id}/compare`);
                        }}
                        title="Compare Variants"
                      >
                        <BarChart3 size={14} />
                        {!isConstrained && <span>Compare</span>}
                      </button>
                    </div>
                  </div>

                  {/* Variants List - Only shown when expanded and not collapsed */}
                  {expandedProductId === product.id && !collapseVariants && product.variants && product.variants.length > 0 && (
                    <div className={`${isConstrained ? 'pl-6 pr-6 pb-2' : 'pl-8 pr-8 pb-3'} space-y-2 bg-[#1E1E1E] border-t border-[#333333] relative`}>
                      {/* Add Variant Button at top */}
                      <div className={`flex justify-between items-center ${isConstrained ? 'py-2' : 'py-3'}`}>
                        <h3 className={`text-white font-medium ${isConstrained ? 'text-xs' : 'text-sm'}`}>Variants ({product.variants.length})</h3>
                        <button
                          className={`bg-white hover:bg-gray-100 text-[#121212] ${isConstrained ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'} rounded transition-colors font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
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
                              variant: true
                            });
                          }}
                        >
                          + Add Variant
                        </button>
                      </div>

                      {/* Vertical connecting line */}
                      <div className="absolute left-8 top-20 bottom-6 w-0.5 bg-[#336699] opacity-70"></div>

                        {product.variants.map((variant: any, idx: number) => (
                          <div
                            key={variant.id}
                            className={`flex items-center justify-between ${isConstrained ? 'px-3 py-1.5' : 'px-4 py-2'} bg-[#252525] hover:bg-[#2A2A2A] rounded-[4px] cursor-pointer transition-colors relative ${isConstrained ? 'ml-3' : 'ml-6'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open the drawer to edit this variant
                              setEditingProduct(variant);
                            }}
                          >
                            {/* Horizontal connecting line */}
                            <div className="absolute left-[-12px] top-1/2 w-3 h-0.5 bg-[#336699] opacity-70"></div>

                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`${isConstrained ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-[#333333] border border-[#555555] flex items-center justify-center`}>
                              <span className="text-xs text-white font-bold">{idx + 1}</span>
                            </div>
                            <span className={`font-medium ${isConstrained ? 'text-xs truncate' : 'text-sm'} ${getVariantTextColor(variant.variant_name || variant.name)}`}>
                              {variant.variant_name || variant.name}
                            </span>
                            {!isConstrained && (
                              <span className="text-gray-500 text-xs">({variant.items?.length || 0} items)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`${isConstrained ? 'text-sm' : 'text-base'} font-semibold text-white tabular-nums`}>{formatCurrency(variant.price || 0)}</span>
                            <button
                              className={`bg-[#336699] hover:bg-opacity-80 text-white ${isConstrained ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'} rounded transition-colors font-medium`}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Edit this variant
                                setEditingProduct(variant);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className={`bg-[#1E1E1E] hover:bg-[#333333] text-white border border-[#404040] hover:border-[#555555] ${isConstrained ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'} rounded transition-colors font-medium`}
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
                              Clone
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* If this is a standalone product with no variants */}
                  {expandedProductId === product.id && (!product.variants || product.variants.length === 0) && (
                    <div className={`${isConstrained ? 'pl-6 pr-6 pb-2' : 'pl-8 pr-8 pb-3'} bg-[#1E1E1E] border-t border-[#333333]`}>
                      <div className={`flex justify-between items-center ${isConstrained ? 'py-2' : 'py-3'}`}>
                        <h3 className={`text-white font-medium ${isConstrained ? 'text-xs' : 'text-sm'}`}>Product Details</h3>
                        <button
                          className={`bg-white hover:bg-gray-100 text-[#121212] ${isConstrained ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'} rounded transition-colors font-medium`}
                          onClick={(e) => {
                            e.stopPropagation();
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
                              variant: true
                            });
                          }}
                        >
                          + Add Variant
                        </button>
                      </div>
                      <div
                        className={`flex items-center justify-between ${isConstrained ? 'px-3 py-1.5' : 'px-4 py-2'} bg-[#252525] hover:bg-[#2A2A2A] rounded-[4px] cursor-pointer transition-colors`}
                        onClick={() => setEditingProduct(product)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className={`text-gray-400 ${isConstrained ? 'text-xs' : 'text-xs'}`}>({product.items?.length || 0} items)</span>
                          {!isConstrained && (
                            <>
                              <span className="text-gray-400 text-xs">•</span>
                              <span className="text-gray-400 text-xs">Click to edit</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`${isConstrained ? 'text-sm' : 'text-base'} font-semibold text-white tabular-nums`}>{formatCurrency(product.price || 0)}</span>
                          <button
                            className={`bg-[#336699] hover:bg-opacity-80 text-white ${isConstrained ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'} rounded transition-colors font-medium`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(product);
                            }}
                          >
                            Edit
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

      {/* Product Comparison Modal */}
      {comparingProduct && (
        <ProductComparisonModal
          baseProduct={comparingProduct}
          onClose={() => setComparingProduct(null)}
        />
      )}
    </div>
  );
};