import React, { useState, useEffect, useRef, FC } from 'react';
import ProductComparisonModal from './ProductComparisonModal';
import { MoreVertical, ChevronDown, Plus, Filter, Upload, Download, Printer, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductAssemblyForm } from './ProductAssemblyForm';
import { ProductOptionsDemo } from './ProductOptionsDemo';

// Product type
interface Product {
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

const CATEGORY_COLORS: Record<string, string> = {
  interior: 'bg-purple-700',
  exterior: 'bg-blue-700',
  installation: 'bg-green-700',
  construction: 'bg-yellow-700',
};

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);
  
  // Handle closing the product form drawer with animation
  const handleCloseProductForm = () => {
    setIsClosingDrawer(true);
    setTimeout(() => {
      setEditingProduct(null);
      setIsClosingDrawer(false);
    }, 300); // Match the animation duration in tailwind.config.js
  };
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  // Using only priceMin/priceMax without setters since they're only used for filtering
  const [priceMin] = useState<number | undefined>();
  const [priceMax] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState('most-used');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'cards'
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [comparingProduct, setComparingProduct] = useState<any>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Helper function to get the label for the current sort option
  const getSortLabel = (sortOption: string): string => {
    switch (sortOption) {
      case 'name-asc':
        return 'Name';
      case 'price-desc':
        return 'Price (High-Low)';
      case 'price-asc':
        return 'Price (Low-High)';
      case 'most-used':
        return 'Most Used';
      case 'created-desc':
        return 'Recently Used';
      case 'created-asc':
        return 'Oldest First';
      default:
        return 'Recently Used';
    }
  };

  // Get the name of the selected trade
  const getSelectedTradeName = () => {
    if (selectedCategory === 'all') return `All Trades (${trades.length})`;
    return trades.find(t => t.id === selectedCategory)?.name || 'All Trades';
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

  // Use isLoading to show loading state
  // This function is currently unused but may be needed in the future
  // const showLoadingState = () => {
  //   if (isLoading) {
  //     return <div className="text-center py-10">Loading products...</div>;
  //   }
  //   return null;
  // };

  const filteredProducts = products
    .filter((product) => {
      // Filter by trade
      if (selectedCategory !== 'all' && product.trade?.id !== selectedCategory) return false;
      // Subcategory (if present on Product type)
      // if (selectedCategory !== 'all' && selectedSubcategory !== 'all' && product.subcategory && product.subcategory.toLowerCase() !== selectedSubcategory) return false;
      // Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !product.name.toLowerCase().includes(s) &&
          !product.description?.toLowerCase().includes(s) &&
          !product.type?.toLowerCase().includes(s) &&
          !(product.price && product.price.toString().includes(s))
        ) {
          return false;
        }
      }
      // Price range
      if (priceMin !== undefined && product.price < Number(priceMin)) return false;
      if (priceMax !== undefined && product.price > Number(priceMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'created-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'created-asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
    });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Used when duplicating a product or variant
  const handleDuplicate = async (productId: string) => {
    try {
      const productToDuplicate = products.find(p => p.id === productId);
      if (!productToDuplicate) return;

      // Create a new product with the same data but a new ID
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: `${productToDuplicate.name} (Copy)`,
          description: productToDuplicate.description,
          price: productToDuplicate.price,
          unit: productToDuplicate.unit,
          user_id: user?.id,
          type: productToDuplicate.type,
          category: productToDuplicate.category,
          is_base_product: productToDuplicate.is_base_product,
          parent_product_id: productToDuplicate.parent_product_id,
          variant_name: productToDuplicate.variant_name ? `${productToDuplicate.variant_name} (Copy)` : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicate the line items if any
      if (productToDuplicate.items && productToDuplicate.items.length > 0) {
        const newItems = productToDuplicate.items.map(item => ({
          product_id: data.id,
          line_item_id: item.lineItemId,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from('product_line_items')
          .insert(newItems);

        if (itemsError) throw itemsError;
      }

      // Refresh products list
      fetchProducts();
      
      // Show success message
      alert('Product duplicated successfully!');

    } catch (err) {
      console.error('Error duplicating product:', err);
      alert('Failed to duplicate product. Please try again.');
    }
  };

  // Get background color class for category badges
  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-700';
    const categoryKey = category.toLowerCase() as keyof typeof CATEGORY_COLORS;
    return CATEGORY_COLORS[categoryKey] || 'bg-gray-700';
  };
  
  // Get color for variant based on variant name
  const getVariantColor = (variantName?: string) => {
    if (!variantName) return 'bg-gray-500';
    
    const variantColors: Record<string, string> = {
      'standard': 'bg-green-500',
      'premium': 'bg-blue-500',
      'deluxe': 'bg-purple-500',
      'basic': 'bg-yellow-500',
      'economy': 'bg-gray-500',
      'professional': 'bg-indigo-500',
      'double': 'bg-orange-500'
    };
    
    // Try to match variant name to predefined colors
    const lowerName = variantName.toLowerCase();
    for (const [key, value] of Object.entries(variantColors)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }
    
    // Default colors for common words
    if (lowerName.includes('entry') || lowerName.includes('single')) return 'bg-green-500';
    if (lowerName.includes('mid') || lowerName.includes('medium')) return 'bg-blue-500';
    if (lowerName.includes('high') || lowerName.includes('premium')) return 'bg-purple-500';
    
    return 'bg-gray-500'; // Default color
  };
  
  // Get emoji for product category
  const getCategoryEmoji = (category: string): string => {
    const categoryEmojis: Record<string, string> = {
      'carpentry': '🪵',
      'electrical': '💡',
      'plumbing': '🚿',
      'painting': '🎨',
      'tile': '🧱',
      'flooring': '🪑',
      'roofing': '🏠',
      'hvac': '❄️',
      'landscaping': '🌳',
      'general': '🔧'
    };
    
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(categoryEmojis)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
    
    return '🔧'; // Default emoji
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
    // TODO: Implement print price book functionality
    console.log('Print price book clicked');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handler = () => setEditingProduct('new');
    window.addEventListener('openNewProductDrawer', handler);
    return () => window.removeEventListener('openNewProductDrawer', handler);
  }, []);

  useEffect(() => {
    console.log('Current editingProduct state:', editingProduct);
  }, [editingProduct]);

  useEffect(() => {
    console.log('Current lineItems state:', lineItems);
  }, [lineItems]);

  return (
    <DashboardLayout>
      <div className="bg-[#121212] min-h-screen relative flex flex-col px-0 py-0">
        {/* Mobile header - only visible on mobile */}
        <div className="md:hidden relative flex flex-col space-y-4 pb-4 border-b border-gray-800 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-full bg-blue-600 text-white"
                onClick={() => navigate('/products/new')}
              >
                <Plus size={20} />
              </button>
              <button 
                className="p-2 rounded-full bg-[#232635] text-white"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter size={20} />
              </button>
              <button 
                className="p-2 rounded-full bg-[#232635] text-white"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
          <p className="text-gray-400">Manage all your products and assemblies in one place</p>
        </div>
        
        {/* Mobile filter and sort options - only visible on mobile */}
        <div className="md:hidden flex flex-col space-y-4 mt-4 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            {/* Category Filter Dropdown - Mobile */}
            <div className="w-full relative" ref={categoryMenuRef}>
              <button 
                className="w-full flex items-center justify-between px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              >
                <span className="truncate">{selectedCategory === 'all' ? `All Trades (${trades.length})` : trades.find(t => t.id === selectedCategory)?.name || 'All Trades'}</span>
                <ChevronDown size={16} />
              </button>
              
              {showCategoryMenu && (
                <div className="absolute left-0 right-0 top-12 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2"
                    onClick={() => {
                      setSelectedCategory('all');
                      setShowCategoryMenu(false);
                    }}
                  >
                    <span className="ml-2">All Trades ({trades.length})</span>
                  </button>
                  
                  {trades.map(trade => (
                    <button 
                      key={trade.id}
                      className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2"
                      onClick={() => {
                        setSelectedCategory(trade.id);
                        setShowCategoryMenu(false);
                      }}
                    >
                      <span className="ml-2">{trade.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sort Dropdown - Mobile */}
            <div className="w-full relative" ref={sortMenuRef}>
              <button 
                className="w-full flex items-center justify-between px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span className="truncate">Sort by: {getSortLabel(sortBy)}</span>
                <ChevronDown size={16} />
              </button>
              
              {showSortMenu && (
                <div className="absolute left-0 right-0 top-12 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'name-asc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('name-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'name-asc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'name-asc' ? 'ml-2' : 'ml-6'}>Sort by: Name</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'price-desc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('price-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'price-desc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'price-desc' ? 'ml-2' : 'ml-6'}>Sort by: Price (High-Low)</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'most-used' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('most-used');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'most-used' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'most-used' ? 'ml-2' : 'ml-6'}>Sort by: Recently Used</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:flex relative items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-gray-400">Manage all your products and assemblies in one place</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* New Product Button removed - using existing add product functionality */}
            
            {/* Sort By Dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span>Sort by: {getSortLabel(sortBy)}</span>
                <ChevronDown size={16} />
              </button>
              
              {showSortMenu && (
                <div className="absolute left-0 top-12 w-64 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'name-asc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('name-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'name-asc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'name-asc' ? 'ml-2' : 'ml-6'}>Sort by: Name</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'price-desc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('price-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'price-desc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'price-desc' ? 'ml-2' : 'ml-6'}>Sort by: Price (High-Low)</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'price-asc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('price-asc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'price-asc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'price-asc' ? 'ml-2' : 'ml-6'}>Sort by: Price (Low-High)</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'most-used' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('most-used');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'most-used' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'most-used' ? 'ml-2' : 'ml-6'}>Sort by: Most Used</span>
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-3 text-white hover:bg-gray-600 flex items-center gap-2 ${sortBy === 'created-desc' ? 'bg-green-700' : ''}`}
                    onClick={() => {
                      setSortBy('created-desc');
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === 'created-desc' && <span className="text-white">✓</span>}
                    <span className={sortBy === 'created-desc' ? 'ml-2' : 'ml-6'}>Sort by: Recently Used</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products by name, type, or price range..."
                className="w-64 px-4 py-2 bg-[#1E2130] border border-gray-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
              onClick={() => setShowFilter(true)}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            
            <div className="relative" ref={optionsMenuRef}>
              <button
                className="p-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <MoreVertical size={20} />
              </button>
              
              {showOptionsMenu && (
                <div className="absolute right-0 top-12 w-48 bg-[#232635] rounded-md shadow-lg z-10 py-0.5 border border-gray-600">
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
        <div className="hidden md:block px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <select
                className="appearance-none w-full bg-[#1E2130] border border-gray-700 px-4 py-2 pr-8 rounded-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
        <div className="px-4 py-2 flex justify-end">
          <div className="flex items-center bg-[#232635] rounded-full">
            <button 
              className={`px-4 py-2 rounded-full ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className={`px-4 py-2 rounded-full ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setViewMode('cards')}
            >
              Card View
            </button>
          </div>
        </div>
        
        {/* Product Grid - List View */}
        {viewMode === 'list' && (
          <div className="px-2 sm:px-4 py-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-20">No products found.</div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-[#1A1D2D] rounded-xl overflow-hidden">
                    {/* Base Product Header - Entire row clickable */}
                    <div 
                      className="bg-[#232635] p-4 flex justify-between items-center cursor-pointer hover:bg-[#2A2E40] transition-colors"
                      onClick={() => setExpandedProductId(expandedProductId === product.id ? null : product.id)}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedProductId === product.id ? 'transform rotate-90' : ''}`} />
                        <div>
                          <h2 className="text-xl font-bold text-white">{product.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400 text-sm">
                              {product.trade?.name || 'General'} • {product.variants?.length || 0} variants
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
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
                          className="bg-[#232635] hover:bg-[#2A2E40] text-white px-4 py-2 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setComparingProduct(product);
                          }}
                        >
                          Compare
                        </button>
                      </div>
                    </div>
                    
                    {/* Variants List - Only shown when expanded */}
                    {expandedProductId === product.id && product.variants && product.variants.length > 0 && (
                      <div className="p-4 space-y-2">
                        {product.variants.map((variant: any) => (
                          <div 
                            key={variant.id} 
                            className="flex items-center justify-between p-4 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-[#232635] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open the drawer to edit this variant
                              setEditingProduct(variant);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getVariantColor(variant.variant_name)}`}></div>
                              <span className="font-medium text-white">{variant.variant_name || variant.name}</span>
                              <span className="text-gray-400 text-sm">({variant.items?.length || 0} items)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-white">{formatCurrency(variant.price || 0)}</span>
                              <button 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add to package logic here
                                }}
                              >
                                Add to Package
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
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#232635] transition-colors rounded-lg"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">({product.items?.length || 0} items)</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-white">{formatCurrency(product.price || 0)}</span>
                            <button 
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add to package logic here
                              }}
                            >
                              Add to Package
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
          <div className="px-2 sm:px-4 py-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-20">No products found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="bg-[#1A1D2D] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                  >
                    <div className="p-5 border-b border-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-semibold mb-1 text-white">{product.name}</h2>
                          <div className="text-sm text-gray-400 mb-2">
                            {product.trade?.name || 'General'} • {product.variants?.length || 0} variants
                          </div>
                        </div>
                        <div className="text-4xl">
                          {getCategoryEmoji(product.category || '')}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{product.description}</p>
                    </div>
                    
                    {product.variants && product.variants.length > 0 ? (
                      <div className="p-3 bg-[#232635] border-b border-gray-700">
                        <div className="text-sm font-medium text-gray-300 mb-2">Available Variants:</div>
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
                                <div className={`w-2 h-2 rounded-full mr-2 ${getVariantColor(variant.variant_name)}`}></div>
                                <span className="text-sm truncate max-w-[160px] text-white">{variant.variant_name || variant.name}</span>
                              </div>
                              <span className="text-sm font-medium text-white">{formatCurrency(variant.price || 0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#232635] border-b border-gray-700">
                        <div className="text-sm font-medium text-gray-300 mb-2">No variants available</div>
                      </div>
                    )}
                    
                    <div className="p-3 bg-[#1A1D2D] flex space-x-2">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-grow px-3 py-1.5 rounded-full text-sm font-medium flex items-center justify-center transition-colors"
                        onClick={() => navigate(`/products/variant/new?parent=${product.id}`)}
                      >
                        <span className="mr-1">+</span> Add Variant
                      </button>
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-grow px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                        onClick={() => setComparingProduct(product)}
                      >
                        Compare
                      </button>
                    </div>
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
            onConfirm={() => handleDelete(deletingProduct.id)}
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
              className={`fixed top-0 right-0 h-full w-[50vw] max-w-full z-[70] bg-[#121212] shadow-xl overflow-y-auto ${isClosingDrawer ? 'animate-slide-out' : ''}`}
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
                          productData.is_base_product = false;
                          if (editingProduct.category) productData.category = editingProduct.category;
                        }
                        
                        const { data: newProduct, error: productError } = await supabase
                          .from('products')
                          .insert([productData])
                          .select()
                          .single();
                          
                        // If this is a variant, create the relationship in product_variants table
                        if (editingProduct && editingProduct !== 'new' && newProduct) {
                          if (editingProduct.parent_product_id) {
                            const { error: variantError } = await supabase
                              .from('product_variants')
                              .insert([{
                                parent_product_id: editingProduct.parent_product_id,
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
      </div>
    </DashboardLayout>
  );
};