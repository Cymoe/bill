import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { advancedSearch, SearchableField } from '../../utils/searchUtils';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: string;
  trade_id?: string;
  trades?: {
    id: string;
    name: string;
  };
  trade?: {
    id: string;
    name: string;
  };
}

interface SelectedLineItem extends LineItem {
  quantity: number;
}

interface ProductBuilderProps {
  initialProduct?: {
    id?: string;
    name: string;
    description?: string;
    lineItems?: SelectedLineItem[];
    is_base_product?: boolean;
    parent_product_id?: string;
    variant_name?: string;
  };
  onSave: (product: any) => void;
  onCancel: () => void;
  baseProducts?: Array<{id: string, name: string}>;
}

const ProductBuilder: React.FC<ProductBuilderProps> = ({
  initialProduct,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedLineItems, setSelectedLineItems] = useState<SelectedLineItem[]>(
    initialProduct?.lineItems || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  
  // Product states - variant handling is now done through the product listing page
  const [trades, setTrades] = useState<{ id: string; name: string }[]>([]);
  const [showLineItemSelector, setShowLineItemSelector] = useState(false);

  const [loading, setLoading] = useState(true);

  // Fetch trades
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error('Error fetching trades:', error);
          return;
        }
        
        setTrades(data || []);
      } catch (error) {
        console.error('Error in fetchTrades:', error);
      }
    };
    
    fetchTrades();
  }, []);

  // Fetch line items
  useEffect(() => {
    const fetchLineItems = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, trades(id, name)')
          .order('name');
          
        if (error) {
          console.error('Error fetching line items:', error);
          return;
        }
        
        setLineItems(data || []);
      } catch (error) {
        console.error('Error in fetchLineItems:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLineItems();
  }, []);

  // Calculate total price when line items change
  useEffect(() => {
    // Price is now calculated directly when needed
  }, [selectedLineItems]);

  // Handle line item selection
  const addLineItem = (item: LineItem) => {
    // Check if item is already selected
    const existingItem = selectedLineItems.find(i => i.id === item.id);
    
    if (existingItem) {
      // Update quantity if already selected
      setSelectedLineItems(
        selectedLineItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      );
    } else {
      // Add new item with quantity 1
      setSelectedLineItems([
        ...selectedLineItems,
        { ...item, quantity: 1 }
      ]);
    }
    
    setShowLineItemSelector(false);
  };

  // Handle line item removal
  const removeLineItem = (itemId: string) => {
    setSelectedLineItems(selectedLineItems.filter(item => item.id !== itemId));
  };

  // Handle quantity change
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedLineItems(
      selectedLineItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Calculate total price based on line items
  const calculateTotalPrice = () => {
    return selectedLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  


  // Handle save
  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }
    
    // Variant validation has been removed as it's now handled through the product listing page
    
    if (selectedLineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }
    
    const productData = {
      id: initialProduct?.id,
      name,
      description,
      lineItems: selectedLineItems,
      is_base_product: initialProduct?.is_base_product || false,
      parent_product_id: initialProduct?.parent_product_id || null,
      variant_name: initialProduct?.variant_name || null
    };
    
    onSave(productData);
  };

  // Filter line items based on search and trade
  const filteredLineItems = lineItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTrade = !selectedTrade || 
      item.trade_id === selectedTrade || 
      (item.trades && item.trades.id === selectedTrade);
      
    return matchesSearch && matchesTrade;
  });

  const filteredItems = lineItems.filter(item => {
    // Advanced search filter
    if (searchTerm) {
      const searchableFields: SearchableField[] = [
        { 
          key: 'name', 
          weight: 2.0, // Higher weight for item names
          transform: (item) => item.name || ''
        },
        { 
          key: 'description', 
          weight: 1.5, // High weight for descriptions
          transform: (item) => item.description || ''
        },
        { 
          key: 'unit', 
          weight: 0.8,
          transform: (item) => item.unit || ''
        },
        { 
          key: 'price', 
          weight: 1.0,
          transform: (item) => formatCurrency(item.price || 0)
        }
      ];

      const searchResults = advancedSearch([item], searchTerm, searchableFields, {
        minScore: 0.2,
        requireAllTerms: false
      });

      return searchResults.length > 0;
    }
    return true;
  });

  return (
    <div className="product-builder bg-[#1E2130] rounded-lg p-4">
      <h2 className="text-xl font-medium text-white mb-4">
        {initialProduct?.id ? 'Edit Product' : 'New Product / Assembly'}
      </h2>
      
      {/* Product form */}
      <div className="product-form bg-[#1E2130] rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-white text-opacity-48 uppercase text-sm font-medium mb-2" htmlFor="name">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full bg-white bg-opacity-8 text-white border border-white border-opacity-8 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-opacity-48 uppercase text-sm font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="w-full bg-white bg-opacity-8 text-white border border-white border-opacity-8 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            rows={3}
          />
        </div>
        
        {/* Product Variant Options */}
        {/* Base product and variant selection UI has been removed as we now handle this through the product listing page */}
      </div>
      
      {/* Line Items */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Line Items</h3>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowLineItemSelector(!showLineItemSelector)}
          >
            Add Line Item
          </button>
        </div>
        
        {selectedLineItems.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No line items yet.</div>
        ) : (
          <div className="selected-line-items">
            {selectedLineItems.map(item => (
              <div 
                key={item.id} 
                className="selected-item flex justify-between items-center p-3 mb-2 bg-[#232635] rounded-lg"
              >
                <div className="item-info flex-grow">
                  <div className="item-name text-white font-medium">{item.name}</div>
                  <div className="item-price text-gray-400">
                    {formatCurrency(item.price)} / {item.unit}
                  </div>
                </div>
                
                <div className="item-quantity flex items-center">
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-[#1E2130] rounded-l-lg border border-gray-700"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-12 h-8 bg-[#232635] border-t border-b border-gray-700 text-center text-white"
                  />
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-[#1E2130] rounded-r-lg border border-gray-700"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total text-white mx-4">
                  {formatCurrency(item.price * item.quantity)}
                </div>
                
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => removeLineItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Line Item Selector */}
        {showLineItemSelector && (
          <div className="line-item-selector mt-4 p-4 bg-[#232635] rounded-lg">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1E2130] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  placeholder="Search line items..."
                />
              </div>
              
              <div>
                <select
                  value={selectedTrade || ''}
                  onChange={(e) => setSelectedTrade(e.target.value || null)}
                  className="w-full bg-[#1E2130] border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">All Trades</option>
                  {trades.map(trade => (
                    <option key={trade.id} value={trade.id}>{trade.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="line-items-list max-h-60 overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-400 py-4">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No items found.</div>
              ) : (
                filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="line-item p-3 mb-2 bg-[#1E2130] rounded-lg hover:bg-[#2A2F40] cursor-pointer transition-colors"
                    onClick={() => addLineItem(item)}
                  >
                    <div className="flex justify-between">
                      <div className="item-name text-white font-medium">{item.name}</div>
                      <div className="item-price text-white">
                        {formatCurrency(item.price)} / {item.unit}
                      </div>
                    </div>
                    {item.description && (
                      <div className="item-description text-gray-400 text-sm mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Product variant info will be displayed here in the future */}
      
      {/* Total */}
      <div className="total-price flex justify-between items-center p-4 bg-[#232635] rounded-lg mt-6">
        <div className="text-lg font-medium text-white">Total</div>
        <div className="text-xl font-medium text-white">{formatCurrency(calculateTotalPrice())}</div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          className="px-6 py-3 bg-[#232635] text-white rounded-lg hover:bg-[#2A2F40] transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ProductBuilder;
