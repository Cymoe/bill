import { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { formatCurrency } from '../../utils/format';
import { DashboardLayout, IndustryContext } from '../layouts/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../common/PageHeader';
import TabMenu from '../common/TabMenu';
import { EditLineItemModal } from '../modals/EditLineItemModal';
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
}

export const PriceBook = () => {
  const { user } = useAuth();
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
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  
  const togglePriceSort = () => {
    setPriceSort(priceSort === 'asc' ? 'desc' : 'asc');
  };
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

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
  }, [products, searchTerm, activeCategory, minPrice, maxPrice, selectedType, selectedUnit, priceSort]);

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

        {/* Category Tabs */}
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

        {/* Products Table */}
        <div className="px-8 pt-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pricing items found. Try adjusting your filters.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1E2130] text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                  <th className="py-3 px-4 w-[20%]">NAME</th>
                  <th className="py-3 px-4 w-[40%]">DESCRIPTION</th>
                  <th 
                    className="py-3 px-4 text-right w-[20%] cursor-pointer"
                    onClick={togglePriceSort}
                  >
                    PRICE {priceSort === 'desc' ? '▼' : '▲'}
                  </th>
                  <th className="py-3 px-4 w-[10%] text-center">UNIT</th>
                  <th className="py-3 px-4 w-[10%] text-center">TYPE</th>
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
                    <td className="py-4 px-4 text-right font-medium">{formatCurrency(product.price)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-full badge-unit">
                        {product.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 bg-[#2A3A8F] text-xs text-blue-400 rounded-full badge-type">
                        {product.type === 'subcontractor' ? 'Sub' : product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Product Modal */}
        {showProductMenu && selectedProduct && (
          <EditLineItemModal
            product={selectedProduct}
            onClose={() => setShowProductMenu(false)}
            onSave={async (updatedProduct) => {
              try {
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
      </div>
    </DashboardLayout>
  );
};
