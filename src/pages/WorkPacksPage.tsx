import React, { useState, useEffect, useRef, useContext } from 'react';
import { Plus, Search, MoreVertical, Edit, Copy, BarChart, Upload, Archive, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';
import { advancedSearch, SearchableField } from '../utils/searchUtils';
import { CreateWorkPackModal } from '../components/templates/CreateWorkPackModal';
import { useAuth } from '../contexts/AuthContext';
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
  industry?: {
    id: string;
    name: string;
  };
  project_type?: {
    id: string;
    name: string;
  };
}

export default function WorkPacksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedOrg } = useContext(OrganizationContext);
  const [workPacks, setWorkPacks] = useState<WorkPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

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
          industry:industries(id, name, slug),
          project_type:project_categories!project_type_id(id, name, slug),
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
          workPack.project_type && userCategories.includes(workPack.project_type.name)
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

  const filteredWorkPacks = workPacks.filter(pack => {
    // Advanced search filter
    let matchesSearch = true;
    if (searchTerm) {
      const searchableFields: SearchableField[] = [
        { 
          key: 'name', 
          weight: 2.0, // Higher weight for work pack names
          transform: (pack) => pack.name || ''
        },
        { 
          key: 'description', 
          weight: 1.5, // High weight for descriptions
          transform: (pack) => pack.description || ''
        },
        { 
          key: 'category_name', 
          weight: 1.3,
          transform: (pack) => pack.category?.name || ''
        },
        { 
          key: 'industry_name', 
          weight: 1.2,
          transform: (pack) => pack.industry?.name || ''
        },
        { 
          key: 'project_type_name', 
          weight: 1.1,
          transform: (pack) => pack.project_type?.name || ''
        },
        { 
          key: 'tier', 
          weight: 1.0,
          transform: (pack) => pack.tier || ''
        },
        { 
          key: 'base_price', 
          weight: 0.9,
          transform: (pack) => formatCurrency(pack.base_price || 0)
        },
        { 
          key: 'status', 
          weight: 0.8,
          transform: (pack) => pack.is_active ? 'active' : 'inactive'
        }
      ];

      const searchResults = advancedSearch([pack], searchTerm, searchableFields, {
        minScore: 0.2, // Lower threshold for more inclusive results
        requireAllTerms: false // Allow partial matches
      });

      matchesSearch = searchResults.length > 0;
    }

    const matchesCategory = selectedCategory === 'all' || pack.category?.name === selectedCategory;
    const matchesTier = selectedTier === 'all' || pack.tier === selectedTier;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && pack.is_active) ||
      (selectedStatus === 'inactive' && !pack.is_active);
    
    // Price range filter
    let matchesPrice = true;
    if (minPrice || maxPrice) {
      const price = pack.base_price || 0;
      if (minPrice && price < parseFloat(minPrice)) matchesPrice = false;
      if (maxPrice && price > parseFloat(maxPrice)) matchesPrice = false;
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
          industry_id: pack.industry?.id,
          project_type_id: pack.project_type?.id,
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
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Single Unified Card */}
      <div className="bg-transparent border border-[#333333]">
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Work Packs</h1>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search work packs..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-[#1E1E1E] border border-[#333333] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-[300px]"
              />
            </div>
            
            <button
              onClick={() => setEditModalOpen(true)}
              className="bg-white hover:bg-gray-100 text-black px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 w-[150px] justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Work Pack</span>
            </button>
          </div>
        </div>

        {/* Industry Filter Section */}
        <div className="border-t border-[#333333] px-6 py-4 bg-[#1A1A1A]/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 uppercase tracking-wider font-medium">WORK PACKS FOR</span>
            <div className="flex flex-wrap gap-1">
              {userIndustries.length > 0 ? (
                userIndustries.map((industry, index) => (
                  <span key={index} className="text-[#EAB308] font-medium">
                    {industry}{index < userIndustries.length - 1 ? ',' : ''}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">All Industries</span>
              )}
            </div>
            <span className="text-blue-400 text-xs ml-2 cursor-pointer hover:text-blue-300">
              Filtered by organization focus
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="border-t border-[#333333] px-6 py-5">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL PACKS</div>
              <div className="text-lg font-semibold mt-1">{stats.totalPacks}</div>
              <div className="text-xs text-gray-500">({workPacks.length} project types)</div>
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
              <div className="text-lg font-semibold text-[#EAB308] mt-1">{stats.mostUsed || 'Premium Kitchen Work...'}</div>
              <div className="text-xs text-gray-500">(18 projects)</div>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <div className="border-t border-[#333333] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Filters */}
            <div className="flex items-center gap-3">
              <select
                className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Project Types ({workPacks.length})</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({getCategoryCount(category.name)})
                  </option>
                ))}
              </select>

              <div className="relative" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>

                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] p-4">
                    <div className="space-y-4">
                      {/* Tier Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                          Tier
                        </label>
                        <select
                          className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
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
                          className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
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
                            className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            className="w-full bg-[#333333] border border-[#555555] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
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
                          className="w-full bg-[#333333] hover:bg-[#404040] text-white py-2 px-3 text-sm font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - View options */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={optionsMenuRef}>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showOptionsMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] py-2">
                    <button
                      onClick={handleImportWorkPacks}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Import Work Packs
                    </button>
                    <button
                      onClick={handleExportWorkPacks}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Export Work Packs
                    </button>
                    <button
                      onClick={handleBulkEdit}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Bulk Edit
                    </button>
                    <button
                      onClick={handleAnalytics}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                    >
                      <BarChart className="w-4 h-4" />
                      Analytics
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Work Packs Header */}
        <div className="border-t border-[#333333] px-6 py-3 bg-[#1E1E1E]/50">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">WORK PACKS</div>
        </div>

        {/* Work Packs Content */}
        <div className="border-t border-[#333333]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-8 h-8 border-2 border-[#336699] border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-400">Loading work packs...</p>
            </div>
          ) : filteredWorkPacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#333333] flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No work packs yet</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Create your first work pack to start organizing your project templates and pricing.
              </p>
              <button
                onClick={() => setEditModalOpen(true)}
                className="bg-white hover:bg-gray-100 text-black px-6 py-3 font-medium transition-colors"
              >
                Create Your First Work Pack
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#333333]">
              {filteredWorkPacks.map((workPack) => (
                <div
                  key={workPack.id}
                  className="px-6 py-6 hover:bg-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{workPack.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium uppercase tracking-wide ${getTierBadgeClass(workPack.tier)}`}>
                          {workPack.tier}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{workPack.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-[#EAB308] font-mono font-semibold">
                          {formatCurrency(workPack.base_price)}
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span>{workPack.usage_count || 0} projects</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(workPack.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
                        title="View details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(workPack)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === workPack.id ? null : workPack.id)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {activeDropdown === workPack.id && (
                          <div className="absolute right-0 top-8 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1">
                            <button
                              onClick={() => {
                                handleEdit(workPack.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDuplicate(workPack);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                handleArchive(workPack.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                            >
                              <Archive className="w-4 h-4" />
                              Archive
                            </button>
                            <div className="border-t border-[#333333] my-1" />
                            <button
                              onClick={() => {
                                handleDelete(workPack.id);
                                setActiveDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#333333] flex items-center gap-2"
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
              ))}
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