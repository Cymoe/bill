import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { formatCurrency } from '../../utils/format';
import { IndustryContext } from '../layouts/DashboardLayout';
import { PageHeaderBar } from '../common/PageHeaderBar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import TabMenu from '../common/TabMenu';
import { EditLineItemModal } from '../modals/EditLineItemModal';
import { LineItemModal } from '../modals/LineItemModal';
import { MoreVertical, Filter, Minimize2, ChevronDown } from 'lucide-react';
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

// Define the subcategory interface
interface Subcategory {
  name: string;
  count: number;
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
  const { selectedIndustry, setSelectedIndustry } = useContext(IndustryContext);
  const [showNewLineItemModal, setShowNewLineItemModal] = useState(false);
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
  const [workTypeDropdownOpen, setWorkTypeDropdownOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All Items');
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
  
  // Check if tutorial mode is enabled via URL parameter
  const searchParams = new URLSearchParams(location.search);
  const showTutorial = searchParams.get('tutorial') === 'true';
  
  const togglePriceSort = () => {
    setPriceSort(priceSort === 'asc' ? 'desc' : 'asc');
  };
  
  // Subcategories by work type
  const subcategoriesByIndustry: { [key: string]: Subcategory[] } = {
    'General Construction': [
      { name: 'All General Construction Items', count: 98 },
      { name: 'Foundation', count: 15 },
      { name: 'Framing', count: 22 },
      { name: 'Drywall', count: 18 },
      { name: 'Insulation', count: 12 },
      { name: 'Siding', count: 14 },
      { name: 'Windows & Doors', count: 17 },
    ],
    'Plumbing': [
      { name: 'All Plumbing Items', count: 76 },
      { name: 'Fixtures', count: 25 },
      { name: 'Pipes & Fittings', count: 30 },
      { name: 'Water Heaters', count: 8 },
      { name: 'Drainage', count: 13 },
    ],
    'Electrical': [
      { name: 'All Electrical Items', count: 82 },
      { name: 'Wiring', count: 20 },
      { name: 'Panels & Breakers', count: 15 },
      { name: 'Lighting', count: 25 },
      { name: 'Outlets & Switches', count: 12 },
      { name: 'Smart Home', count: 10 },
    ],
    'HVAC': [
      { name: 'All HVAC Items', count: 65 },
      { name: 'Heating', count: 18 },
      { name: 'Cooling', count: 22 },
      { name: 'Ventilation', count: 15 },
      { name: 'Ductwork', count: 10 },
    ],
    'Carpentry': [
      { name: 'All Carpentry Items', count: 70 },
      { name: 'Rough Carpentry', count: 25 },
      { name: 'Finish Carpentry', count: 30 },
      { name: 'Cabinetry', count: 15 },
    ],
    'Painting': [
      { name: 'All Painting Items', count: 45 },
      { name: 'Interior', count: 20 },
      { name: 'Exterior', count: 15 },
      { name: 'Specialty Finishes', count: 10 },
    ],
    'Flooring': [
      { name: 'All Flooring Items', count: 55 },
      { name: 'Hardwood', count: 15 },
      { name: 'Tile', count: 18 },
      { name: 'Carpet', count: 12 },
      { name: 'Vinyl/Laminate', count: 10 },
    ],
    'Roofing': [
      { name: 'All Roofing Items', count: 40 },
      { name: 'Shingles', count: 15 },
      { name: 'Metal', count: 10 },
      { name: 'Flat Roof', count: 8 },
      { name: 'Gutters', count: 7 },
    ],
    'Landscaping': [
      { name: 'All Landscaping Items', count: 50 },
      { name: 'Hardscaping', count: 15 },
      { name: 'Planting', count: 20 },
      { name: 'Irrigation', count: 10 },
      { name: 'Lighting', count: 5 },
    ],
    'Masonry': [
      { name: 'All Masonry Items', count: 35 },
      { name: 'Brick', count: 12 },
      { name: 'Stone', count: 15 },
      { name: 'Concrete', count: 8 },
    ],
    'All Trades': [
      { name: 'All Items', count: 0 },
    ],
  };
  
  // Reset the active category when industry changes and update subcategory
  useEffect(() => {
    setActiveCategory('all');
    // Select the first subcategory when changing work types
    if (selectedIndustry !== 'All Trades' && subcategoriesByIndustry[selectedIndustry]?.length > 0) {
      setSelectedSubcategory(subcategoriesByIndustry[selectedIndustry][0].name);
    }
  }, [selectedIndustry]);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <>
      <PageHeaderBar 
        title="Price Book"
        searchPlaceholder="Search price book..."
        searchValue={searchInput}
        onSearch={setSearchInput}
        onAddClick={() => setShowNewLineItemModal(true)}
        addButtonLabel="Line Item"
      />
      
      {/* Price Book Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#333333]">
        {/* Total Items */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Total Items</div>
          <div className="text-3xl font-bold text-white mb-1">{products.length}</div>
          <div className="text-sm text-gray-400">Total Value: {formatCurrency(products.reduce((sum, p) => sum + p.price, 0))}</div>
        </div>
        
        {/* Most Popular Category */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#10b981]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Most Used</div>
          <div className="text-3xl font-bold text-[#10b981] mb-1">
            {(() => {
              const materialCount = products.filter(p => p.type === 'material').length;
              const laborCount = products.filter(p => p.type === 'labor').length;
              const equipmentCount = products.filter(p => p.type === 'equipment').length;
              const serviceCount = products.filter(p => p.type === 'service').length;
              const subCount = products.filter(p => p.type === 'subcontractor').length;
              
              const counts = [
                { type: 'Material', count: materialCount },
                { type: 'Labor', count: laborCount },
                { type: 'Equipment', count: equipmentCount },
                { type: 'Service', count: serviceCount },
                { type: 'Subcontractor', count: subCount }
              ];
              
              const mostUsed = counts.reduce((max, current) => current.count > max.count ? current : max, counts[0]);
              return mostUsed?.type || 'Material';
            })()}
          </div>
          <div className="text-sm text-gray-400">
            {(() => {
              const materialCount = products.filter(p => p.type === 'material').length;
              const laborCount = products.filter(p => p.type === 'labor').length;
              const equipmentCount = products.filter(p => p.type === 'equipment').length;
              const serviceCount = products.filter(p => p.type === 'service').length;
              const subCount = products.filter(p => p.type === 'subcontractor').length;
              
              const counts = [
                { type: 'material', count: materialCount },
                { type: 'labor', count: laborCount },
                { type: 'equipment', count: equipmentCount },
                { type: 'service', count: serviceCount },
                { type: 'subcontractor', count: subCount }
              ];
              
              const mostUsed = counts.reduce((max, current) => current.count > max.count ? current : max, counts[0]);
              return mostUsed?.count || 0;
            })()} items
          </div>
        </div>
        
        {/* Average Price */}
        <div className="relative bg-[#1a1a1a] border-r border-[#333333] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Average Price</div>
          <div className="text-3xl font-bold text-[#3b82f6] mb-1">
            {formatCurrency(products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0)}
          </div>
          <div className="text-sm text-gray-400">
            {products.length > 0 ? `Range: ${formatCurrency(Math.min(...products.map(p => p.price)))} - ${formatCurrency(Math.max(...products.map(p => p.price)))}` : 'No items yet'}
          </div>
        </div>
        
        {/* Recent Additions */}
        <div className="relative bg-[#1a1a1a] p-6 hover:bg-[#222222] transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#F9D71C]"></div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Recent Additions</div>
          <div className="text-3xl font-bold text-[#F9D71C] mb-1">
            {(() => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return products.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
            })()}
          </div>
          <div className="text-sm text-gray-400">Last 30 days</div>
        </div>
      </div>
      
      <div className="flex flex-col h-full price-book-container">
        {/* Trade Filter & Sort Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
          {/* Left side - View Mode and Primary Filter */}
          <div className="flex items-center gap-4">
            {/* View Mode Toggles - More Prominent */}
            <div className="flex bg-[#333333] border border-gray-700 rounded overflow-hidden">
              <button
                className="px-4 py-2 bg-[#336699] text-white"
              >
                List
              </button>
              <button
                className="px-4 py-2 text-gray-400 hover:bg-gray-700"
              >
                Cards
              </button>
            </div>

            {/* Primary Trade Filter - More Prominent */}
            <div className="relative">
              <select
                className="bg-[#232323] border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#336699] appearance-none cursor-pointer pr-10 min-w-[200px]"
                value={selectedTradeId}
                onChange={(e) => setSelectedTradeId(e.target.value)}
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
                <div className="absolute left-0 top-full mt-2 w-72 bg-[#232323] border border-gray-700 rounded shadow-lg z-50">
                  <div className="p-4 space-y-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Status</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    {/* Favorites Filter */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="favorites"
                        checked={showFavoritesOnly}
                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                        className="rounded bg-[#181818] border-gray-700 text-[#336699]"
                      />
                      <label htmlFor="favorites" className="ml-2 text-sm text-white">Show Favorites Only</label>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Date Updated</label>
                      <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="all">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                      </select>
                    </div>

                    {/* Vendor Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Vendor</label>
                      <select
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="all">All Vendors</option>
                        {vendors.map(vendor => (
                          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Price Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-1/2 bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>

                    {/* Unit Filter */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Unit</label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="w-full bg-[#181818] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      >
                        <option value="any">Any Unit</option>
                        <option value="ea">Each (ea)</option>
                        <option value="hr">Hour (hr)</option>
                        <option value="ft">Feet (ft)</option>
                        <option value="sq ft">Square Feet (sq ft)</option>
                        <option value="cu yd">Cubic Yard (cu yd)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Condensed Toggle and Options Menu */}
          <div className="flex items-center gap-4">
            {/* Condensed View Toggle */}
            <button
              onClick={() => setCondensed(!condensed)}
              className="flex items-center gap-2 px-3 py-2 bg-[#232323] border border-gray-700 rounded text-white hover:bg-[#2A2A2A] transition-colors"
              title={condensed ? "Expand view" : "Condense view"}
            >
              <Minimize2 size={16} />
              {condensed ? "Expand" : "Condense"}
            </button>

            {/* Options Menu */}
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
                    onClick={() => { setShowOptionsMenu(false); /* handleImportItems(); */ }}
                  >
                    Import Items
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); /* handleExportToCSV(); */ }}
                  >
                    Export to CSV
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#336699] transition-colors"
                    onClick={() => { setShowOptionsMenu(false); /* handlePrintPriceBook(); */ }}
                  >
                    Print Price Book
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content area for products */}
        
        {/* Category Tabs and three-dot menu */}
        <div className="flex items-center justify-between px-0">
          <div className="flex-grow">
            <TabMenu
              items={[
                { id: 'all', label: 'All', count: products.length },
                { id: 'material', label: 'Material', count: products.filter(p => p.type === 'material').length },
                { id: 'labor', label: 'Labor', count: products.filter(p => p.type === 'labor').length },
                { id: 'equipment', label: 'Equipment', count: products.filter(p => p.type === 'equipment').length },
                { id: 'service', label: 'Service', count: products.filter(p => p.type === 'service').length },
                { id: 'subcontractor', label: 'Subcontractor', count: products.filter(p => p.type === 'subcontractor').length },
              ]}
              activeItemId={activeCategory}
              onItemClick={setActiveCategory}
            />
          </div>
        </div>
        
        {/* Show subcategories if a specific work type is selected */}
        {selectedIndustry !== 'All Trades' && (
          <div className="px-8 py-4 bg-gray-900/30">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-400">Subcategories:</span>
              {subcategoriesByIndustry[selectedIndustry]?.map((sub, index) => (
                index > 0 && (
                  <button
                    key={sub.name}
                    className={`px-3 py-1 text-xs rounded-full ${selectedSubcategory === sub.name ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => setSelectedSubcategory(sub.name)}
                  >
                    {sub.name.replace(`All ${selectedIndustry} Items`, '').trim()} 
                    <span className="ml-1 opacity-60">{sub.count}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        )}

        {/* Products Table - full width */}
        <div className="mt-0 px-0">
          {filteredProducts.length === 0 ? (
            products.length === 0 || showTutorial ? (
              // Contextual Onboarding for empty state
              <div className="max-w-4xl mx-auto p-8">
                {/* Welcome Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#336699] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Your Price Book</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Your price book is your competitive advantage. Build a comprehensive catalog of materials, 
                    labor rates, and services with accurate pricing to create estimates faster and more consistently.
                  </p>
                </div>

                {/* Video Section */}
                <div className="mb-8">
                  <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold flex items-center">
                        <span className="text-[#336699] mr-2">🎥</span>
                        Watch: Building Your Price Book
                      </h3>
                      <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">7 min</span>
                    </div>
                    
                    {/* Video Embed Container */}
                    <div className="relative w-full h-0 pb-[56.25%] bg-[#333333] rounded-[4px] overflow-hidden">
                      {/* Replace this iframe src with your actual Loom video URL */}
                      <iframe
                        src="https://www.loom.com/embed/0c9786a7fd61445bbb23b6415602afe4"
                        frameBorder="0"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                        title="Building Your Price Book"
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
                      Learn how successful contractors build and maintain price books that give them 
                      a competitive edge and ensure profitable projects every time.
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
                      <h3 className="text-white font-bold">Add Your First Item</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Start with a common material or labor rate you use frequently in your projects.
                    </p>
                    <button
                      onClick={() => setShowNewLineItemModal(true)}
                      className="w-full bg-[#336699] text-white py-2 px-4 rounded-[4px] hover:bg-[#2A5580] transition-colors font-medium"
                    >
                      ADD LINE ITEM
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#9E9E9E] opacity-75">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-[#9E9E9E] rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        2
                      </div>
                      <h3 className="text-gray-400 font-bold">Organize by Trade</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Group items by trade and category for easy navigation during estimating.
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
                      Pull items from your price book to create accurate estimates in seconds.
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
                    Pro Tips for Price Book Success
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="text-white text-sm font-medium">Include markup in pricing</p>
                          <p className="text-gray-400 text-xs">Factor in overhead, profit, and risk into every line item</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="text-white text-sm font-medium">Update prices regularly</p>
                          <p className="text-gray-400 text-xs">Review and adjust pricing quarterly to stay competitive</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="text-white text-sm font-medium">Track vendor pricing</p>
                          <p className="text-gray-400 text-xs">Link items to vendors for easy price updates</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#336699] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="text-white text-sm font-medium">Use detailed descriptions</p>
                          <p className="text-gray-400 text-xs">Include specs, brands, and installation notes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item Types */}
                <div className="text-center mt-8">
                  <p className="text-gray-400 text-sm mb-4">
                    Common line item types to get you started:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setShowNewLineItemModal(true)}
                      className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
                    >
                      🧱 Materials
                    </button>
                    <button
                      onClick={() => setShowNewLineItemModal(true)}
                      className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
                    >
                      👷 Labor Rates
                    </button>
                    <button
                      onClick={() => setShowNewLineItemModal(true)}
                      className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
                    >
                      🔧 Equipment
                    </button>
                    <button
                      onClick={() => setShowNewLineItemModal(true)}
                      className="px-3 py-1 bg-[#333333] text-gray-300 rounded-[4px] text-sm hover:bg-[#404040] transition-colors"
                    >
                      🚚 Subcontractors
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-[#181818]">
                No pricing items found. Try adjusting your filters.
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${condensed ? 'condensed' : ''}`}>
                <thead>
                  <tr className="bg-[#232323] text-left text-xs uppercase tracking-wider text-white border-b border-gray-700 font-['Roboto_Condensed']">
                    <th className="py-3 px-3 w-[20%]">NAME</th>
                    <th className="py-3 px-3 w-[30%]">DESCRIPTION</th>
                    <th 
                      className="py-3 px-3 text-right w-[15%] cursor-pointer hover:text-[#336699] transition-colors"
                      onClick={togglePriceSort}
                    >
                      PRICE {priceSort === 'desc' ? '▼' : '▲'}
                    </th>
                    <th className="py-3 px-3 w-[10%] text-center">UNIT</th>
                    <th className="py-3 px-3 w-[10%] text-center">TYPE</th>
                    <th className="py-3 px-3 w-[15%] text-center">TRADE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-[#181818]' : 'bg-[#1E1E1E]'} hover:bg-[#232323] cursor-pointer transition-colors`}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductMenu(true);
                      }}
                    >
                      <td className="py-3 px-3 font-medium text-white">{product.name}</td>
                      <td className="py-3 px-3 text-gray-300">{product.description}</td>
                      <td className="py-3 px-3 text-right font-medium text-white">{formatCurrency(product.price)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-1 bg-[#333333] text-xs text-gray-300 rounded badge-unit">
                          {product.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-1 bg-[#336699] text-xs text-white rounded badge-type">
                          {product.type === 'subcontractor' ? 'Sub' : product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-300 text-xs">
                        {trades.find(t => t.id === product.trade_id)?.name || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Line Item Modal - for editing existing items */}
        {showProductMenu && selectedProduct && (
          <EditLineItemModal
            product={selectedProduct}
            onClose={() => setShowProductMenu(false)}
            onSave={async (updatedProduct) => {
              try {
                // Update existing product
                const { error } = await supabase
                  .from('products')
                  .update(updatedProduct)
                  .eq('id', selectedProduct.id);
                
                if (error) throw error;
                
                // Refresh products list
                fetchProducts();
                setShowProductMenu(false);
              } catch (error) {
                console.error('Error updating product:', error);
              }
            }}
          />
        )}

        {/* New Line Item Modal - for creating new items */}
        {showNewLineItemModal && (
          <LineItemModal
            onClose={() => setShowNewLineItemModal(false)}
            onSave={async (data) => {
              try {
                // Create new product
                const { error } = await supabase
                  .from('products')
                  .insert({
                    ...data,
                    user_id: user?.id,
                    status: 'active',
                    favorite: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                
                if (error) throw error;
                
                // Refresh products list
                fetchProducts();
                setShowNewLineItemModal(false);
              } catch (error) {
                console.error('Error creating product:', error);
              }
            }}
          />
        )}
      </div>
    </>
  );
};
