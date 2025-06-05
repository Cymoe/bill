import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { Check } from 'lucide-react';

interface WorkPackSelectorProps {
  categoryId: string;
  categoryName: string;
  selectedWorkPackId?: string | null;
  onSelect: (workPack: any) => void;
  onCustom: () => void;
}

export const WorkPackSelector: React.FC<WorkPackSelectorProps> = ({
  categoryId,
  categoryName,
  selectedWorkPackId,
  onSelect,
  onCustom
}) => {
  const [workPacks, setWorkPacks] = useState<any[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(selectedWorkPackId || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkPacks();
  }, [categoryId]);

  useEffect(() => {
    setSelectedPack(selectedWorkPackId || null);
  }, [selectedWorkPackId]);

  const loadWorkPacks = async () => {
    try {
      setLoading(true);
      
      console.log('Loading work packs for project type:', {
        categoryName,
        categoryId
      });
      
      // Get work packs with their related counts and details
      const { data: workPacksData, error } = await supabase
        .from('work_packs')
        .select(`
          *,
          tasks:work_pack_tasks(count),
          expenses:work_pack_expenses(count),
          items:work_pack_items(count),
          documents:work_pack_document_templates(count),
          industry:industries(id, name, slug),
          project_type:project_categories!project_type_id(id, name, slug)
        `)
        .eq('is_active', true)
        .eq('project_type_id', categoryId)
        .order('tier');

      if (error) {
        console.error('Error fetching work packs:', error);
        throw error;
      }
      
      console.log('Found work packs:', workPacksData);

      if (workPacksData && workPacksData.length > 0) {
        // Use real data
        setWorkPacks(workPacksData);
      } else {
        // Only use mock data if no real data exists
        console.log('No work packs found for category, using mock data');
        const mockPacks = [
          {
            id: 'budget-1',
            name: `Budget ${categoryName} Pack`,
            description: `Basic ${categoryName.toLowerCase()} with essential features`,
            tier: 'budget',
            base_price: 3200,
            items: [{ count: 4 }],
            tasks: [{ count: 5 }],
            expenses: [{ count: 5 }],
            documents: [{ count: 2 }]
          },
          {
            id: 'standard-1',
            name: `Standard ${categoryName} Pack`,
            description: `Complete ${categoryName.toLowerCase()} with quality materials`,
            tier: 'standard',
            base_price: 12800,
            items: [{ count: 6 }],
            tasks: [{ count: 10 }],
            expenses: [{ count: 12 }],
            documents: [{ count: 3 }]
          },
          {
            id: 'premium-1',
            name: `Premium ${categoryName} Pack`,
            description: `High-end ${categoryName.toLowerCase()} with luxury finishes`,
            tier: 'premium',
            base_price: 28500,
            items: [{ count: 10 }],
            tasks: [{ count: 15 }],
            expenses: [{ count: 18 }],
            documents: [{ count: 4 }]
          }
        ];
        
        setWorkPacks(mockPacks);
      }
    } catch (error) {
      console.error('Error loading work packs:', error);
      setWorkPacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePackSelect = async (pack: any) => {
    setSelectedPack(pack.id);
    
    // If this is mock data, add mock items
    if (pack.id.startsWith('budget-') || pack.id.startsWith('standard-') || pack.id.startsWith('premium-')) {
      // Create mock items based on tier
      const mockItems = [];
      const itemCount = pack.items[0].count;
      
      for (let i = 0; i < itemCount; i++) {
        mockItems.push({
          item_type: 'product',
          quantity: Math.floor(Math.random() * 5) + 1,
          price: pack.tier === 'budget' ? 200 + (i * 100) : 
                 pack.tier === 'standard' ? 500 + (i * 200) :
                 1000 + (i * 300),
          product: {
            name: `${pack.tier.charAt(0).toUpperCase() + pack.tier.slice(1)} Product ${i + 1}`
          }
        });
      }
      
      onSelect({ ...pack, items: mockItems });
    } else {
      // Load real work pack items from database
      try {
        const { data: workPackItems, error } = await supabase
          .from('work_pack_items')
          .select(`
            *,
            line_item:line_items(*),
            product:products(*)
          `)
          .eq('work_pack_id', pack.id)
          .order('display_order');
          
        if (error) {
          console.error('Error loading work pack items:', error);
          // Use empty array as fallback
          onSelect({ ...pack, items: [] });
        } else {
          onSelect({ ...pack, items: workPackItems || [] });
        }
      } catch (error) {
        console.error('Error in handlePackSelect:', error);
        onSelect({ ...pack, items: [] });
      }
    }
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'budget':
        return 'bg-[#0d2818] text-[#4ade80]';
      case 'standard':
        return 'bg-[#1a1a1a] text-[#999]';
      case 'premium':
        return 'bg-[#2d2006] text-[#fbbf24]';
      default:
        return 'bg-[#1a1a1a] text-[#666]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight uppercase">
          SELECT {categoryName.toUpperCase()} WORK PACK
        </h3>
        <p className="text-sm text-gray-500">
          Choose a pre-configured package or start from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {workPacks.map((pack) => (
          <button
            key={pack.id}
            onClick={() => handlePackSelect(pack)}
            className={`relative flex flex-col text-left p-6 rounded-lg border transition-all duration-200
                      ${selectedPack === pack.id
                        ? 'bg-[#0f1729] border-[#fbbf24]'
                        : 'bg-transparent border-[#2a2a2a] hover:bg-[#111] hover:border-[#3a3a3a]'}`}
          >
            {/* Selected Indicator */}
            {selectedPack === pack.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-[#fbbf24] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              </div>
            )}

            {/* Tier Badge as Icon */}
            <div className={`w-fit px-3 py-1.5 rounded text-[10px] font-medium uppercase tracking-wider mb-4 ${getTierStyle(pack.tier)}`}>
              {pack.tier}
            </div>

            {/* Content */}
            <h4 className="text-base font-semibold text-white mb-2">{pack.name}</h4>
            <p className="text-sm text-gray-500 mb-5 line-clamp-2">{pack.description}</p>

            {/* Stats */}
            <div className="flex gap-4 pb-4 mb-4 border-b border-[#1a1a1a]">
              <div className="text-xs text-gray-500">
                <span className="block text-sm font-semibold text-white mb-0.5">{pack.items[0].count}</span>
                Products
              </div>
              <div className="text-xs text-gray-500">
                <span className="block text-sm font-semibold text-white mb-0.5">{pack.tasks[0].count}</span>
                Tasks
              </div>
              <div className="text-xs text-gray-500">
                <span className="block text-sm font-semibold text-white mb-0.5">{pack.expenses[0].count}</span>
                Expenses
              </div>
              {pack.documents && pack.documents[0]?.count > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="block text-sm font-semibold text-white mb-0.5">{pack.documents[0].count}</span>
                  Docs
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">Total Value</span>
              <span className="text-xl font-bold">{formatCurrency(pack.base_price)}</span>
            </div>
          </button>
        ))}

        {/* Custom Pack Option */}
        <button
          onClick={onCustom}
          className={`col-span-full border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200
                    ${selectedPack === 'custom'
                      ? 'bg-[#0f1729] border-[#fbbf24]'
                      : 'bg-transparent border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#0a0a0a]'}`}
        >
          <div className="text-3xl text-gray-500 mb-3">+</div>
          <h4 className="text-base font-semibold text-white mb-1">Custom Work Pack</h4>
          <p className="text-sm text-gray-500">Start from scratch and build your own package</p>
        </button>
      </div>
    </div>
  );
};

export default WorkPackSelector; 