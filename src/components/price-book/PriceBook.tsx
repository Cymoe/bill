import { useState, useEffect, useMemo, useRef } from 'react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import TabMenu from '../common/TabMenu';
import { LineItemModal } from '../modals/LineItemModal';
import { EditLineItemModal } from '../modals/EditLineItemModal';
import { MoreVertical, Filter, ChevronDown, Plus, Copy, Star, Trash2, Edit3, Calculator, Search } from 'lucide-react';
import { PageHeaderBar } from '../common/PageHeaderBar';
import './price-book.css';
import { useNavigate, useLocation } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id: string;
  created_at: string;
  type: string;
  trade_id?: string;
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
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
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
        .update(data)
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      // Refresh the products list
      await fetchProducts();
      setShowEditLineItemModal(false);
      setEditingProduct(null);
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
          trade_id: product.trade_id
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
    // TODO: Implement print price book functionality
    console.log('Print price book clicked');
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Helper function to determine the trade for a product based on name and description
  const getTrade = (product: Product): string => {
    // Combine name and description for better matching
    const searchText = (product.name + ' ' + product.description).toLowerCase();
    
    // Map product names and descriptions to trades
    if (searchText.includes('plumb')) return 'Plumbing';
    if (searchText.includes('electric') || searchText.includes('wire') || searchText.includes('circuit')) return 'Electrical';
    if (searchText.includes('hvac') || searchText.includes('air') || searchText.includes('heat') || searchText.includes('cool')) return 'HVAC';
    if (searchText.includes('carpent') || searchText.includes('wood') || searchText.includes('timber')) return 'Carpentry';
    if (searchText.includes('paint') || searchText.includes('finish')) return 'Painting';
    if (searchText.includes('floor') || searchText.includes('tile')) return 'Flooring';
    if (searchText.includes('roof')) return 'Roofing';
    if (searchText.includes('landscape') || searchText.includes('garden') || searchText.includes('yard')) return 'Landscaping';
    if (searchText.includes('mason') || searchText.includes('brick') || searchText.includes('stone')) return 'Masonry';
    
    // If no match, default to General Construction
    return 'General Construction';
  };
  
  // Fetch trades from DB
  useEffect(() => {
    const fetchTrades = async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('id, name')
        .order('name');
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

    // Filter by trade_id (if not 'all')
    if (selectedTradeId !== 'all') {
      filtered = filtered.filter(product => product.trade_id === selectedTradeId);
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
        title="Price Book"
        searchPlaceholder="Search items..."
        onSearch={(query) => setSearchInput(query)}
        searchValue={searchInput}
        addButtonLabel="Add Item"
        onAddClick={() => setShowNewLineItemModal(true)}
      />
      
      {/* Stats Bar */}
      <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Items:</span>
          <span className="font-mono font-medium">1,000</span>
          <span className="text-gray-500 text-xs">($384,777.55)</span>
          </div>
        <div className="w-px h-4 bg-[#333333]" />
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Most Used:</span>
          <span className="font-medium">Material</span>
          <span className="text-gray-500 text-xs">(552)</span>
        </div>
        <div className="w-px h-4 bg-[#333333]" />
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Avg Price:</span>
          <span className="font-mono font-medium text-[#336699]">$384.78</span>
                      </div>
                    </div>

      {/* Controls Bar */}
      <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium flex items-center gap-2 min-w-[180px] hover:bg-[#252525] transition-colors">
              <span>All Trades</span>
              <span className="text-gray-500">(56)</span>
              <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
                    </button>
                    </div>
          <button className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[#252525] transition-colors">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
                    </button>
                  </div>
        <div className="flex items-center gap-2">
            <button
            onClick={() => setViewMode(viewMode === 'expanded' ? 'condensed' : 'expanded')}
            className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[#252525] transition-colors"
            >
            <span>{viewMode === 'expanded' ? 'Condense' : 'Expand'}</span>
            </button>
          <button className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] w-8 h-8 flex items-center justify-center hover:bg-[#252525] transition-colors">
            <MoreVertical className="w-4 h-4" />
              </button>
                  </div>
                </div>
        
      {/* Category Tabs */}
            <TabMenu
              items={[
                { id: 'all', label: 'All', count: products.length },
                { id: 'material', label: 'Material', count: products.filter(p => p.type === 'material').length },
                { id: 'labor', label: 'Labor', count: products.filter(p => p.type === 'labor').length },
                { id: 'equipment', label: 'Equipment', count: products.filter(p => p.type === 'equipment').length },
                { id: 'service', label: 'Service', count: products.filter(p => p.type === 'service').length },
          { id: 'subcontractor', label: 'Subcontractor', count: products.filter(p => p.type === 'subcontractor').length }
              ]}
              activeItemId={activeCategory}
              onItemClick={setActiveCategory}
            />

      {/* Table Header */}
      <div className="px-6 py-3 border-b border-[#333333] bg-[#1A1A1A] grid grid-cols-[100px_1fr_120px_100px_120px_120px_80px] gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
        <div>Type</div>
        <div>Name</div>
        <div className="text-right">Price</div>
        <div>Unit</div>
        <div>Trade</div>
        <div>Last Updated</div>
        <div className="text-center">Actions</div>
        </div>
        
      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#333333] rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No items in your price book yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Start building your price book by adding materials, labor, and services. This will help you create accurate estimates and invoices.
            </p>
            <button
              onClick={() => setShowNewLineItemModal(true)}
              className="bg-white hover:bg-gray-100 text-[#121212] px-6 py-3 rounded-[4px] font-medium transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#333333]">
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
                className="px-6 py-4 grid grid-cols-[100px_1fr_120px_100px_120px_120px_80px] gap-4 items-center hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                {/* Type */}
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-[2px] text-xs font-medium ${
                    product.type === 'material' ? 'bg-blue-500/20 text-blue-300' :
                    product.type === 'labor' ? 'bg-green-500/20 text-green-300' :
                    product.type === 'equipment' ? 'bg-orange-500/20 text-orange-300' :
                    product.type === 'service' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {product.type}
                  </span>
                </div>

                {/* Name */}
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{product.name}</div>
                  {product.description && (
                    <div className="text-sm text-gray-400 truncate">{product.description}</div>
                  )}
                  {product.sku && (
                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                  )}
                    </div>
                    
                {/* Price */}
                <div className="font-mono font-medium text-white text-right">
                  {formatCurrency(product.price)}
                    </div>
                    
                {/* Unit */}
                <div className="text-gray-300 capitalize truncate">{product.unit}</div>

                {/* Trade */}
                <div className="text-gray-300 truncate">{getTrade(product)}</div>

                {/* Last Updated */}
                <div className="text-gray-400 text-sm">
                  {new Date(product.updated_at || product.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center relative">
                    <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click
                      e.preventDefault(); // Prevent any default behavior
                      
                      // Toggle dropdown - if it's open for this product, close it, otherwise open it
                      if (activeDropdown === product.id) {
                        setActiveDropdown(null);
                      } else {
                        setActiveDropdown(product.id);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-[2px] hover:bg-[#333333] transition-colors"
                    >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
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
                        className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                        Edit Item
                    </button>
                      
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateProduct(product);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    >
                        <Copy className="w-4 h-4 mr-3 text-gray-400" />
                        Duplicate
                    </button>
                      
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(product);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    >
                        <Star className={`w-4 h-4 mr-3 ${product.favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                        {product.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                      
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToEstimate(product);
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
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

      {/* New Line Item Modal */}
      {showNewLineItemModal && (
        <LineItemModal
          onClose={() => setShowNewLineItemModal(false)}
          onSave={() => {
            setShowNewLineItemModal(false);
            fetchProducts(); // Refresh the list
            }}
          />
        )}

      {/* Edit Line Item Modal */}
      {showEditLineItemModal && editingProduct && (
        <EditLineItemModal
          product={editingProduct}
          onClose={() => {
            setShowEditLineItemModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveEdit}
          />
        )}
      </div>
  );
};

export default PriceBook;
