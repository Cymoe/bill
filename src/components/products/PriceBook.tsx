import React, { useState, useEffect, useMemo } from 'react';
import { Upload, Download } from 'lucide-react';
import ProductComparisonModal from './ProductComparisonModal';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { PageHeader } from '../common/PageHeader';
import TableHeader from './TableHeader';
import TabMenu from '../common/TabMenu';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  user_id: string;
  created_at: string;
  type: string;
  trade_id: string;
  trade?: string | { id: string; name: string };
  trades?: { id: string; name: string };
}

export const PriceBook = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [comparingProduct, setComparingProduct] = useState<Product | null>(null);

  useEffect(() => {
    console.log('PriceBook component mounted');
    fetchProducts();
  }, []);
  
  // Debug function to inspect all products
  useEffect(() => {
    if (products.length > 0) {
      console.log('=== DETAILED PRODUCT INSPECTION ===');
      console.log('Total products:', products.length);
      
      // Count products by trade
      const tradeCount: Record<string, number> = {};
      products.forEach(product => {
        const tradeName = product.trades?.name || 'unknown';
        tradeCount[tradeName] = (tradeCount[tradeName] || 0) + 1;
      });
      console.log('Products by trade:', tradeCount);
      
      // Inspect Carpentry products specifically
      const carpentryProducts = products.filter(p => 
        (p.trades && p.trades.name === 'Carpentry') || 
        (p.trade_id && p.trade_id === trades.find(t => t.name === 'Carpentry')?.id)
      );
      console.log('Carpentry products found:', carpentryProducts.length);
      console.log('Carpentry products:', carpentryProducts.map(p => ({ 
        id: p.id, 
        name: p.name, 
        trade_id: p.trade_id,
        trade_obj: p.trades ? { id: p.trades.id, name: p.trades.name } : null
      })));
      
      // Find the Carpentry trade ID
      const carpentryTrade = trades.find(t => t.name === 'Carpentry');
      console.log('Carpentry trade object:', carpentryTrade);
    }
  }, [products, trades]);

  useEffect(() => {
    const fetchTrades = async () => {
      const { data, error } = await supabase.from('trades').select('id, name').order('name');
      if (!error) {
        console.log('Fetched trades:', data?.length);
        console.log('Trades:', data);
        setTrades(data || []);
        
        // Store the Carpentry trade ID for special handling
        const carpentryTrade = data?.find(t => t.name === 'Carpentry');
        if (carpentryTrade) {
          console.log('Found Carpentry trade ID:', carpentryTrade.id);
          window.localStorage.setItem('carpentryTradeId', carpentryTrade.id);
        }
      }
    };
    fetchTrades();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Starting products fetch...');
      
      // Get ALL products globally from the view
      const { data: globalProducts, error: globalError } = await supabase
        .from('global_products')
        .select('*, trades(id, name)')
        .order('name');
        
      if (globalError) {
        console.error('Global products query error:', globalError);
        setProducts([]);
        return;
      }
      
      console.log('Global products fetched:', globalProducts?.length);
      
      // Count carpentry items for debugging
      const { data: tradesData } = await supabase
        .from('trades')
        .select('id, name')
        .eq('name', 'Carpentry');
      
      const carpentryTradeId = tradesData?.[0]?.id;
      if (carpentryTradeId) {
        const carpentryCount = globalProducts?.filter(p => p.trade_id === carpentryTradeId).length || 0;
        console.log('Carpentry products in set:', carpentryCount);
      }
      
      // Use all global products
      setProducts(globalProducts || []);
    } catch (error) {
      console.error('Error in fetchProducts:', error);
    }
  };

  // Function to filter products by trade
  const filterByTrade = (products: Product[], tradeId: string) => {
    if (tradeId === 'all') return products;
    
    return products.filter(product => {
      // Check direct trade_id
      if (product.trade_id === tradeId) {
        return true;
      }
      
      // Check nested trades object
      if (product.trades && product.trades.id === tradeId) {
        return true;
      }
      
      // Check nested trade object
      if (product.trade && typeof product.trade === 'object' && product.trade.id === tradeId) {
        return true;
      }
      
      return false;
    });
  };
  
  // Calculate counts for each category based on the selected trade only
  // This is a separate calculation from the filtered products display
  const getCategoryCounts = useMemo(() => {
    // First filter by trade only (if a trade is selected)
    const tradeFilteredProducts = filterByTrade(products, selectedTrade);
    
    // Calculate the counts for each category regardless of which tab is active
    return {
      all: tradeFilteredProducts.length,
      material: tradeFilteredProducts.filter(p => p.type === 'material').length,
      labor: tradeFilteredProducts.filter(p => p.type === 'labor').length,
      equipment: tradeFilteredProducts.filter(p => p.type === 'equipment').length,
      service: tradeFilteredProducts.filter(p => p.type === 'service').length,
      subcontractor: tradeFilteredProducts.filter(p => p.type === 'subcontractor').length
    };
  }, [products, selectedTrade]);

  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    console.log('Current state:', {
      totalProducts: products.length,
      selectedTrade,
      activeCategory,
      searchTerm,
      minPrice,
      maxPrice,
      selectedType,
      selectedUnit
    });
    
    let filtered = [...products];

    // Filter by trade
    if (selectedTrade !== 'all') {
      filtered = filterByTrade(filtered, selectedTrade);
      console.log('Products after trade filter:', filtered.length);
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.type === activeCategory);
    }
    console.log('Products after category filter:', filtered.length);

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.description || '').toLowerCase().includes(searchLower)
        );
      });
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
      filtered = filtered.filter(product => product.type === selectedType);
    }

    // Apply unit filter
    if (selectedUnit !== 'any') {
      filtered = filtered.filter(product => product.unit === selectedUnit);
    }

    // Sort by price
    return filtered.sort((a, b) => {
      if (priceSort === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }, [products, selectedTrade, searchTerm, activeCategory, minPrice, maxPrice, selectedType, selectedUnit, priceSort]);

  return (
    <div className="space-y-0">
      <PageHeader
        title="Price Book"
        hideTitle={true}
      />
      
      {/* Trade Dropdown */}
      <div className="mb-4 flex items-center gap-2">
        <label className="text-gray-400">Trades:</label>
        <select
          className="bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
          value={selectedTrade}
          onChange={e => {
            const newTradeId = e.target.value;
            setSelectedTrade(newTradeId);
            // Close any open filter menu to keep the interface clean
            setShowFilterMenu(false);
          }}
        >
          <option value="all">All Trades</option>
          {trades.map(trade => (
            <option key={trade.id} value={trade.id}>{trade.name}</option>
          ))}
        </select>
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
                  <option value="all">All Types</option>
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
      
      <TabMenu
        items={[
          { 
            id: 'all', 
            label: 'All', 
            count: getCategoryCounts.all
          },
          { 
            id: 'material', 
            label: 'Material', 
            count: getCategoryCounts.material
          },
          { 
            id: 'labor', 
            label: 'Labor', 
            count: getCategoryCounts.labor
          },
          { 
            id: 'equipment', 
            label: 'Equipment', 
            count: getCategoryCounts.equipment
          },
          { 
            id: 'service', 
            label: 'Service', 
            count: getCategoryCounts.service
          },
          { 
            id: 'subcontractor', 
            label: 'Subcontractor', 
            count: getCategoryCounts.subcontractor
          },
        ]}
        activeItemId={activeCategory}
        onItemClick={category => {
          console.log('Selected category:', category);
          setActiveCategory(category);
        }}
      />
      
      {menuOpen && (
        <div className="absolute right-4 top-24 w-[220px] bg-[#232632] rounded-lg z-50 p-2.5 flex flex-col min-w-[180px] shadow-lg">
          <button
            className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <Upload className="w-5 h-5 text-[#A3A6AE]" />
            Import items
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-[#A3A6AE] text-sm font-normal text-left hover:bg-[#282B34] rounded-lg transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <Download className="w-5 h-5 text-[#A3A6AE]" />
            Export to CSV
          </button>
        </div>
      )}
      
      {filteredProducts && filteredProducts.length > 0 ? (
        <div>
          <table className="w-full table-fixed">
            <TableHeader 
              priceSort={priceSort}
              onPriceSort={() => setPriceSort(priceSort === 'asc' ? 'desc' : 'asc')}
            />
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.map((product: Product) => (
                <tr key={product.id} className="hover:bg-[#232632] cursor-pointer transition-colors">
                  <td className="pl-4 pr-4 py-4 w-[20%] whitespace-nowrap text-sm font-semibold text-white/80" data-testid="product-name">{product.name}</td>
                  <td className="pl-4 pr-4 py-4 w-[40%] whitespace-nowrap text-sm text-gray-300">{product.description}</td>
                  <td className="py-4 pr-3 whitespace-nowrap text-sm text-white/80 text-right">{formatCurrency(product.price)}</td>
                  <td className="py-4 pl-2 w-[120px] whitespace-nowrap text-sm text-gray-300 text-left">
                    <span className="inline-block bg-[#232632] text-[#A3A6AE] rounded-lg px-2 py-0.5 text-xs font-normal">
                      {product.unit}
                    </span>
                  </td>
                  <td className="py-4 pr-3 w-[120px] whitespace-nowrap text-sm text-center">
                    <span className="inline-block bg-[#232F5B] text-[#3B82F6] rounded-lg px-3 py-0.5 text-xs font-medium">
                      {product.type === 'subcontractor' ? 'Sub' : product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 pr-3 w-[120px] whitespace-nowrap text-sm text-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                      onClick={() => setComparingProduct(product)}
                    >
                      Compare
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 bg-gray-900 rounded-lg">
          {searchTerm ? 'No products match your search.' : 'No products found. Add some products to get started.'}
        </div>
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
