import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Minus, X, Save, Trash2 } from 'lucide-react';
import { PRODUCT_COLLECTIONS } from '../../constants/collections';

interface LineItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  type: string;
  trade_id?: string;
}

interface SelectedLineItem extends LineItem {
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: string;
  category?: string;
  status: string;
  is_base_product: boolean;
  created_at: string;
  updated_at: string;
  trade_id?: string;
  user_id?: string;
  parent_product_id?: string;
  parent_name?: string;
  variant?: boolean;
  trade?: {
    id: string;
    name: string;
  };
  variants: any[];
  items?: any[];
}

interface EditProductDrawerProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (productId: string) => void;
}

export const EditProductDrawer: React.FC<EditProductDrawerProps> = ({
  product,
  onClose,
  onSuccess,
  onDelete
}) => {
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [category, setCategory] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedLineItems, setSelectedLineItems] = useState<SelectedLineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = !!product;

  useEffect(() => {
    if (product) {
      setProductName(product.name || '');
      setProductDescription(product.description || '');
      setCategory(product.category || '');
      
      // Calculate markup percentage from existing price
      if (product.items && product.items.length > 0) {
        const subtotal = product.items.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0);
        if (subtotal > 0) {
          const markup = ((product.price - subtotal) / subtotal) * 100;
          setMarkupPercentage(Math.round(markup));
        }
      }
      
      fetchLineItems();
      fetchExistingLineItems();
    }
  }, [product]);

  const fetchLineItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .or('is_base_product.is.null,is_base_product.eq.false')
        .order('name');

      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingLineItems = async () => {
    if (!product?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('product_line_items')
        .select(`
          *,
          line_item:products!product_line_items_line_item_id_fkey(*)
        `)
        .eq('product_id', product.id);

      if (error) throw error;

      const existingItems = data?.map(item => ({
        ...item.line_item,
        quantity: item.quantity
      })) || [];

      setSelectedLineItems(existingItems);
    } catch (error) {
      console.error('Error fetching existing line items:', error);
    }
  };

  const filteredLineItems = lineItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || item.type === activeType;
    const notAlreadySelected = !selectedLineItems.find(s => s.id === item.id);
    
    return matchesSearch && matchesType && notAlreadySelected;
  });

  const addLineItem = (item: LineItem) => {
    setSelectedLineItems([...selectedLineItems, { ...item, quantity: 1 }]);
  };

  const removeLineItem = (itemId: string) => {
    setSelectedLineItems(selectedLineItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    setSelectedLineItems(selectedLineItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const calculateSubtotal = () => {
    return selectedLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const markup = subtotal * (markupPercentage / 100);
    return subtotal + markup;
  };

  const handleSave = async () => {
    if (!productName.trim() || selectedLineItems.length === 0 || !product) return;

    try {
      setIsSaving(true);

      // Update the product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: productName,
          description: productDescription,
          price: calculateTotal(),
          category: category || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      // Delete existing product_line_items
      const { error: deleteError } = await supabase
        .from('product_line_items')
        .delete()
        .eq('product_id', product.id);

      if (deleteError) throw deleteError;

      // Create new product_line_items entries
      const lineItemEntries = selectedLineItems.map(item => ({
        product_id: product.id,
        line_item_id: item.id,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price
      }));

      const { error: lineItemsError } = await supabase
        .from('product_line_items')
        .insert(lineItemEntries);

      if (lineItemsError) throw lineItemsError;

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    try {
      // Delete product_line_items first
      await supabase
        .from('product_line_items')
        .delete()
        .eq('product_id', product.id);

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      if (onDelete) {
        onDelete(product.id);
      }
      handleClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleClose = () => {
    // Reset form
    setProductName('');
    setProductDescription('');
    setCategory('');
    setMarkupPercentage(0);
    setSelectedLineItems([]);
    setSearchTerm('');
    setActiveType('all');
    setShowDeleteConfirm(false);
    onClose();
  };

  const types = ['all', 'material', 'labor', 'equipment', 'service', 'subcontractor'];

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9998] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[80%] max-w-[1200px] bg-[#121212] shadow-xl transform transition-transform z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Compact Header */}
        <div className="bg-[#1E1E1E] border-b border-[#333333] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h1 className="text-lg font-semibold">Edit Product Bundle</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-1.5 bg-transparent border border-red-500/50 text-red-400 rounded-[4px] hover:bg-red-500/10 transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
              <button
                onClick={handleSave}
                disabled={!productName.trim() || selectedLineItems.length === 0 || isSaving}
                className="px-4 py-1.5 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                <Save className="w-3 h-3" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Same compact layout as CreateProductDrawer */}
        <div className="flex h-[calc(100%-60px)]">
          {/* Left Column - Line Items (40% width) */}
          <div className="w-[40%] border-r border-[#333333] flex flex-col">
            {/* Search and Filters */}
            <div className="p-3 border-b border-[#333333] space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search line items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                />
              </div>
              
              {/* Type Filter Pills */}
              <div className="flex gap-1 overflow-x-auto">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors whitespace-nowrap ${
                      activeType === type
                        ? 'bg-[#336699] text-white'
                        : 'bg-[#333333] text-gray-300 hover:bg-[#404040]'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Items List - Compact */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
              ) : filteredLineItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {searchTerm ? 'No items found' : 'No items available'}
                </div>
              ) : (
                <div className="divide-y divide-[#333333]">
                  {filteredLineItems.map(item => (
                    <div
                      key={item.id}
                      className="px-3 py-2 hover:bg-[#1E1E1E] cursor-pointer transition-colors"
                      onClick={() => addLineItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-[2px] font-medium ${
                              item.type === 'material' ? 'bg-blue-500/20 text-blue-300' :
                              item.type === 'labor' ? 'bg-green-500/20 text-green-300' :
                              item.type === 'equipment' ? 'bg-orange-500/20 text-orange-300' :
                              item.type === 'service' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-sm text-white truncate">{item.name}</span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <div className="font-mono text-sm text-white">
                            {formatCurrency(item.price)}
                          </div>
                          <div className="text-xs text-gray-400">/{item.unit}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Details (60% width) */}
          <div className="flex-1 flex flex-col">
            {/* Product Info Section */}
            <div className="p-4 border-b border-[#333333]">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Product Name *"
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  />
                </div>
                <div className="col-span-2">
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Collection
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                  >
                    {PRODUCT_COLLECTIONS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Markup %
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                      min="0"
                      max="100"
                      placeholder="Markup %"
                      className="flex-1 px-3 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#336699]"
                    />
                    <span className="text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Items Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">
                  Selected Items ({selectedLineItems.length})
                </h3>
                {selectedLineItems.length > 0 && (
                  <button
                    onClick={() => setSelectedLineItems([])}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {selectedLineItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Click items on the left to add them
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedLineItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-[#1E1E1E] rounded-[4px]">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                          className="w-12 text-center px-1 py-1 bg-[#333333] border border-[#555555] rounded-[2px] text-white text-sm"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-[#333333] hover:bg-[#404040] rounded-[2px] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-red-400 hover:bg-red-400/20 rounded-[2px] transition-colors ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Summary - Fixed at bottom */}
            <div className="border-t border-[#333333] p-4 bg-[#1E1E1E]">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {markupPercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Markup ({markupPercentage}%)</span>
                    <span className="font-mono text-white">
                      {formatCurrency(calculateSubtotal() * (markupPercentage / 100))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#333333]">
                  <span className="text-white">Total</span>
                  <span className="font-mono text-white">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
            <div className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] p-6 max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Product?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{productName}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-transparent border border-[#555555] text-white rounded-[4px] hover:bg-[#333333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-[4px] hover:bg-red-600 transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}; 