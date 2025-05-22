import { useState, useEffect, useRef } from 'react';
import ProductComparisonModal from './ProductComparisonModal';
import { MoreVertical, ChevronDown, Filter, Upload, Download, Printer, ChevronRight, BarChart3, Package } from 'lucide-react';
import { ProductVariantComparison } from './ProductVariantComparison';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../layouts/DashboardLayout';
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
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Used in fetchProducts
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);
  const [selectedVariantProduct, setSelectedVariantProduct] = useState<Product | null>(null);
  const [showVariantComparison, setShowVariantComparison] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedVariantFilter, setSelectedVariantFilter] = useState('all'); // 'all', 'with-variants', or 'without-variants'
  const [collapseVariants, setCollapseVariants] = useState(false); // Toggle to collapse/expand variant groups
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  // Using only priceMin/priceMax without setters since they're only used for filtering
  const [priceMin] = useState<number | undefined>();
  const [priceMax] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<string>('most-used');
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);
  const [showSortMenu, setShowSortMenu] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list'); // 'list' or 'cards'
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [comparingProduct, setComparingProduct] = useState<any>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Handle closing the product form drawer with animation
  const handleCloseProductForm = () => {
    setIsClosingDrawer(true);
    setTimeout(() => {
      setEditingProduct(null);
      setIsClosingDrawer(false);
    }, 300); // Match the animation duration in tailwind.config.js
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
      fetchLineItems();
      fetchTrades();
    }
  }, [user]);

  const fetchLineItems = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, unit, price, type, trade:trades(name)')
        .order('name', { ascending: true });

      if (error) throw error;

      console.log('Fetched line items:', data);
      setLineItems((data || []).map((li: any) => ({
        ...li,
        trade: li.trade?.name || null
      })));
    } catch (error) {
      console.error('Error fetching line items:', error);
    }
  };

  // Fetch trades from the database
  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      console.log('Fetched trades:', data);
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node) &&
        createButtonRef.current &&
        !createButtonRef.current.contains(event.target as Node)
      ) {
        setShowCreateModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCreateModal]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

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

  // Filter products based on search term, category, product type, and price range
  const filteredProducts = products.filter(product => {
    // Filter by search term
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by category (trade)
    const matchesCategory = selectedCategory === 'all' || product.trade_id === selectedCategory;

    // Product type filter removed as part of simplification
    const matchesProductType = true; // Always true since we simplified the product approach

    // Filter by variant filter
    const matchesVariantFilter =
      selectedVariantFilter === 'all' ||
      (selectedVariantFilter === 'with-variants' && product.variants && product.variants.length > 0) ||
      (selectedVariantFilter === 'without-variants' && (!product.variants || product.variants.length === 0));

    // Filter by price range
    const matchesPriceMin = !priceMin || (product.price && product.price >= priceMin);
    const matchesPriceMax = !priceMax || (product.price && product.price <= priceMax);

    return matchesSearch && matchesCategory && matchesProductType && matchesVariantFilter && matchesPriceMin && matchesPriceMax;
  });

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

  const handleExportToCSV = () => {
    // Implementation for exporting to CSV
    console.log('Export to CSV');
  };

  const handleImportItems = () => {
    // Implementation for importing items
    console.log('Import items');
  };

  const handlePrintPriceBook = () => {
    // Implementation for printing price book
    console.log('Print price book');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full p-0 m-0 overflow-hidden">
        <PageHeader
          hideTitle={true}
        />
        {/* Removed duplicate New Product button */}
        {/* Mobile filter and sort options - only visible on mobile */}
        <div className="md:hidden flex flex-col space-y-4 mt-4 px-0 w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            {/* Product Filter - Mobile */}
            <div className="w-full relative">
              <select
                className="w-full px-4 py-2 bg-[#333333] border border-gray-700 rounded text-white appearance-none"
                value={selectedVariantFilter}
                onChange={(e) => setSelectedVariantFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="with-variants">Products With Variants</option>
                <option value="without-variants">Products Without Variants</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Collapse Variants Toggle - Mobile */}
            <div className="w-full flex items-center justify-between px-4 py-2 bg-[#333333] border border-gray-700 rounded text-white">
              <span>Collapse Variants</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={collapseVariants}
                  onChange={() => setCollapseVariants(!collapseVariants)}
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#336699] rounded peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded after:h-5 after:w-5 after:transition-all peer-checked:bg-[#336699]"></div>
              </label>
            </div>

            {/* Category Filter Dropdown - Mobile */}
            <div className="w-full relative" ref={categoryMenuRef}>
              <button
                className="w-full flex items-center justify-between px-4 py-2 bg-[#333333] border border-gray-700 rounded text-white"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              >
                <span className="truncate">{selectedCategory === 'all' ? `All Trades (${trades.length})` : trades.find(t => t.id === selectedCategory)?.name || 'All Trades'}</span>
                <ChevronDown size={16} />
              </button>

              {showCategoryMenu && (
                <div className="absolute right-0 top-12 bg-[#333333] rounded shadow-lg z-10 py-0.5 border border-gray-600 min-w-[180px]">
                  <button
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowCategoryMenu(false);
                    }}
                  >
                    All Trades ({trades.length})
                  </button>
                  {trades.map(tradeItem => (
                    <button
                      className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${selectedCategory === tradeItem.id ? 'bg-[#336699]' : ''}`}
                      onClick={() => {
                        setSelectedCategory(tradeItem.id);
                        setShowCategoryMenu(false);
                      }}
                      key={tradeItem.id}
                    >
                      {tradeItem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, type, or price range..."
                className="w-64 px-4 py-2 bg-[#1E1E1E] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#333333] border border-gray-700 rounded text-white hover:bg-gray-700"
              onClick={() => setShowFilter(true)}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>

            <div className="relative" ref={optionsMenuRef}>
              <button
                className="p-2 bg-[#333333] border border-gray-700 rounded text-white hover:bg-gray-700"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical size={20} />
              </button>

              {showOptionsMenu && (
                <div className="absolute right-0 top-12 w-48 bg-[#333333] rounded shadow-lg z-10 py-0.5 border border-gray-600">
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handleImportItems();
                    }}
                  >
                    <Upload size={16} className="text-gray-400" />
                    Import items
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handleExportToCSV();
                    }}
                  >
                    <Download size={16} className="text-gray-400" />
                    Export to CSV
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handlePrintPriceBook();
                    }}
                  >
                    <Printer size={16} className="text-gray-400" />
                    Print price book
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category and Subcategory Selectors - hidden on mobile */}
        <div className="hidden md:block px-0 py-0 w-full mt-0">
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <select
                className="appearance-none w-full bg-[#1E1E1E] border border-gray-700 px-4 py-2 pr-8 rounded text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('all');
                }}
              >
                <option value="all">All Trades ({trades.length})</option>
                {trades.map(trade => (
                  <option key={trade.id} value={trade.id}>{trade.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
            {/* Second dropdown removed to simplify the filtering process */}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 px-0 w-full mt-0">
            {/* View Mode Toggles */}
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

            {/* Product Type Filter */}
            <div className="relative">
              <select
                className="px-4 py-2 bg-[#333333] border border-gray-700 rounded text-white appearance-none cursor-pointer pr-8"
                value={selectedVariantFilter}
                onChange={(e) => setSelectedVariantFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="with-variants">Products With Variants</option>
                <option value="without-variants">Products Without Variants</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Collapse Variants Toggle */}
            <div className="flex items-center gap-2 bg-[#333333] px-3 py-2 border border-gray-700 rounded">
              <span className="text-sm text-white">Collapse Variants</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={collapseVariants}
                  onChange={() => setCollapseVariants(!collapseVariants)}
                />
                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#336699] rounded peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded after:h-5 after:w-5 after:transition-all peer-checked:bg-[#336699]"></div>
              </label>
            </div>
        </div>

        {/* Product Grid - List View */}
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

        {/* Product Grid - Card View */}
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

        {/* Modals */}
        {deletingProduct && (
          <DeleteConfirmationModal
            title="Delete Product"
            message="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={() => handleDelete((deletingProduct as Product))}
            onCancel={() => setDeletingProduct(null)}
          />
        )}

        {/* Edit/Create Product/Assembly Drawer */}
        {(editingProduct || editingProduct === 'new') && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black bg-opacity-50"
              onClick={handleCloseProductForm}
            />
            <div
              className={`fixed inset-y-0 right-0 z-[70] w-full max-w-3xl bg-[#121212] shadow-xl transform transition-transform duration-300 ease-in-out ${isClosingDrawer ? 'translate-x-full' : 'translate-x-0'}`}
            >
              <div className="p-4">
                <ProductAssemblyForm
                  lineItems={lineItems}
                  onClose={handleCloseProductForm}
                  onSave={async (data: SaveData) => {
                    console.log('Saving product:', data);
                    try {
                      // Transform items data for the database
                      const transformedItems = data.items.map((item: LineItem) => ({
                        line_item_id: item.lineItemId,
                        quantity: item.quantity,
                        unit: item.unit,
                        price: item.price
                      }));

                      if (editingProduct && editingProduct !== 'new') {
                        // Update existing product
                        const { error: deleteError } = await supabase
                          .from('product_line_items')
                          .delete()
                          .eq('product_id', editingProduct.id);
                        if (deleteError) throw deleteError;

                        const { error: productError } = await supabase
                          .from('products')
                          .update({
                            name: data.name,
                            description: data.description,
                            status: 'published'
                          })
                          .eq('id', editingProduct.id);
                        if (productError) throw productError;

                        if (transformedItems.length > 0) {
                          const { error: itemsError } = await supabase
                            .from('product_line_items')
                            .insert(transformedItems.map((item) => ({
                              ...item,
                              product_id: editingProduct.id
                            })));
                          if (itemsError) throw itemsError;
                        }
                      } else {
                        // Create new product or variant
                        const productData: any = {
                          name: data.name,
                          description: data.description,
                          user_id: user?.id,
                          status: 'published',
                          is_base_product: false
                        };

                        // If creating a variant, add parent product relationship
                        if (editingProduct && editingProduct !== 'new') {
                          const productTyped = editingProduct as Product;
                          productData.is_base_product = false;
                          if (productTyped.category) productData.category = productTyped.category;
                        }

                        const { data: newProduct, error: productError } = await supabase
                          .from('products')
                          .insert([productData])
                          .select()
                          .single();

                        // If this is a variant, create the relationship in product_variants table
                        if (editingProduct && editingProduct !== 'new' && newProduct) {
                          const productTyped = editingProduct as Product;
                          if (productTyped.parent_product_id) {
                            const { error: variantError } = await supabase
                              .from('product_variants')
                              .insert([{
                                parent_product_id: productTyped.parent_product_id,
                                variant_product_id: newProduct.id,
                                variant_name: data.name
                              }]);
                            if (variantError) throw variantError;
                          }
                        }
                        if (productError) throw productError;

                        if (transformedItems.length > 0) {
                          const { error: itemsError } = await supabase
                            .from('product_line_items')
                            .insert(transformedItems.map((item) => ({
                              ...item,
                              product_id: newProduct.id
                            })));
                          if (itemsError) throw itemsError;
                        }
                      }
                      fetchProducts();
                      setEditingProduct(null);
                    } catch (error) {
                      console.error('Error saving product:', error);
                    }
                  }}
                  editingProduct={editingProduct === 'new' ? null : editingProduct}
                />
              </div>
            </div>
          </>
        )}
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