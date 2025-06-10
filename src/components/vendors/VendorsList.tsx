import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Phone, Mail, Globe, Star, 
  Plus, Search, Filter, Edit2, Trash2, 
  MapPin, Shield, CreditCard, ChevronRight,
  CheckCircle, Info, ChevronDown, List, LayoutGrid, Rows3,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import { VendorService, Vendor, VENDOR_CATEGORIES } from '../../services/vendorService';
import { formatCurrency } from '../../utils/format';
import { CreateVendorModal } from './CreateVendorModal';
import { EditVendorDrawer } from './EditVendorDrawer';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';

interface VendorsListProps {
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  hideAddButton?: boolean;
}

export const VendorsList: React.FC<VendorsListProps> = ({ 
  showAddModal: externalShowAddModal, 
  setShowAddModal: externalSetShowAddModal, 
  hideAddButton = false 
}) => {
  const { user } = useAuth();
  const { isConstrained } = useContext(LayoutContext);
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);
  const [internalCreateModalOpen, setInternalCreateModalOpen] = useState(false);
  
  // Use external modal state if provided, otherwise use internal state
  const isCreateModalOpen = externalShowAddModal !== undefined ? externalShowAddModal : internalCreateModalOpen;
  const setIsCreateModalOpen = externalSetShowAddModal || setInternalCreateModalOpen;

  const [vendorStats, setVendorStats] = useState<Record<string, any>>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'condensed' | 'cards'>('list');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node) && showFilterMenu) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  // Only reload when user.id changes, not when user object reference changes
  useEffect(() => {
    if (user?.id && !hasLoadedData) {
      loadVendors();
    }
  }, [user?.id, hasLoadedData]);

  const loadVendors = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await VendorService.getVendors(user.id);
      setVendors(data);
      setLoading(false); // Show vendors immediately
      setHasLoadedData(true);
      
      // Load stats for each vendor in parallel (much faster)
      const statsPromises = data.map(async (vendor) => {
        try {
          const stats = await VendorService.getVendorStats(vendor.id);
          setVendorStats(prev => ({ ...prev, [vendor.id]: stats })); // Update stats incrementally
          return { vendorId: vendor.id, stats };
        } catch (error: any) {
          // Handle network errors gracefully
          let fallbackStats;
          if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
            console.warn(`Network error loading stats for vendor ${vendor.name}. Skipping stats.`);
            fallbackStats = { totalSpent: 0, projectCount: 0, isOffline: true };
          } else {
            console.error(`Error loading stats for vendor ${vendor.id}:`, error);
            fallbackStats = { totalSpent: 0, projectCount: 0, hasError: true };
          }
          setVendorStats(prev => ({ ...prev, [vendor.id]: fallbackStats }));
          return { vendorId: vendor.id, stats: fallbackStats };
        }
      });
      
      // Wait for all stats to complete in parallel
      Promise.all(statsPromises).catch(error => {
        console.error('Error loading vendor stats:', error);
      });
    } catch (error: any) {
      console.error('Error loading vendors:', error);
      // Handle network connectivity for main vendor list
      if (error.message?.includes('Failed to fetch')) {
        console.warn('Network error: Unable to load vendors. Check internet connection.');
      }
      setLoading(false);
      setHasLoadedData(true);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await VendorService.deleteVendor(vendorId);
      // Just reload vendors instead of resetting cache
      setLoading(true);
      const data = await VendorService.getVendors(user!.id);
      setVendors(data);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      setLoading(false);
    }
  };

  const forceReloadVendors = async () => {
    setHasLoadedData(false);
    await loadVendors();
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesPreferred = !showPreferredOnly || vendor.is_preferred;
    
    // Rating filter
    let matchesRating = true;
    if (selectedRatingFilter !== 'all') {
      const rating = vendor.rating || 0;
      switch (selectedRatingFilter) {
        case 'excellent':
          matchesRating = rating >= 4.5;
          break;
        case 'good':
          matchesRating = rating >= 3.5 && rating < 4.5;
          break;
        case 'fair':
          matchesRating = rating >= 2.5 && rating < 3.5;
          break;
        case 'unrated':
          matchesRating = !vendor.rating;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPreferred && matchesRating;
  });

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    vendors.forEach(vendor => {
      stats[vendor.category] = (stats[vendor.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  const resetFilters = () => {
    setSelectedCategory('all');
    setShowPreferredOnly(false);
    setSelectedRatingFilter('all');
    setSearchTerm('');
  };

  return (
    <div>
      {/* Vendors Section */}
      <div className="pb-8">
        {/* Unified Container with transparent background */}
        <div className="bg-transparent border border-[#333333] rounded-[4px]">
          {/* Stats Section */}
          <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50 rounded-t-[4px]`}>
            {isConstrained ? (
              // Compact 4-column row for constrained
                              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">SUPPLIERS</div>
                  <div className="text-base font-semibold mt-1">{vendors.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">PREFERRED</div>
                  <div className="text-base font-semibold text-yellow-400 mt-1">{vendors.filter(v => v.is_preferred).length}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">PURCHASES</div>
                  <div className="text-base font-semibold text-green-400 mt-1">
                    {formatCurrency(Object.values(vendorStats).reduce((sum, stats) => sum + (stats?.totalSpent || 0), 0))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">CATEGORIES</div>
                  <div className="text-base font-semibold mt-1">{Object.keys(getCategoryStats()).length}</div>
                </div>
              </div>
            ) : (
              // Full 4-column layout for desktop
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">SUPPLIERS</div>
                  <div className="text-lg font-semibold mt-1">{vendors.length}</div>
                  <div className="text-xs text-gray-500">material sources</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">PREFERRED</div>
                  <div className="text-lg font-semibold text-yellow-400 mt-1">{vendors.filter(v => v.is_preferred).length}</div>
                  <div className="text-xs text-gray-500">preferred accounts</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL PURCHASES</div>
                  <div className="text-lg font-semibold text-green-400 mt-1">
                    {formatCurrency(Object.values(vendorStats).reduce((sum, stats) => sum + (stats?.totalSpent || 0), 0))}
                  </div>
                  <div className="text-xs text-gray-500">materials & supplies</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">CATEGORIES</div>
                  <div className="text-lg font-semibold mt-1">{Object.keys(getCategoryStats()).length}</div>
                  <div className="text-xs text-gray-500">material types</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Section */}
          <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
            <div className="flex items-center justify-between">
              {/* Left side - Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none pr-10 min-w-[200px]"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories ({vendors.length})</option>
                    {VENDOR_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat} ({getCategoryStats()[cat] || 0})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative" ref={filterMenuRef}>
                  <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`px-3 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#333333] rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2 ${showFilterMenu ? 'bg-[#252525]' : ''}`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>{isConstrained ? '' : 'More Filters'}</span>
                  </button>
                  
                  {/* Filter Menu Dropdown */}
                  {showFilterMenu && (
                    <div className={`absolute top-full left-0 mt-1 ${isConstrained ? 'right-0 left-auto w-[280px]' : 'w-80'} bg-[#1E1E1E] border border-[#333333] rounded-[4px] shadow-lg z-50 p-3 md:p-4`}>
                      <div className="space-y-3 md:space-y-4">
                        {/* Preferred Only */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 md:mb-2">
                            Vendor Preference
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowPreferredOnly(!showPreferredOnly)}
                              className={`px-3 py-2 rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2 border ${
                                showPreferredOnly 
                                  ? 'bg-[#F9D71C] text-[#121212] border-[#F9D71C]' 
                                  : 'bg-[#333333] text-white border-[#555555] hover:bg-[#404040]'
                              }`}
                            >
                              <Star className="w-4 h-4" />
                              <span>Preferred Only</span>
                            </button>
                          </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 md:mb-2">
                            Rating
                          </label>
                          <select
                            className="w-full bg-[#333333] border border-[#555555] rounded-[4px] px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#336699]"
                            value={selectedRatingFilter}
                            onChange={(e) => setSelectedRatingFilter(e.target.value)}
                          >
                            <option value="all">All Ratings</option>
                            <option value="excellent">Excellent (4.5+ stars)</option>
                            <option value="good">Good (3.5-4.5 stars)</option>
                            <option value="fair">Fair (2.5-3.5 stars)</option>
                            <option value="unrated">Unrated</option>
                          </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="pt-2 md:pt-3 border-t border-[#333333]">
                          <button
                            onClick={() => {
                              resetFilters();
                              setShowFilterMenu(false);
                            }}
                            className="w-full bg-[#333333] hover:bg-[#404040] text-white py-1.5 md:py-2 px-2 md:px-3 rounded-[4px] text-xs md:text-sm font-medium transition-colors"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - View Toggle and Add Button */}
              <div className="flex items-center gap-3">
                <div className="flex bg-[#1E1E1E] border border-[#333333] rounded-[4px] overflow-hidden">
                  <button
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-white text-[#121212]' : 'text-gray-400 hover:bg-[#252525]'
                    }`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'condensed' ? 'bg-white text-[#121212]' : 'text-gray-400 hover:bg-[#252525]'
                    }`}
                    onClick={() => setViewMode('condensed')}
                    title="Condensed View"
                  >
                    <Rows3 className="w-4 h-4" />
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'cards' ? 'bg-white text-[#121212]' : 'text-gray-400 hover:bg-[#252525]'
                    }`}
                    onClick={() => setViewMode('cards')}
                    title="Cards View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                
                                  {!hideAddButton && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-[8px] text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Vendor</span>
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Vendors Content */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div>
                {viewMode === 'list' || viewMode === 'condensed' ? (
                  <TableSkeleton rows={5} columns={5} />
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                )}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No vendors found</p>
              </div>
            ) : viewMode === 'list' || viewMode === 'condensed' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[35%]" />
                    <col className="w-[30%]" />
                  </colgroup>
                  <thead className="bg-[#1E1E1E]">
                    <tr>
                      {viewMode === 'condensed' ? (
                        <>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Purchases</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Purchases</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {filteredVendors.map((vendor) => {
                      const stats = vendorStats[vendor.id];
                      return (
                        <tr 
                          key={vendor.id} 
                          className="hover:bg-[#1E1E1E] transition-colors"
                        >
                          {viewMode === 'condensed' ? (
                            <>
                              <td className="px-3 py-2">
                                <div 
                                  className="text-xs font-medium text-white hover:text-blue-400 cursor-pointer"
                                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                                >
                                  {vendor.name}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs text-gray-300">{vendor.phone}</div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-xs font-semibold text-green-400">
                                  {formatCurrency(stats?.totalSpent || 0)}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingVendor(vendor);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                                >
                                  Edit
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center min-w-0">
                                  <div className="min-w-0 flex-1">
                                    <div 
                                      className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer flex items-center gap-2 min-w-0"
                                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                                    >
                                      <span className="truncate">{vendor.name}</span>
                                      {vendor.is_preferred && <Star className="w-4 h-4 text-[#F9D71C] fill-current flex-shrink-0" />}
                                    </div>
                                    <div className="text-xs text-[#F9D71C] truncate">{vendor.category}</div>
                                    <div className="text-xs text-gray-400 truncate">Material Supplier</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-300 whitespace-nowrap">{vendor.phone}</div>
                                <div className="text-xs text-blue-400 truncate">{vendor.email}</div>
                                <div className="text-xs text-gray-400 whitespace-nowrap mt-1">
                                  Account Active
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-green-400 whitespace-nowrap">
                                  {formatCurrency(stats?.totalSpent || 0)}
                                  {stats?.isOffline && <span className="ml-1 text-orange-400">*</span>}
                                </div>
                                <div className="text-xs text-gray-400 whitespace-nowrap">
                                  {stats?.projectCount || 0} orders
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingVendor(vendor);
                                  }}
                                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                  Edit
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map(vendor => {
                  const stats = vendorStats[vendor.id];
                  return (
                    <div
                      key={vendor.id}
                      className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] p-4 hover:bg-[#252525] transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-white text-sm flex items-center gap-2 mb-1 hover:text-blue-400 cursor-pointer"
                            onClick={() => navigate(`/vendors/${vendor.id}`)}
                          >
                            {vendor.name}
                            {vendor.is_preferred && (
                              <Star className="w-4 h-4 text-[#F9D71C] fill-current" />
                            )}
                          </h3>
                          <p className="text-xs text-[#F9D71C]">{vendor.category}</p>
                          {vendor.specialty && (
                            <p className="text-xs text-gray-400">{vendor.specialty}</p>
                          )}
                        </div>
                        <div className="flex items-start gap-2">
                          {vendor.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < vendor.rating! 
                                      ? 'text-[#F9D71C] fill-current' 
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingVendor(vendor);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded-md border border-blue-400/30 hover:border-blue-300/50 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-3">
                        {vendor.contact_name && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Info className="w-3 h-3 text-gray-400" />
                            <span>{vendor.contact_name}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.address && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate">{vendor.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      {stats && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#333333]">
                          <div className="bg-[#121212] rounded-[4px] p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Spent</div>
                            <div className="text-sm font-semibold text-green-400">
                              {formatCurrency(stats.totalSpent)}
                              {stats.isOffline && <span className="ml-1 text-orange-400">*</span>}
                            </div>
                          </div>
                          <div className="bg-[#121212] rounded-[4px] p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Projects</div>
                            <div className="text-sm font-semibold text-blue-400">
                              {stats.projectCount}
                              {stats.isOffline && <span className="ml-1 text-orange-400">*</span>}
                            </div>
                          </div>
                          {(stats.isOffline || stats.hasError) && (
                            <div className="col-span-2 text-xs text-orange-400 flex items-center gap-1 mt-1">
                              <Info className="w-3 h-3" />
                              <span>{stats.isOffline ? 'Stats unavailable (offline)' : 'Stats error'}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex items-center gap-2 mt-3">
                        {vendor.license_number && (
                          <div className="flex items-center gap-1 text-xs bg-[#333333] px-2 py-1 rounded">
                            <Shield className="w-3 h-3" />
                            <span>Licensed</span>
                          </div>
                        )}
                        {vendor.insurance_info && (
                          <div className="flex items-center gap-1 text-xs bg-[#333333] px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            <span>Insured</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateVendorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onVendorCreated={forceReloadVendors}
        />
      )}

      {/* Edit Vendor Drawer */}
      <EditVendorDrawer
        vendor={editingVendor}
        onClose={() => setEditingVendor(null)}
        onSuccess={() => {
          forceReloadVendors();
          setEditingVendor(null);
        }}
        onDelete={(vendorId) => {
          setVendors(vendors.filter(v => v.id !== vendorId));
          setEditingVendor(null);
        }}
      />

    </div>
  );
}; 