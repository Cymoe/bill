import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout, IndustryContext } from '../layouts/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../common/PageHeader';
import TabMenu from '../common/TabMenu';
import { EditLineItemModal } from '../modals/EditLineItemModal';
import { LineItemModal } from '../modals/LineItemModal';
import { MoreVertical, Upload, Download, Printer, Filter } from 'lucide-react';

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

export const PriceBook = () => {
  const { user } = useAuth();
  // Initialize with 'All Trades' instead of 'All Work Types'
  const { selectedIndustry, setSelectedIndustry } = useContext(IndustryContext);
  const [showNewLineItemModal, setShowNewLineItemModal] = useState(false);
  
  // Update the context if it's still using the old value
  useEffect(() => {
    // Expose a function to open the line item modal globally
    // This allows the sidebar button to open the modal
    window.openLineItemModal = () => {
      setShowNewLineItemModal(true);
    };
    
    // Clean up function
    return () => {
      delete window.openLineItemModal;
    };
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [workTypeDropdownOpen, setWorkTypeDropdownOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All Items');
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('all');
  
  const togglePriceSort = () => {
    setPriceSort(priceSort === 'asc' ? 'desc' : 'asc');
  };
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
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

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by trade_id (if not 'all')
    if (selectedTradeId !== 'all') {
      filtered = filtered.filter(product => product.trade_id === selectedTradeId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Apply type filter from dropdown (if not using the tab menu)
    if (selectedType !== 'all' && activeCategory === 'all') {
      filtered = filtered.filter(product => product.type.toLowerCase() === selectedType);
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
  }, [products, selectedTradeId, searchTerm, activeCategory, minPrice, maxPrice, selectedType, selectedUnit, priceSort]);

  return (
    <DashboardLayout>
      <div className="space-y-0">
        <div className="relative flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Price Book</h1>
            <p className="text-gray-400">Manage all your pricing items in one place</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pricing items by name, type, or price range..."
                className="w-64 px-4 py-2 bg-[#1E2130] border border-gray-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#232635] border border-gray-700 rounded-full text-white hover:bg-gray-700"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
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
        
        {/* Filter Menu */}
        {showFilterMenu && (
          <div className="p-4 bg-[#1E2130] border border-gray-800 rounded-lg mx-4 mt-4 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Filter By</h3>
            
            <div className="space-y-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white pr-10"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Trades</option>
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="service">Service</option>
                    <option value="subcontractor">Subcontractor</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
                <div className="grid grid-cols-5 gap-2 items-center">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="col-span-2 w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <div className="text-center text-gray-500">to</div>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="col-span-2 w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Unit Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Unit</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white pr-10"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                  >
                    <option value="any">Any Unit</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="each">Each</option>
                    <option value="sq.ft">Sq.Ft</option>
                    <option value="sq.m">Sq.M</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between pt-2">
                <button 
                  className="px-6 py-2 bg-[#232635] text-gray-400 rounded-lg hover:bg-[#2A2F40]"
                  onClick={() => {
                    setSelectedType('all');
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedUnit('any');
                  }}
                >
                  Reset
                </button>
                <button 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setShowFilterMenu(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trade selector in main interface - styled to match screenshot */}
        <div className="px-8 pt-4 pb-2">
          <div className="flex items-center">
            <div className="mr-3">
              <span className="text-white font-medium">Trades:</span>
            </div>
            <div className="relative">
              <div className="inline-flex items-center">
                <button
                  className="bg-[#121824] border border-[#2A3A8F] text-white rounded-full py-1.5 pl-4 pr-10 text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] relative"
                  onClick={() => setWorkTypeDropdownOpen(!workTypeDropdownOpen)}
                >
                  {selectedTradeId === 'all'
                    ? 'All Trades'
                    : trades.find(t => t.id === selectedTradeId)?.name || 'Unknown'}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
                {workTypeDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-[#1A1E2E] rounded-lg shadow-lg z-50 border border-[#2A3A8F] py-1 max-h-[400px] overflow-y-auto">
                    <button
                      key="all"
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#232635] ${selectedTradeId === 'all' ? 'bg-[#2A3A8F] text-white font-medium' : 'text-white'}`}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedTradeId('all');
                        setWorkTypeDropdownOpen(false);
                      }}
                    >
                      All Trades
                    </button>
                    {trades.map(trade => (
                      <button
                        key={trade.id}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#232635] ${selectedTradeId === trade.id ? 'bg-[#2A3A8F] text-white font-medium' : 'text-white'}`}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTradeId(trade.id);
                          setWorkTypeDropdownOpen(false);
                        }}
                      >
                        {trade.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedTradeId !== 'all' && (
              <button
                onClick={() => setSelectedTradeId('all')}
                className="ml-4 text-sm text-blue-400 hover:text-blue-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="mt-6">
          <TabMenu
            items={[
              { id: 'all', label: 'All', count: filteredProducts.length },
              { id: 'material', label: 'Material', count: filteredProducts.filter(p => p.type === 'material').length },
              { id: 'labor', label: 'Labor', count: filteredProducts.filter(p => p.type === 'labor').length },
              { id: 'equipment', label: 'Equipment', count: filteredProducts.filter(p => p.type === 'equipment').length },
              { id: 'service', label: 'Service', count: filteredProducts.filter(p => p.type === 'service').length },
              { id: 'subcontractor', label: 'Subcontractor', count: filteredProducts.filter(p => p.type === 'subcontractor').length },
            ]}
            activeItemId={activeCategory}
            onItemClick={setActiveCategory}
          />
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
        <div className="pt-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pricing items found. Try adjusting your filters.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1E2130] text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                  <th className="py-3 px-4 w-[20%]">NAME</th>
                  <th className="py-3 px-4 w-[30%]">DESCRIPTION</th>
                  <th 
                    className="py-3 px-4 pr-0 text-right w-[15%] cursor-pointer"
                    onClick={togglePriceSort}
                  >
                    PRICE {priceSort === 'desc' ? '▼' : '▲'}
                  </th>
                  <th className="py-3 pl-0 pr-4 w-[10%] text-center">UNIT</th>
                  <th className="py-3 px-4 w-[10%] text-center">TYPE</th>
                  <th className="py-3 px-4 w-[15%] text-center">TRADE</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr 
                    key={product.id} 
                    className="border-b border-gray-800 bg-gray-900 hover:bg-[#1A1E2E] cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductMenu(true);
                    }}
                  >
                    <td className="py-4 px-4">{product.name}</td>
                    <td className="py-4 px-4">{product.description}</td>
                    <td className="py-4 px-4 pr-0 text-right font-medium">{formatCurrency(product.price)}</td>
                    <td className="py-4 pl-0 pr-4 text-center">
                      <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-full badge-unit">
                        {product.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-[#2A3A8F] text-xs text-blue-400 rounded-full badge-type">
                        {product.type === 'subcontractor' ? 'Sub' : product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-white text-xs">
                      {trades.find(t => t.id === product.trade_id)?.name || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        
        {/* New Line Item Modal - for adding new items */}
        {showNewLineItemModal && (
          <LineItemModal
            onClose={() => setShowNewLineItemModal(false)}
            onSave={async (newProduct) => {
              try {
                // Create new product
                const { error } = await supabase
                  .from('products')
                  .insert({
                    ...newProduct,
                    user_id: user?.id
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
    </DashboardLayout>
  );
};
