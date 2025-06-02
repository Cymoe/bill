import React, { useState, useEffect, useRef, useContext } from 'react';
import { Plus, Search, MoreVertical, Edit, Copy, BarChart, Upload, Archive, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';
import { CreateWorkPackModal } from '../components/templates/CreateWorkPackModal';
import { useAuth } from '../contexts/AuthContext';
import { PageHeaderBar } from '../components/common/PageHeaderBar';
import { OrganizationContext } from '../components/layouts/DashboardLayout';

interface WorkPack {
  id: string;
  name: string;
  description: string;
  tier: 'budget' | 'standard' | 'premium';
  base_price: number;
  is_active: boolean;
  category: {
    id: string;
    name: string;
  };
  usage_count?: number;
  products_count?: number;
  tasks_count?: number;
  expenses_count?: number;
}

export default function WorkPacksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const [workPacks, setWorkPacks] = useState<WorkPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWorkPackId, setSelectedWorkPackId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [userIndustries, setUserIndustries] = useState<string[]>([]);
  const [userIndustryIds, setUserIndustryIds] = useState<string[]>([]);
  const [industryCategories, setIndustryCategories] = useState<{ [industryId: string]: string[] }>({});
  const [currentOrgId, setCurrentOrgId] = useState<string>('');
  
  // Stats
  const [stats, setStats] = useState({
    totalPacks: 0,
    activePacks: 0,
    totalValue: 0,
    mostUsed: '',
    avgProducts: 0
  });

  const filterMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWorkPacks();
    loadCategories();
    loadUserIndustries();
  }, []);

  // Reload when organization changes
  useEffect(() => {
    if (selectedOrg?.id && selectedOrg.id !== currentOrgId) {
      setCurrentOrgId(selectedOrg.id);
      loadWorkPacks();
      loadUserIndustries(); // Also reload industries for new organization
    }
  }, [selectedOrg]);

  useEffect(() => {
    // Reload work packs when user industries change
    console.log('industryCategories changed:', industryCategories);
    console.log('userIndustryIds:', userIndustryIds);
    if (Object.keys(industryCategories).length > 0 || userIndustryIds.length === 0) {
      // Only reload if we have the mapping or user has no industries selected
      console.log('Reloading work packs and categories...');
      loadWorkPacks();
      loadCategories();
    }
  }, [industryCategories]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dropdown-wrapper')) {
        setActiveDropdown(null);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Get user's industry categories
      const userCategories = getUserIndustryCategories();
      const hasUserIndustries = userIndustries.length > 0;
      
      let filteredCategories = data || [];
      
      // If user has selected industries, only show categories for those industries
      if (hasUserIndustries) {
        filteredCategories = filteredCategories.filter(category => 
          userCategories.includes(category.name)
        );
      }
      // If no user industries selected, show all categories
      
      console.log(`Categories: all=${data?.length}, filtered=${filteredCategories.length}`, {
        userIndustries,
        userCategories,
        filteredCategories: filteredCategories.map(c => c.name)
      });
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadWorkPacks = async () => {
    try {
      setLoading(true);
      
      // Get categories for user's selected industries
      const userCategories = getUserIndustryCategories();
      const hasUserIndustries = userIndustries.length > 0;
      
      console.log('Loading work packs with filters:', {
        userIndustries,
        userCategories,
        organizationId: selectedOrg?.id
      });
      
      let query = supabase
        .from('work_packs')
        .select(`
          *,
          category:project_categories(id, name),
          items:work_pack_items(count),
          tasks:work_pack_tasks(count),
          expenses:work_pack_expenses(count)
        `)
        .eq('user_id', user?.id);
        
      // Filter by organization if available
      if (selectedOrg?.id) {
        query = query.eq('organization_id', selectedOrg.id);
      }
      
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Filter work packs by user's industry categories
      let filteredData = data || [];
      
      // Apply user industries filter (if user has selected specific industries)
      if (hasUserIndustries) {
        filteredData = filteredData.filter(workPack => 
          workPack.category && userCategories.includes(workPack.category.name)
        );
      }
      
      console.log(`Work packs: all=${data?.length}, filtered=${filteredData.length}`);

      // Process data to include counts
      const processedData = filteredData.map(pack => ({
        ...pack,
        products_count: pack.items?.[0]?.count || 0,
        tasks_count: pack.tasks?.[0]?.count || 0,
        expenses_count: pack.expenses?.[0]?.count || 0,
        usage_count: Math.floor(Math.random() * 20) + 1 // TODO: Get real usage count
      }));

      setWorkPacks(processedData);
      calculateStats(processedData);
    } catch (error) {
      console.error('Error loading work packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (packs: WorkPack[]) => {
    const activePacks = packs.filter(p => p.is_active);
    const totalValue = packs.reduce((sum, p) => sum + p.base_price, 0);
    const mostUsed = packs.reduce((prev, current) => 
      (prev.usage_count || 0) > (current.usage_count || 0) ? prev : current
    );
    const avgProducts = packs.reduce((sum, p) => sum + (p.products_count || 0), 0) / packs.length;

    setStats({
      totalPacks: packs.length,
      activePacks: activePacks.length,
      totalValue,
      mostUsed: mostUsed?.name || 'N/A',
      avgProducts: Math.round(avgProducts)
    });
  };

  const filteredWorkPacks = workPacks
    .filter(pack => {
      const matchesSearch = pack.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                          pack.description?.toLowerCase().includes(searchInput.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pack.category?.name === selectedCategory;
      const matchesTier = selectedTier === 'all' || pack.tier === selectedTier;
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && pack.is_active) ||
                           (selectedStatus === 'inactive' && !pack.is_active);
      
      // Price filter
      let matchesPrice = true;
      if (minPrice !== '') {
        matchesPrice = matchesPrice && pack.base_price >= parseFloat(minPrice);
      }
      if (maxPrice !== '') {
        matchesPrice = matchesPrice && pack.base_price <= parseFloat(maxPrice);
      }
      
      return matchesSearch && matchesCategory && matchesTier && matchesStatus && matchesPrice;
    });

  const handleView = (id: string) => {
    navigate(`/work-packs/${id}`);
  };

  const handleEdit = (id: string) => {
    setSelectedWorkPackId(id);
    setEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDuplicate = async (pack: WorkPack) => {
    try {
      const { data: newPack, error } = await supabase
        .from('work_packs')
        .insert({
          name: `${pack.name} (Copy)`,
          description: pack.description,
          category_id: pack.category.id,
          tier: pack.tier,
          base_price: pack.base_price,
          user_id: user?.id,
          organization_id: selectedOrg?.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // TODO: Also duplicate items, tasks, and expenses
      
      loadWorkPacks();
    } catch (error) {
      console.error('Error duplicating work pack:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('work_packs')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      loadWorkPacks();
    } catch (error) {
      console.error('Error archiving work pack:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work pack?')) return;
    
    try {
      const { error } = await supabase
        .from('work_packs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadWorkPacks();
    } catch (error) {
      console.error('Error deleting work pack:', error);
    }
  };

  const getCategoryCount = (categoryName: string) => {
    return workPacks.filter(p => p.category?.name === categoryName).length;
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'budget':
        return 'bg-green-900/30 text-green-400 border-green-800/50';
      case 'premium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50';
      default:
        return 'bg-[#1a1a1a] text-gray-400 border-[#2a2a2a]';
    }
  };

  // Options menu handlers
  const handleImportWorkPacks = () => {
    // TODO: Implement import functionality
    console.log('Import work packs clicked');
    setShowOptionsMenu(false);
  };

  const handleExportWorkPacks = () => {
    // TODO: Implement export functionality
    console.log('Export work packs clicked');
    setShowOptionsMenu(false);
  };

  const handleBulkEdit = () => {
    // TODO: Implement bulk edit functionality
    console.log('Bulk edit clicked');
    setShowOptionsMenu(false);
  };

  const handleAnalytics = () => {
    // TODO: Navigate to work packs analytics
    console.log('View analytics clicked');
    setShowOptionsMenu(false);
  };

  const loadUserIndustries = async () => {
    if (!user || !selectedOrg?.id) return;
    
    try {
      // Load organization's selected industries
      const { data: orgIndustriesData, error } = await supabase
        .from('organization_industries')
        .select('industry:industries(id, name)')
        .eq('organization_id', selectedOrg.id);
        
      if (error) throw error;
      
      const industryNames = orgIndustriesData?.map((oi: any) => oi.industry?.name).filter(Boolean) || [];
      const industryIds = orgIndustriesData?.map((oi: any) => oi.industry?.id).filter(Boolean) || [];
      
      setUserIndustries(industryNames);
      setUserIndustryIds(industryIds);
      
      console.log('Organization selected industries:', industryNames);
      console.log('Organization industry IDs:', industryIds);
      
      // Load project categories for these industries
      if (industryIds.length > 0) {
        const { data: categoriesData, error: catError } = await supabase
          .from('project_categories')
          .select('name, industry_id')
          .in('industry_id', industryIds)
          .eq('is_active', true);
          
        if (catError) throw catError;
        
        // Build mapping of industry ID to category names
        const mapping: { [industryId: string]: string[] } = {};
        categoriesData?.forEach((cat: any) => {
          if (!mapping[cat.industry_id]) {
            mapping[cat.industry_id] = [];
          }
          mapping[cat.industry_id].push(cat.name);
        });
        
        setIndustryCategories(mapping);
        console.log('Industry to categories mapping:', mapping);
      }
    } catch (error) {
      console.error('Error loading organization industries:', error);
    }
  };

  // Create a mapping of user's selected industries to their categories
  const getUserIndustryCategories = () => {
    const categories: string[] = [];
    userIndustryIds.forEach(industryId => {
      const industriesCats = industryCategories[industryId] || [];
      if (industriesCats.length > 0) {
        categories.push(...industriesCats);
      }
    });
    // Remove duplicates
    const uniqueCategories = [...new Set(categories)];
    console.log('User industry categories:', {
      userIndustries,
      userIndustryIds,
      mappedCategories: uniqueCategories
    });
    return uniqueCategories;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <PageHeaderBar 
        title="Work Packs"
        searchPlaceholder="Search work packs..."
        onSearch={(query) => setSearchInput(query)}
        searchValue={searchInput}
        addButtonLabel="Add Work Pack"
        onAddClick={() => {
          setSelectedWorkPackId(null);
          setEditModalOpen(true);
        }}
      />
      
      {/* Unified Stats + Table Container */}
      <div className="bg-[#333333]/30 border border-[#333333] rounded-[4px]">
        {/* Stats Section */}
        <div className="px-6 py-4 border-b border-[#333333]/50 rounded-t-[4px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider">WORK PACKS</span>
              {userIndustries.length > 0 && (
                <>
                  <span className="text-xs text-gray-400">FOR</span>
                  <span className="text-sm font-medium text-[#F9D71C]">
                    {userIndustries.join(', ')}
                  </span>
                </>
              )}
            </div>
            {userIndustries.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Filter className="w-3 h-3" />
                <span>Filtered by organization focus</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL PACKS</div>
              <div className="text-lg font-semibold mt-1">{stats.totalPacks}</div>
              <div className="text-xs text-gray-500">({categories.length} project types)</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">ACTIVE</div>
              <div className="text-lg font-semibold mt-1">{stats.activePacks}</div>
              <div className="text-xs text-gray-500">(in use)</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL VALUE</div>
              <div className="text-lg font-semibold mt-1">{formatCurrency(stats.totalValue)}</div>
              <div className="text-xs text-gray-500">(combined)</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">MOST USED</div>
              <div className="text-lg font-semibold text-[#F9D71C] mt-1">{stats.mostUsed.length > 20 ? stats.mostUsed.substring(0, 20) + '...' : stats.mostUsed}</div>
              <div className="text-xs text-gray-500">(18 projects)</div>
            </div>
          </div>
        </div>

        {/* Table Controls Header */}
        <div className="px-6 py-4 border-b border-[#333333]/50">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex items-center gap-3">
              <select
                className="bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Project Types ({filteredWorkPacks.length})</option>
                {categories.map(cat => {
                  const count = filteredWorkPacks.filter(p => p.category?.name === cat.name).length;
                  return (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} ({count})
                    </option>
                  );
                })}
              </select>

              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>

                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      {/* Tier Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Tier
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedTier}
                          onChange={(e) => setSelectedTier(e.target.value)}
                        >
                          <option value="all">All Tiers</option>
                          <option value="budget">Budget</option>
                          <option value="standard">Standard</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Status
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Price Range
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Clear Filters */}
                      <div className="pt-2 border-t border-[#333333]">
                        <button
                          onClick={() => {
                            setSelectedCategory('all');
                            setSelectedTier('all');
                            setSelectedStatus('all');
                            setMinPrice('');
                            setMaxPrice('');
                            setShowFilterMenu(false);
                          }}
                          className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 rounded-[4px] text-sm font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Options */}
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 hover:bg-[#333333] rounded-[4px] transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333]">
                    Data Management
                  </div>
                  <button
                    onClick={handleImportWorkPacks}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Upload className="w-3 h-3 mr-3 text-gray-400" />
                    Import Work Packs
                  </button>
                  <button
                    onClick={handleExportWorkPacks}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Archive className="w-3 h-3 mr-3 text-gray-400" />
                    Export Work Packs
                  </button>
                  <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-[#333333] border-t border-[#333333] mt-1">
                    Management
                  </div>
                  <button
                    onClick={handleBulkEdit}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <Edit className="w-3 h-3 mr-3 text-gray-400" />
                    Bulk Edit
                  </button>
                  <button
                    onClick={handleAnalytics}
                    className="w-full flex items-center px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                  >
                    <BarChart className="w-3 h-3 mr-3 text-gray-400" />
                    View Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="px-6 py-3 border-b border-[#333333]/50 bg-[#1E1E1E]/50">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            WORK PACKS
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden rounded-b-[4px]">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#336699]"></div>
            </div>
          ) : (
            <div>
              {filteredWorkPacks.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-[#333333] rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No work packs found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    {userIndustries.length > 0 
                      ? `No work packs found for this organization's focus (${userIndustries.join(', ')}). Create work packs specific to this organization's services.`
                      : "Start building your work pack library to streamline project creation and ensure consistent pricing."
                    }
                  </p>
                  <div className="flex flex-col gap-3 items-center">
                    <button
                      onClick={() => {
                        setSelectedWorkPackId(null);
                        setEditModalOpen(true);
                      }}
                      className="bg-white hover:bg-gray-100 text-[#121212] px-6 py-3 rounded-[4px] font-medium transition-colors"
                    >
                      Add Your First Work Pack
                    </button>
                    {userIndustries.length > 0 && (
                      <button
                        onClick={() => navigate('/settings/industries')}
                        className="text-[#336699] hover:text-white text-sm font-medium transition-colors"
                      >
                        Manage Organization Focus
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredWorkPacks.map((pack, index) => (
                  <div
                    key={pack.id}
                    className={`px-6 py-4 cursor-pointer transition-all hover:bg-[#1A1A1A] ${
                      index !== filteredWorkPacks.length - 1 ? 'border-b border-[#333333]/50' : ''
                    }`}
                    onClick={() => handleView(pack.id)}
                  >
                    {/* Top Row: Title */}
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-lg font-semibold text-white">{pack.name}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-medium ${getTierBadgeClass(pack.tier)}`}>
                          {pack.tier}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{pack.description || 'No description'}</div>
                    </div>
                    
                    {/* Bottom Row: Category, Price, Usage, Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div className="text-sm text-gray-400">{pack.category?.name}</div>
                        <div className="text-xl font-bold text-[#fbbf24]">{formatCurrency(pack.base_price)}</div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          {pack.usage_count} projects
                        </div>
                      </div>
                      
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(pack.id);
                          }}
                          className="w-7 h-7 bg-transparent border border-[#2a2a2a] rounded flex items-center justify-center text-gray-600 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(pack);
                          }}
                          className="w-7 h-7 bg-transparent border border-[#2a2a2a] rounded flex items-center justify-center text-gray-600 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <div className="relative dropdown-wrapper">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === pack.id ? null : pack.id);
                            }}
                            className="w-7 h-7 bg-transparent border border-[#2a2a2a] rounded flex items-center justify-center text-gray-600 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                          
                          {activeDropdown === pack.id && (
                            <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-2 min-w-[180px] shadow-2xl z-50">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                  handleAnalytics();
                                }}
                                className="w-full px-4 py-3 text-left text-sm rounded-lg hover:bg-[#2a2a2a] transition-all flex items-center gap-3"
                              >
                                <BarChart className="w-4 h-4" />
                                View Analytics
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                  handleExportWorkPacks();
                                }}
                                className="w-full px-4 py-3 text-left text-sm rounded-lg hover:bg-[#2a2a2a] transition-all flex items-center gap-3"
                              >
                                <Upload className="w-4 h-4" />
                                Export
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchive(pack.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm rounded-lg hover:bg-[#2a2a2a] transition-all flex items-center gap-3"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                              <div className="h-px bg-[#2a2a2a] my-2" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(pack.id);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-3 text-left text-sm rounded-lg hover:bg-red-900/20 transition-all flex items-center gap-3 text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateWorkPackModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedWorkPackId(null);
        }}
        onSuccess={loadWorkPacks}
        workPackId={selectedWorkPackId}
        categories={categories}
      />
    </div>
  );
} 