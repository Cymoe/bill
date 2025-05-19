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
  const [items, setItems] = useState<{ lineItemId: string; quantity: number; unit: string; price: number; type?: string }[]>([]);
  const [itemFilters, setItemFilters] = useState<{ trade: string; type: string; unit: string }[]>([]);
  const [comboBoxInputs, setComboBoxInputs] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [activeOption, setActiveOption] = useState<number>(-1);
  const [draftId, setDraftId] = useState<string | null>(null);

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
      await supabase.from('products').upsert([
        {
          user_id: user.id,
          name: name || 'Draft Product',
          description,
          items,
          status: 'draft',
        }
      ], { onConflict: 'user_id,status' });
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

  const addItem = () => {
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
    if (draftId) {
      // Update draft row to published
      await supabase.from('products').update({
        name, description, items, status: 'published'
      }).eq('id', draftId);
      onSave({ name, description, items, id: draftId, status: 'published' });
    } else {
      // Insert new product
      const { data, error } = await supabase.from('products').insert({
        user_id: user.id,
        name,
        description,
        items,
        status: 'published'
      }).select().single();
      onSave({ name, description, items, id: data?.id, status: 'published' });
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
    if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setItems(editingProduct.items || []);
      setItemFilters((editingProduct.items || []).map(() => ({ trade: 'all', type: 'all', unit: 'all' })));
      setComboBoxInputs((editingProduct.items || []).map((item: any) => {
        const li = lineItems.find((li) => li.id === item.lineItemId);
        return li ? `${li.name} (${formatCurrency(li.price)}/${li.unit})` : '';
      }));
      setDraftId(editingProduct.id || null);
    }
  }, [editingProduct, lineItems]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">{editingProduct ? 'Edit Product / Assembly' : 'New Product / Assembly'}</h2>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-6 w-6" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Product/Assembly Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        rows={2}
      />
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium">Line Items</span>
          <button type="button" onClick={addItem} className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
        </div>
        {items.length === 0 && <div className="text-gray-400 text-sm">No line items yet.</div>}
        {items.map((item, idx) => {
          const filter = itemFilters[idx] || { trade: 'all', type: 'all', unit: 'all' };
          const comboBoxValue = comboBoxInputs[idx] || '';
          const trades = Array.from(new Set(lineItems.map(li => li.trade).filter((x): x is string => Boolean(x))));
          const types = Array.from(new Set(lineItems.map(li => li.type).filter((x): x is string => Boolean(x))));
          const units = Array.from(new Set(lineItems.map(li => li.unit).filter((x): x is string => Boolean(x))));

          let filtered = lineItems;
          if (comboBoxValue) filtered = filtered.filter(li => li.name.toLowerCase().includes(comboBoxValue.toLowerCase()));
          if (filter.trade !== 'all') filtered = filtered.filter(li => li.trade === filter.trade);
          if (filter.type !== 'all') filtered = filtered.filter(li => li.type === filter.type);
          if (filter.unit !== 'all') filtered = filtered.filter(li => li.unit === filter.unit);

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
            <div key={idx} className="flex flex-col gap-1 mb-2 p-2 bg-gray-800 rounded">
              <div className="flex gap-2 mb-1">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Select or search line item..."
                    value={comboBoxValue}
                    onChange={e => {
                      setComboBoxInputs(comboBoxInputs.map((v, i) => i === idx ? e.target.value : v));
                      setDropdownOpen(idx);
                      setActiveOption(-1);
                    }}
                    onFocus={() => {
                      const selectedLi = item.lineItemId ? getLineItem(item.lineItemId) : null;
                      const selectedLabel = selectedLi ? getLineItemLabel(selectedLi) : '';
                      if (comboBoxValue === selectedLabel) {
                        setComboBoxInputs(comboBoxInputs.map((v, i) => i === idx ? '' : v));
                        setItemFilters(itemFilters.map((f, i) =>
                          i === idx ? { trade: 'all', type: 'all', unit: 'all' } : f
                        ));
                        setTimeout(() => {
                          setDropdownOpen(idx);
                          setActiveOption(-1);
                        }, 0);
                      } else {
                        setDropdownOpen(idx);
                        setActiveOption(-1);
                      }
                    }}
                    onClick={() => {
                      const selectedLi = item.lineItemId ? getLineItem(item.lineItemId) : null;
                      const selectedLabel = selectedLi ? getLineItemLabel(selectedLi) : '';
                      if (comboBoxValue === selectedLabel) {
                        setComboBoxInputs(comboBoxInputs.map((v, i) => i === idx ? '' : v));
                        setItemFilters(itemFilters.map((f, i) =>
                          i === idx ? { trade: 'all', type: 'all', unit: 'all' } : f
                        ));
                      }
                      setDropdownOpen(idx);
                      setActiveOption(-1);
                    }}
                    onBlur={e => { setTimeout(() => setDropdownOpen(null), 150); }}
                    className="w-full rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 px-2 py-1 text-xs"
                  />
                  {dropdownOpen === idx && (
                    <div className="absolute z-10 left-0 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-[400px] overflow-auto mt-1">
                      {filteredTradeNames.length === 0 && (
                        <div className="px-2 py-1 text-gray-400 text-xs">No results</div>
                      )}
                      {filteredTradeNames.map(tradeName => (
                        <div key={tradeName}>
                          <div className="px-2 py-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wide bg-gray-800">{tradeName}</div>
                          {filteredGrouped[tradeName].map((li, i) => {
                            const flatIdx = filteredOptions.findIndex(opt => opt.li.id === li.id);
                            return (
                              <div
                                key={li.id}
                                className={`px-2 py-1 cursor-pointer text-xs truncate ${item.lineItemId === li.id ? 'bg-indigo-700 text-white' : flatIdx === activeOption ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-200'}`}
                                onMouseDown={() => { updateItem(idx, 'lineItemId', li.id); setDropdownOpen(null); }}
                                onMouseEnter={() => setActiveOption(flatIdx)}
                              >
                                {li.name} ({formatCurrency(li.price)}/{li.unit})
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Show type badge if a line item is selected */}
                {item.lineItemId && getLineItem(item.lineItemId)?.type && (
                  <span className="ml-2 inline-block px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-[10px] uppercase align-middle">
                    {getLineItem(item.lineItemId)?.type}
                  </span>
                )}
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
              className="w-16 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <span className="text-gray-500 text-xs">
                  {item.unit}
            </span>
            <span className="text-gray-700 dark:text-gray-200 text-sm font-mono ml-2">
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
      <div className="flex justify-between items-center mt-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={handleCancel} className="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
        <button type="submit" className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
      </div>
    </form>
  );
};

export default ProductAssemblyForm; 