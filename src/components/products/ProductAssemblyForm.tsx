import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export interface LineItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  trade?: string;
  type?: string;
}

interface LineItemWithQuantity {
  lineItemId: string;
  quantity: number;
  unit: string;
  price: number;
  type?: string;
}

export interface ProductAssemblyFormProps {
  lineItems: LineItem[];
  onClose: () => void;
  onSave: (data: any) => void;
  editingProduct?: any; // Product | null
}

export const ProductAssemblyForm: React.FC<ProductAssemblyFormProps> = ({ lineItems, onClose, onSave, editingProduct }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // All products can have variants in our simplified model
  const [isBaseProduct] = useState(true);
  const [items, setItems] = useState<{ lineItemId: string; quantity: number; unit: string; price: number; type?: string }[]>([
    { lineItemId: '', quantity: 1, unit: '', price: 0, type: '' }
  ]);
  const [itemFilters, setItemFilters] = useState<{ trade: string; type: string; unit: string }[]>([
    { trade: 'all', type: 'all', unit: 'all' }
  ]);
  const [comboBoxInputs, setComboBoxInputs] = useState<string[]>(['']);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [activeOption, setActiveOption] = useState<number>(-1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState({ option_name: '', option_value: '', price_delta: '', unit: '' });
  const [addingOption, setAddingOption] = useState(false);

  // Debounce timer ref
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Unique localStorage key per user
  const draftKey = user ? `productAssemblyDraft_${user.id}` : 'productAssemblyDraft_anon';

  // Save draft to localStorage and backend (debounced)
  useEffect(() => {
    if (!user) return;
    const draft = { name, description, items, itemFilters, comboBoxInputs };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    // Debounce backend save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // First check if a draft already exists for this user
      const { data: existingDraft } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();
      
      if (existingDraft) {
        // Update existing draft
        await supabase.from('products').update({
          name: name || 'Draft Product',
          description,
          items,
          status: 'draft',
        }).eq('id', existingDraft.id);
      } else {
        // Insert new draft
        await supabase.from('products').insert({
          user_id: user.id,
          name: name || 'Draft Product',
          description,
          items,
          status: 'draft',
        });
      }
    }, 1000);
  }, [name, description, items, itemFilters, comboBoxInputs, user]);

  // Load draft on mount
  useEffect(() => {
    if (!user) return;
    const localDraft = localStorage.getItem(draftKey);
    if (localDraft) {
      try {
        const { name, description, items, itemFilters, comboBoxInputs } = JSON.parse(localDraft);
        setName(name);
        setDescription(description);
        setItems(items);
        setItemFilters(itemFilters);
        setComboBoxInputs(comboBoxInputs);
        setDraftId(null);
        return;
      } catch {}
    }
    // If no local draft, fetch from backend
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();
      if (data) {
        setDraftId(data.id);
        setName(data.name || '');
        setDescription(data.description || '');
        setItems(data.items || []);
        setItemFilters((data.items || []).map(() => ({ trade: 'all', type: 'all', unit: 'all' })));
        setComboBoxInputs((data.items || []).map((item: any) => {
          const li = lineItems.find((li) => li.id === item.lineItemId);
          return li ? `${li.name} (${formatCurrency(li.price)}/${li.unit})` : '';
        }));
      }
    })();
  }, [user]);

  // Clear draft from both localStorage and backend
  const clearDraft = async () => {
    if (user) {
      await supabase.from('products').delete().eq('user_id', user.id).eq('status', 'draft');
    }
    localStorage.removeItem(draftKey);
  };

  // Determine the trade of a product based on its components
  const determineProductTrade = () => {
    // If no items, return null
    if (items.length === 0) return null;
    
    // Count occurrences of each trade
    const tradeCounts: Record<string, number> = {};
    
    // Track the most expensive item and its trade
    let mostExpensiveItem = { price: 0, tradeId: null as string | null };
    
    // Process each item
    items.forEach(item => {
      // Find the line item to get its trade
      const lineItem = lineItems.find(li => li.id === item.lineItemId);
      if (!lineItem) return;
      
      // Get the trade ID (or a placeholder if not available)
      const tradeId = lineItem.trade || 'unknown';
      
      // Count this trade
      tradeCounts[tradeId] = (tradeCounts[tradeId] || 0) + 1;
      
      // Check if this is the most expensive item (price * quantity)
      const totalPrice = item.price * item.quantity;
      if (totalPrice > mostExpensiveItem.price) {
        mostExpensiveItem = { price: totalPrice, tradeId };
      }
    });
    
    // Find the trade with the highest count
    let maxCount = 0;
    let majorityTrade = null;
    let tieDetected = false;
    
    Object.entries(tradeCounts).forEach(([tradeId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        majorityTrade = tradeId;
        tieDetected = false;
      } else if (count === maxCount) {
        tieDetected = true;
      }
    });
    
    // If there's a tie, use the most expensive component's trade
    if (tieDetected) {
      return mostExpensiveItem.tradeId;
    }
    
    return majorityTrade;
  };

  const addItem = () => {
    // Always add a new empty line item when the button is clicked
    setItems([...items, { lineItemId: '', quantity: 1, unit: '', price: 0, type: '' }]);
    setItemFilters([...itemFilters, { trade: 'all', type: 'all', unit: 'all' }]);
    setComboBoxInputs([...comboBoxInputs, '']);
  };
  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
    setItemFilters(itemFilters.filter((_, i) => i !== idx));
    setComboBoxInputs(comboBoxInputs.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, key: 'lineItemId' | 'quantity', value: any) => {
    if (key === 'lineItemId') {
      const li = getLineItem(value);
      
      // Update the current item
      setItems(items.map((item, i) =>
        i === idx
          ? {
              ...item,
              lineItemId: value,
              unit: li?.unit || '',
              price: li?.price || 0,
              type: li?.type || ''
            }
          : item
      ));
      
      setItemFilters(itemFilters.map((f, i) =>
        i === idx && li
          ? {
              ...f,
              trade: li.trade || 'all',
              type: li.type || 'all',
              unit: li.unit || 'all'
            }
          : f
      ));
      
      setComboBoxInputs(comboBoxInputs.map((v, i) =>
        i === idx && li
          ? `${li.name} (${formatCurrency(li.price)}/${li.unit})`
          : v
      ));
    } else {
    setItems(items.map((item, i) => i === idx ? { ...item, [key]: value } : item));
    }
  };
  const updateFilter = (idx: number, key: 'trade' | 'type' | 'unit', value: string) => {
    setItemFilters(itemFilters.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };

  const getLineItem = (id: string) => lineItems.find(li => li.id === id);
  const total = items.reduce((sum, item) => {
    const li = getLineItem(item.lineItemId);
    return sum + (li ? li.price * item.quantity : 0);
  }, 0);

  // Helper to get the display label for a line item
  const getLineItemLabel = (li: LineItem) => `${li.name} (${formatCurrency(li.price)}/${li.unit})`;

  // On save, clear draft and save as published
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await clearDraft();
    // Determine the trade based on components
    const tradeDetermination = determineProductTrade();
    
    // For variants, we should inherit the parent's trade if specified
    const trade_id = editingProduct?.variant ? editingProduct.trade_id : tradeDetermination;
    
    // Determine if this is a base product (package) or individual product
    // For variants, always false. Otherwise use the selected option from the form
    const is_base_product = editingProduct?.variant ? false : isBaseProduct;
    
    if (draftId) {
      // Update draft row to published
      await supabase.from('products').update({
        name, 
        description, 
        items, 
        status: 'published',
        trade_id,
        is_base_product
      }).eq('id', draftId);
      onSave({ 
        name, 
        description, 
        items, 
        id: draftId, 
        status: 'published',
        trade_id,
        is_base_product
      });
    } else {
      // Insert new product
      const { data, error } = await supabase.from('products').insert({
        user_id: user.id,
        name,
        description,
        items,
        status: 'published',
        trade_id,
        is_base_product
      }).select().single();
      
      onSave({ 
        name, 
        description, 
        items, 
        id: data?.id, 
        status: 'published',
        trade_id,
        is_base_product
      });
    }
  };

  // On cancel/discard, clear draft
  const handleCancel = async () => {
    await clearDraft();
    onClose();
  };

  // Group by trade name (alphabetically), fallback to 'Unassigned' for null/undefined
  const groupedByTrade: Record<string, LineItem[]> = {};
  lineItems.forEach(li => {
    const tradeName = li.trade || 'Unassigned';
    if (!groupedByTrade[tradeName]) groupedByTrade[tradeName] = [];
    groupedByTrade[tradeName].push(li);
  });
  const sortedTradeNames = Object.keys(groupedByTrade).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (editingProduct && editingProduct.id) {
      // Fetch line items for this product from product_line_items
      (async () => {
        const { data: pliData, error: pliError } = await supabase
          .from('product_line_items')
          .select('*')
          .eq('product_id', editingProduct.id);
        if (pliError) {
          setItems([]);
        } else {
          setItems((pliData || []).map((pli: any) => ({
            lineItemId: pli.line_item_id,
            quantity: pli.quantity,
            unit: pli.unit,
            price: pli.price,
            type: '' // type can be filled in if needed from lineItems
          })));
        }
        setName(editingProduct.name || '');
        setDescription(editingProduct.description || '');
        setItemFilters((pliData || []).map(() => ({ trade: 'all', type: 'all', unit: 'all' })));
        setComboBoxInputs((pliData || []).map((pli: any) => {
          const li = lineItems.find((li) => li.id === pli.line_item_id);
          return li ? `${li.name} (${formatCurrency(li.price)}/${li.unit})` : '';
        }));
        setDraftId(editingProduct.id || null);
        console.log('Setting up form with items:', pliData);
      })();
    } else if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setItems([]);
      setItemFilters([]);
      setComboBoxInputs([]);
      setDraftId(null);
    }
  }, [editingProduct, lineItems]);

  // Fetch product attributes when editingProduct changes
  useEffect(() => {
    if (editingProduct && editingProduct.id) {
      (async () => {
        const { data: attrData } = await supabase
          .from('product_attributes')
          .select('*')
          .eq('product_id', editingProduct.id);
        setAttributes(attrData || []);
        // Set default selected options
        if (attrData && attrData.length > 0) {
          const initial: Record<string, string> = {};
          Array.from(new Set(attrData.map(a => a.option_name))).forEach(name => {
            const first = attrData.find(a => a.option_name === name);
            if (first) initial[name] = first.option_value;
          });
          setSelectedOptions(initial);
        }
      })();
    } else {
      setAttributes([]);
      setSelectedOptions({});
    }
  }, [editingProduct]);

  // Calculate price delta for selected options
  const optionNames = Array.from(new Set(attributes.map(a => a.option_name)));
  const priceDelta = optionNames.reduce((sum, name) => {
    const attr = attributes.find(a => a.option_name === name && a.option_value === selectedOptions[name]);
    return sum + (attr ? Number(attr.price_delta) : 0);
  }, 0);

  // Add new attribute handler
  const handleAddOption = async () => {
    if (!newOption.option_name || !newOption.option_value) return;
    setAddingOption(true);
    if (editingProduct && editingProduct.id) {
      // Save to DB
      const { data, error } = await supabase.from('product_attributes').insert({
        product_id: editingProduct.id,
        option_name: newOption.option_name,
        option_value: newOption.option_value,
        price_delta: newOption.price_delta ? Number(newOption.price_delta) : 0,
        unit: newOption.unit || null,
      }).select();
      if (!error && data) {
        setAttributes(prev => [...prev, ...data]);
        setSelectedOptions(s => ({ ...s, [newOption.option_name]: newOption.option_value }));
      }
    } else {
      // Not saved yet, just add to local state
      setAttributes(prev => [
        ...prev,
        { ...newOption, price_delta: newOption.price_delta ? Number(newOption.price_delta) : 0, id: Math.random().toString(36) }
      ]);
      setSelectedOptions(s => ({ ...s, [newOption.option_name]: newOption.option_value }));
    }
    setNewOption({ option_name: '', option_value: '', price_delta: '', unit: '' });
    setShowAddOption(false);
    setAddingOption(false);
  };

  // Remove attribute handler
  const handleRemoveOption = async (attr: any) => {
    if (attr.id && editingProduct && editingProduct.id && !attr.id.toString().startsWith('0.')) {
      // Remove from DB
      await supabase.from('product_attributes').delete().eq('id', attr.id);
    }
    setAttributes(prev => prev.filter(a => a !== attr));
    setSelectedOptions(s => {
      const copy = { ...s };
      if (copy[attr.option_name] === attr.option_value) delete copy[attr.option_name];
      return copy;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#121212] text-white">
      <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        <form onSubmit={handleSubmit} className="p-6 pb-24">{/* Added extra padding at bottom to prevent content from being hidden behind fixed footer */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold uppercase font-['Roboto_Condensed']">
            {editingProduct?.variant 
              ? 'Edit Variant' 
              : editingProduct 
                ? 'Edit Product' 
                : 'New Product'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-300 transition-opacity">
            <X className="h-6 w-6" />
          </button>
        </div>
      
      {editingProduct?.variant && (
        <div className="mb-6 p-4 bg-[#333333] rounded border-l-4 border-[#336699]">
          <div className="flex items-center gap-2">
            <span className="text-[#336699] font-medium font-['Roboto_Condensed']">Base Product:</span>
            <span className="text-white font-['Roboto']">{editingProduct.parent_name}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2 font-['Roboto']">
            This variant will inherit the category and trade from the base product.
          </p>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm uppercase font-medium text-white font-['Roboto_Condensed'] mb-2">Product Name</label>
        <input
          type="text"
          placeholder="Enter product name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="block w-full h-10 px-3 py-2 bg-[#333333] border border-gray-700 rounded text-white focus:border-[#336699] focus:ring-[#336699] focus:outline-none font-['Roboto']"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm uppercase font-medium text-white font-['Roboto_Condensed'] mb-2">Description</label>
        <textarea
          placeholder="Enter product description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="block w-full px-3 py-2 bg-[#333333] border border-gray-700 rounded text-white focus:border-[#336699] focus:ring-[#336699] focus:outline-none font-['Roboto']"
          rows={2}
        />
        <p className="text-xs text-gray-400 mt-2 font-['Roboto']">Provide a brief description of the product</p>
      </div>
      
      {/* All products can have variants in the simplified model */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm uppercase font-medium text-white font-['Roboto_Condensed']">Line Items</label>
          <button 
            type="button" 
            onClick={addItem} 
            className="flex items-center gap-1 px-4 py-2 text-sm bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors font-['Roboto'] font-medium"
          >
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        </div>
        {items.length === 0 && <div className="text-gray-400 text-sm bg-[#333333] rounded p-4 font-['Roboto'] border-l-4 border-[#336699]">No line items yet. Add some line items to your product.</div>}
        {items.map((item, idx) => {
          const filter = itemFilters[idx] || { trade: 'all', type: 'all', unit: 'all' };
          const comboBoxValue = comboBoxInputs[idx] || '';
          const trades = Array.from(new Set(lineItems.map(li => li.trade).filter((x): x is string => Boolean(x))));

          // Show all items if we're clicking a selected item, otherwise filter by search
          let filtered = lineItems;
          if (comboBoxValue && !item.lineItemId) {
            filtered = filtered.filter(li => li.name.toLowerCase().includes(comboBoxValue.toLowerCase()));
          }

          // Group by trade
          const grouped = trades.reduce((acc, trade) => {
            acc[trade] = filtered.filter((li: LineItem) => li.trade === trade);
            return acc;
          }, {} as Record<string, LineItem[]>);

          // Flatten filtered options for keyboard nav
          const filteredOptions: { li: LineItem; trade: string }[] = [];
          const filteredGrouped: Record<string, LineItem[]> = {};
          filtered.forEach(li => {
            const tradeName = li.trade || 'Unassigned';
            if (!filteredGrouped[tradeName]) filteredGrouped[tradeName] = [];
            filteredGrouped[tradeName].push(li);
            filteredOptions.push({ li, trade: tradeName });
          });
          const filteredTradeNames = Object.keys(filteredGrouped).sort((a, b) => a.localeCompare(b));

          return (
            <div key={idx} className="flex flex-col gap-1 mb-2 p-2 bg-[#333333] rounded border-l-4 border-[#336699]">
              <div className="flex gap-2 mb-1">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Select or search line item..."
                    value={comboBoxValue}
                    onChange={(e) => {
                      setComboBoxInputs(comboBoxInputs.map((v, i) => i === idx ? e.target.value : v));
                      setDropdownOpen(idx);
                      setActiveOption(-1);
                    }}
                    onFocus={() => {
                      setDropdownOpen(idx);
                      setActiveOption(-1);
                    }}
                    onClick={() => {
                      // Always show dropdown on click, even for selected items
                      setDropdownOpen(idx);
                      setActiveOption(-1);
                      // Clear the search if we have a selected item
                      if (item.lineItemId) {
                        setComboBoxInputs(comboBoxInputs.map((v, i) => i === idx ? '' : v));
                      }
                    }}
                    onBlur={e => { 
                      // If no item is selected, reset the input
                      setTimeout(() => {
                        if (!items[idx].lineItemId) {
                          setComboBoxInputs(comboBoxInputs.map((v, i) => i === idx ? '' : v));
                        }
                        setDropdownOpen(null);
                      }, 150);
                    }}
                    onKeyDown={e => {
                      if (dropdownOpen === idx) {
                        // Flatten all visible items for easier navigation
                        const flattenedItems = filteredTradeNames.reduce((acc, tradeName) => {
                          const tradeItems = filteredGrouped[tradeName] || [];
                          return [...acc, ...tradeItems];
                        }, [] as LineItem[]);
                        
                        switch (e.key) {
                          case 'ArrowDown':
                            e.preventDefault();
                            setActiveOption(prev => 
                              prev < flattenedItems.length - 1 ? prev + 1 : prev
                            );
                            break;
                          case 'ArrowUp':
                            e.preventDefault();
                            setActiveOption(prev => prev > 0 ? prev - 1 : 0);
                            break;
                          case 'Enter':
                            e.preventDefault();
                            if (activeOption >= 0 && activeOption < flattenedItems.length) {
                              const li = flattenedItems[activeOption];
                              const selectedItem = lineItems.find(item => item.id === li.id);
                              const displayValue = selectedItem ? `${selectedItem.name} (${formatCurrency(selectedItem.price)}/${selectedItem.unit})` : '';
                              
                              const newItems = [...items];
                              newItems[idx] = {
                                lineItemId: li.id,
                                quantity: items[idx].quantity || 1,
                                unit: li.unit || '',
                                price: li.price || 0,
                                type: li.type || ''
                              };
                              
                              // Add a new blank line item
                              newItems.push({ lineItemId: '', quantity: 1, unit: '', price: 0, type: '' });
                              
                              setItems(newItems);
                              setComboBoxInputs([
                                ...comboBoxInputs.map((v, i) => i === idx ? displayValue : v),
                                '' // Add empty input for new line item
                              ]);
                              setItemFilters([
                                ...itemFilters,
                                { trade: 'all', type: 'all', unit: 'all' } // Add filter for new line item
                              ]);
                              setDropdownOpen(null);
                              setActiveOption(-1);
                            }
                            break;
                          case 'Escape':
                            e.preventDefault();
                            setDropdownOpen(null);
                            setActiveOption(-1);
                            break;
                        }
                      }
                    }}
                    className="w-full h-10 px-3 py-2 bg-[#333333] border border-gray-700 rounded text-white focus:border-[#336699] focus:ring-[#336699] focus:outline-none font-['Roboto']"
                  />
                  {dropdownOpen === idx && (
                    <div className="absolute z-10 left-0 w-full bg-[#121212] border border-gray-700 rounded shadow-lg max-h-[400px] overflow-auto mt-1">
                      {filteredTradeNames.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm font-['Roboto']">No results</div>
                      )}
                      {filteredTradeNames.map(tradeName => {
                        const itemsByType: Record<string, LineItem[]> = {};
                        (filteredGrouped[tradeName] || []).forEach(li => {
                          const type = li.type || 'Unassigned';
                          if (!itemsByType[type]) itemsByType[type] = [];
                          itemsByType[type].push(li);
                        });
                        const typeNames = Object.keys(itemsByType).sort((a, b) => a.localeCompare(b));
                        return (
                          <div key={tradeName}>
                            <div className="px-3 py-2 text-sm text-white font-bold uppercase tracking-wide bg-[#333333] border-l-4 border-[#336699] font-['Roboto_Condensed']">
                              {tradeName}
                              <span className="ml-1 text-[#336699] font-bold">({(filteredGrouped[tradeName] || []).length})</span>
                            </div>
                            {typeNames.map(typeName => (
                              <div key={typeName}>
                                <div className="px-3 py-2 text-xs uppercase tracking-wide font-medium bg-[#1E1E1E] text-white font-['Roboto_Condensed']">{typeName}</div>
                                {itemsByType[typeName].map((li, i) => {
                                  const flatIdx = filteredOptions.findIndex(opt => opt.li.id === li.id);
                                  const isSelected = item.lineItemId === li.id;
                                  return (
                                    <div
                                      key={li.id}
                                      onMouseDown={() => {
                                        const selectedItem = lineItems.find(item => item.id === li.id);
                                        const displayValue = selectedItem ? `${selectedItem.name} (${formatCurrency(selectedItem.price)}/${selectedItem.unit})` : '';

                                        const newItems = [...items];
                                        newItems[idx] = {
                                          lineItemId: li.id,
                                          quantity: items[idx].quantity || 1,
                                          unit: li.unit || '',
                                          price: li.price || 0,
                                          type: li.type || ''
                                        };
                                        
                                        // Add a new blank line item
                                        newItems.push({ lineItemId: '', quantity: 1, unit: '', price: 0, type: '' });
                                        
                                        setItems(newItems);
                                        setComboBoxInputs([
                                          ...comboBoxInputs.map((v, i) => i === idx ? displayValue : v),
                                          '' // Add empty input for new line item
                                        ]);
                                        setItemFilters([
                                          ...itemFilters,
                                          { trade: 'all', type: 'all', unit: 'all' } // Add filter for new line item
                                        ]);
                                        setDropdownOpen(null);
                                        setActiveOption(-1);
                                      }}
                                      onMouseEnter={() => {
                                        const currentIndex = Object.values(grouped).flat().findIndex(item => item.id === li.id);
                                        setActiveOption(currentIndex);
                                      }}
                                      onMouseLeave={() => setActiveOption(-1)}
                                      className={`px-4 py-2 cursor-pointer text-sm truncate font-['Roboto'] ${
                                        isSelected 
                                          ? 'bg-[#336699] text-white' 
                                          : Object.values(filteredGrouped).flat().findIndex((item: LineItem) => item.id === li.id) === activeOption
                                            ? 'bg-[#1E1E1E] text-white'
                                            : 'hover:bg-[#333333] text-gray-200'
                                      }`}
                                    >
                                      {li.name} ({formatCurrency(li.price)}/{li.unit})
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Show type badge if a line item is selected */}
                {item.lineItemId && getLineItem(item.lineItemId)?.type && (
                  <span className="ml-2 inline-flex items-center justify-center h-10 px-3 rounded bg-[#333333] text-white text-xs uppercase font-bold font-['Roboto_Condensed'] border-l-2 border-[#336699]">
                    {getLineItem(item.lineItemId)?.type}
                  </span>
                )}
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
              className="w-16 h-10 px-3 py-2 rounded border-gray-700 bg-[#333333] text-white font-['Roboto_Mono'] focus:border-[#336699] focus:ring-[#336699] focus:outline-none"
              required
            />
            <span className="text-gray-400 text-xs font-['Roboto']">
                  {item.unit}
            </span>
            <span className="text-white text-sm font-['Roboto_Mono'] ml-2">
                  {formatCurrency(item.price * item.quantity)}
            </span>
            <button type="button" onClick={() => removeItem(idx)} className="ml-2 text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-[#333333] rounded border-l-4 border-[#336699]">
        <div className="flex justify-between items-center">
          <span className="text-sm uppercase font-medium text-white font-['Roboto_Condensed']">Total</span>
          <span className="text-2xl font-bold text-white font-['Roboto_Mono']">{formatCurrency(total)}</span>
        </div>
      </div>
        </form>
      </div>
      <div className="sticky bottom-0 left-0 right-0 p-6 bg-[#121212] border-t border-[#333333] z-10">
        <div className="flex gap-4 max-w-full">
          <button 
            type="button" 
            onClick={handleCancel} 
            className="w-1/2 h-12 px-4 py-2 border border-gray-700 rounded text-white hover:bg-[#1E1E1E] transition-colors font-['Roboto'] font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="w-1/2 h-12 px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors font-['Roboto'] font-medium"
          >
            Save
          </button>
        </div>
      </div>
      {/* Product Options Section removed for cleaner UI */}
    </div>
  );
};

export default ProductAssemblyForm; 