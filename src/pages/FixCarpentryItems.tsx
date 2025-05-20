import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/common/PageHeader';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  type?: string;
  trade_id?: string;
  trade?: { id: string; name: string };
}

const FixCarpentryItems = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carpentryItems, setCarpentryItems] = useState<Product[]>([]);
  const [missingMetadata, setMissingMetadata] = useState<Product[]>([]);
  const [carpentryTradeId, setCarpentryTradeId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchCarpentryData();
    }
  }, [user]);

  const fetchCarpentryData = async () => {
    try {
      setLoading(true);
      
      // First get the Carpentry trade ID
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('id, name')
        .eq('name', 'Carpentry')
        .single();
      
      if (tradesError) {
        console.error('Error fetching Carpentry trade:', tradesError);
        return;
      }
      
      setCarpentryTradeId(trades.id);
      
      // Get all products with Carpentry trade
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*, trade:trades(id, name)')
        .eq('trade_id', trades.id);
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
        return;
      }
      
      setCarpentryItems(products || []);
      
      // Find items missing metadata
      const missing = products.filter(p => !p.type);
      setMissingMetadata(missing);
      
      // Initialize update status
      const initialStatus: Record<string, string> = {};
      missing.forEach(item => {
        initialStatus[item.id] = 'pending';
      });
      setUpdateStatus(initialStatus);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemMetadata = async (itemId: string, type: string) => {
    try {
      setUpdateStatus(prev => ({ ...prev, [itemId]: 'updating' }));
      
      const { error } = await supabase
        .from('products')
        .update({ type })
        .eq('id', itemId);
      
      if (error) {
        console.error('Error updating item:', error);
        setUpdateStatus(prev => ({ ...prev, [itemId]: 'error' }));
        return;
      }
      
      setUpdateStatus(prev => ({ ...prev, [itemId]: 'success' }));
      
      // Update local state
      setCarpentryItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, type } : item
        )
      );
      
      setMissingMetadata(prev => 
        prev.filter(item => item.id !== itemId)
      );
      
    } catch (error) {
      console.error('Error:', error);
      setUpdateStatus(prev => ({ ...prev, [itemId]: 'error' }));
    }
  };

  const updateAllItems = async () => {
    try {
      setSaving(true);
      
      // Create a batch of updates
      const updates = missingMetadata.map(item => {
        // Determine the best type based on the item name and unit
        let suggestedType = 'material';
        
        const nameLower = item.name.toLowerCase();
        if (nameLower.includes('install') || 
            nameLower.includes('labor') || 
            nameLower.includes('carpenter') || 
            nameLower.includes('build') ||
            item.unit === 'hour' ||
            item.unit === 'day') {
          suggestedType = 'labor';
        } else if (nameLower.includes('equipment') || 
                  nameLower.includes('tool') || 
                  nameLower.includes('saw') || 
                  nameLower.includes('compressor')) {
          suggestedType = 'equipment';
        } else if (nameLower.includes('service')) {
          suggestedType = 'service';
        }
        
        return {
          id: item.id,
          type: suggestedType
        };
      });
      
      // Update all items
      for (const update of updates) {
        setUpdateStatus(prev => ({ ...prev, [update.id]: 'updating' }));
        
        const { error } = await supabase
          .from('products')
          .update({ type: update.type })
          .eq('id', update.id);
        
        if (error) {
          console.error(`Error updating item ${update.id}:`, error);
          setUpdateStatus(prev => ({ ...prev, [update.id]: 'error' }));
        } else {
          setUpdateStatus(prev => ({ ...prev, [update.id]: 'success' }));
        }
      }
      
      // Refresh data
      fetchCarpentryData();
      
    } catch (error) {
      console.error('Error updating all items:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">Pending</span>;
      case 'updating':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-700 text-blue-100">Updating...</span>;
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-700 text-green-100">Updated</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-700 text-red-100">Error</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Fix Carpentry Items"
          subtitle="Update missing metadata for carpentry items"
        />
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-gray-400">Loading carpentry items...</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Carpentry Items Summary</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Carpentry Items</p>
                  <p className="text-2xl font-bold text-white">{carpentryItems.length}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Items Missing Metadata</p>
                  <p className="text-2xl font-bold text-white">{missingMetadata.length}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Items Ready for Price Book</p>
                  <p className="text-2xl font-bold text-white">{carpentryItems.length - missingMetadata.length}</p>
                </div>
              </div>
            </div>
            
            {missingMetadata.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Items Missing Metadata</h2>
                  <button
                    onClick={updateAllItems}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Updating All...' : 'Auto-Fix All Items'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Suggested Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {missingMetadata.map(item => {
                        // Determine the best type based on the item name and unit
                        let suggestedType = 'material';
                        
                        const nameLower = item.name.toLowerCase();
                        if (nameLower.includes('install') || 
                            nameLower.includes('labor') || 
                            nameLower.includes('carpenter') || 
                            nameLower.includes('build') ||
                            item.unit === 'hour' ||
                            item.unit === 'day') {
                          suggestedType = 'labor';
                        } else if (nameLower.includes('equipment') || 
                                  nameLower.includes('tool') || 
                                  nameLower.includes('saw') || 
                                  nameLower.includes('compressor')) {
                          suggestedType = 'equipment';
                        } else if (nameLower.includes('service')) {
                          suggestedType = 'service';
                        }
                        
                        return (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.unit}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <select
                                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1"
                                defaultValue={suggestedType}
                                onChange={(e) => {
                                  // Update the suggested type in the UI only
                                  const newType = e.target.value;
                                  // We're not setting state here as this is just for the UI
                                }}
                              >
                                <option value="material">Material</option>
                                <option value="labor">Labor</option>
                                <option value="equipment">Equipment</option>
                                <option value="service">Service</option>
                                <option value="subcontractor">Subcontractor</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {getStatusBadge(updateStatus[item.id])}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              <button
                                onClick={() => updateItemMetadata(item.id, suggestedType)}
                                disabled={updateStatus[item.id] === 'updating' || updateStatus[item.id] === 'success'}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                              >
                                {updateStatus[item.id] === 'updating' ? 'Updating...' : 'Update'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {missingMetadata.length === 0 && (
              <div className="bg-green-800/20 border border-green-700 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-green-400">All carpentry items have proper metadata!</h3>
                <p className="mt-2 text-gray-300">All items should now appear correctly in the price book.</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FixCarpentryItems;
