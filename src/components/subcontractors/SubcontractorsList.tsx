import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HardHat, Phone, Mail, MapPin, Star, Heart,
  Plus, Search, Filter, Edit2, Trash2, 
  Shield, CheckCircle, ChevronDown, Award, List, LayoutGrid, Rows3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { SubcontractorService, type Subcontractor as SubcontractorType, TRADE_CATEGORIES as SERVICE_TRADE_CATEGORIES } from '../../services/subcontractorService';
import { EditSubcontractorDrawer } from './EditSubcontractorDrawer';
import { CreateSubcontractorModal } from './CreateSubcontractorModal';

// Use the service types and constants
type Subcontractor = SubcontractorType;
const TRADE_CATEGORIES = SERVICE_TRADE_CATEGORIES;

interface SubcontractorsListProps {
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  hideAddButton?: boolean;
}

export const SubcontractorsList: React.FC<SubcontractorsListProps> = ({ 
  showAddModal: externalShowAddModal, 
  setShowAddModal: externalSetShowAddModal, 
  hideAddButton = false 
}) => {
  const { user } = useAuth();
  const { isConstrained } = useContext(LayoutContext);
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'condensed' | 'cards'>('list');
  const [internalShowNewModal, setInternalShowNewModal] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('all');
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  
  // Use external modal state if provided, otherwise use internal state
  const showNewModal = externalShowAddModal !== undefined ? externalShowAddModal : internalShowNewModal;
  const setShowNewModal = externalSetShowAddModal || setInternalShowNewModal;

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

  // Load subcontractors from database
  const loadSubcontractors = async () => {
    // Use org ID with fallback to known good ID
    const orgId = selectedOrg?.id || '264f2bfa-3073-41ca-81cc-d7b795507522';
    
    try {
      setLoading(true);
      const data = await SubcontractorService.getSubcontractors(orgId);
      
      // Load stats for each subcontractor
      const subcontractorsWithStats = await Promise.all(
        data.map(async (sub) => {
          try {
            const stats = await SubcontractorService.getSubcontractorStats(sub.id);
            return {
              ...sub,
              totalValue: stats.totalValue,
              projectCount: stats.projectCount,
              lastProjectDate: stats.lastProjectDate
            };
          } catch (error) {
            console.error(`Error loading stats for subcontractor ${sub.id}:`, error);
            return {
              ...sub,
              totalValue: 0,
              projectCount: 0
            };
          }
        })
      );
      
      setSubcontractors(subcontractorsWithStats);
    } catch (error) {
      console.error('Error loading subcontractors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubcontractors();
  }, [selectedOrg?.id]);

  const filteredSubcontractors = subcontractors.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sub.trade_category === selectedCategory;
    const matchesPreferred = !showPreferredOnly || sub.is_preferred;
    
    // Rating filter
    let matchesRating = true;
    if (selectedRatingFilter !== 'all') {
      const rating = sub.rating || 0;
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
          matchesRating = !sub.rating;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPreferred && matchesRating;
  });

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    subcontractors.forEach(sub => {
      stats[sub.trade_category] = (stats[sub.trade_category] || 0) + 1;
    });
    return stats;
  };

  // Calculate metrics
  const preferredCount = subcontractors.filter(s => s.is_preferred).length;
  const averageRating = subcontractors.length > 0 ? 
    subcontractors.reduce((sum, s) => sum + (s.rating || 0), 0) / subcontractors.length : 0;
  const totalSpent = subcontractors.reduce((sum, s) => sum + (s.totalValue || 0), 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setShowPreferredOnly(false);
    setSelectedRatingFilter('all');
    setSearchTerm('');
  };

  console.log('🔧 SubcontractorsList render - editingSubcontractor:', editingSubcontractor);

  return (
    <div>
      {loading ? (
        <div className="pb-8">
          <div className="bg-transparent border border-[#333333] rounded-[4px]">
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
        </div>
      ) : subcontractors.length === 0 ? (
        // Onboarding/Empty State
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F9D71C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HardHat className="w-8 h-8 text-[#F9D71C]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Subcontractor Management</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Track your trusted subcontractors, their specialties, certifications, and project history.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#F9D71C]">
                <h3 className="text-white font-bold mb-2">Track Specialties</h3>
                <p className="text-gray-400 text-sm">
                  Organize subs by trade (electrical, plumbing, HVAC, etc.)
                </p>
              </div>
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#336699]">
                <h3 className="text-white font-bold mb-2">Verify Credentials</h3>
                <p className="text-gray-400 text-sm">
                  Store licenses, insurance, and certification info
                </p>
              </div>
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#388E3C]">
                <h3 className="text-white font-bold mb-2">Rate Performance</h3>
                <p className="text-gray-400 text-sm">
                  Track reliability, quality, and project completion rates
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowNewModal(true)}
              className="px-6 py-3 bg-[#F9D71C] text-[#121212] rounded-[4px] font-medium hover:bg-[#F9D71C]/80 transition-colors"
            >
              ADD FIRST SUBCONTRACTOR
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Subcontractors Section */}
          <div className="pb-8">
            {/* Unified Container */}
            <div className="bg-transparent border border-[#333333] rounded-[4px]">
              {/* Stats Section */}
              <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50 rounded-t-[4px]`}>
                {isConstrained ? (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">TRADES</div>
                      <div className="text-base font-semibold mt-1">{subcontractors.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">PREFERRED</div>
                      <div className="text-base font-semibold text-yellow-400 mt-1">{preferredCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">AVG RATING</div>
                      <div className="text-base font-semibold text-blue-400 mt-1">{averageRating.toFixed(1)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">LABOR</div>
                      <div className="text-base font-semibold text-green-400 mt-1">{formatCurrency(totalSpent)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">TRADE PARTNERS</div>
                      <div className="text-lg font-semibold mt-1">{subcontractors.length}</div>
                      <div className="text-xs text-gray-500">active contractors</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">PREFERRED</div>
                      <div className="text-lg font-semibold text-yellow-400 mt-1">{preferredCount}</div>
                      <div className="text-xs text-gray-500">trusted trades</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">AVERAGE RATING</div>
                      <div className="text-lg font-semibold text-blue-400 mt-1">{averageRating.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">work quality</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">LABOR COSTS</div>
                      <div className="text-lg font-semibold text-green-400 mt-1">{formatCurrency(totalSpent)}</div>
                      <div className="text-xs text-gray-500">total paid</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls Section */}
              <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none pr-10 min-w-[200px]"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">All Trades ({subcontractors.length})</option>
                        {TRADE_CATEGORIES.map(cat => (
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
                                Subcontractor Preference
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setShowPreferredOnly(!showPreferredOnly)}
                                  className={`px-3 py-2 rounded-[4px] text-sm font-medium transition-colors flex items-center gap-2 border ${
                                    showPreferredOnly 
                                      ? 'bg-[#D32F2F] text-white border-[#D32F2F]' 
                                      : 'bg-[#333333] text-white border-[#555555] hover:bg-[#404040]'
                                  }`}
                                >
                                  <Heart className="w-4 h-4" />
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
                          onClick={() => setShowNewModal(true)}
                          className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-[8px] text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Subcontractor</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {viewMode === 'list' || viewMode === 'condensed' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-[#1E1E1E]">
                        <tr>
                          {viewMode === 'condensed' ? (
                            <>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trade</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rate</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projects</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trade Partner</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Specialty & Certs</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projects</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333333]">
                        {filteredSubcontractors.map((sub) => (
                          <tr 
                            key={sub.id} 
                            className={`hover:bg-[#1E1E1E] transition-colors ${sub.is_preferred ? 'bg-[#D32F2F]/5 border-l-2 border-[#D32F2F]' : ''}`}
                          >
                            {viewMode === 'condensed' ? (
                              <>
                                <td className="px-3 py-2">
                                  <div 
                                    className="text-xs font-medium text-white hover:text-blue-400 cursor-pointer"
                                    onClick={() => navigate(`/subcontractors/${sub.id}`)}
                                  >
                                    {sub.name}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs text-[#F9D71C] font-medium">{sub.trade_category}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs font-semibold text-green-400">
                                    ${sub.hourly_rate}/hr
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < (sub.rating || 0) 
                                            ? 'text-[#F9D71C] fill-current' 
                                            : 'text-gray-600'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs font-semibold text-blue-400">
                                    {sub.projectCount || 0}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('🔧 Edit button clicked (condensed view) for subcontractor:', sub.name, sub.id);
                                      setEditingSubcontractor(sub);
                                      console.log('🔧 editingSubcontractor set to:', sub);
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
                                  <div className="flex items-center gap-2">
                                    <div>
                                      <div 
                                        className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer"
                                        onClick={() => navigate(`/subcontractors/${sub.id}`)}
                                      >
                                        {sub.name}
                                      </div>
                                      <div className="text-xs text-gray-400">{sub.company_name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-[#F9D71C] font-medium">{sub.trade_category}</div>
                                  <div className="text-xs text-gray-400">{sub.specialty}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-green-400">
                                    ${sub.hourly_rate}/hr
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < (sub.rating || 0) 
                                            ? 'text-[#F9D71C] fill-current' 
                                            : 'text-gray-600'
                                        }`}
                                      />
                                    ))}
                                    <span className="text-sm text-gray-400 ml-1">({sub.rating || 0})</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-blue-400">
                                    {sub.projectCount || 0}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('🔧 Edit button clicked for subcontractor:', sub.name, sub.id);
                                      setEditingSubcontractor(sub);
                                      console.log('🔧 editingSubcontractor set to:', sub);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredSubcontractors.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">No subcontractors match your filters</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubcontractors.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] p-4 hover:bg-[#252525] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 
                              className="text-sm font-semibold text-white flex items-center gap-2 mb-1 hover:text-blue-400 cursor-pointer"
                              onClick={() => navigate(`/subcontractors/${sub.id}`)}
                            >
                              {sub.name}
                              {sub.is_preferred && <Heart className="w-4 h-4 text-[#D32F2F] fill-current" />}
                            </h3>
                            <p className="text-xs text-gray-400">{sub.company_name}</p>
                            <p className="text-xs text-[#F9D71C]">{sub.trade_category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < (sub.rating || 0) 
                                      ? 'text-[#F9D71C] fill-current' 
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('🔧 Edit button clicked (card view) for subcontractor:', sub.name, sub.id);
                                setEditingSubcontractor(sub);
                                console.log('🔧 editingSubcontractor set to:', sub);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded-md border border-blue-400/30 hover:border-blue-300/50 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="text-xs text-gray-400">{sub.specialty}</div>
                          <div className="text-xs text-gray-300">{sub.phone}</div>
                          <div className="text-xs text-blue-400">{sub.email}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#121212] rounded-[4px] p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Rate</div>
                            <div className="text-sm font-semibold text-green-400">
                              ${sub.hourly_rate}/hr
                            </div>
                          </div>
                          <div className="bg-[#121212] rounded-[4px] p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Projects</div>
                            <div className="text-sm font-semibold text-blue-400">
                              {sub.projectCount || 0}
                            </div>
                          </div>
                        </div>

                        {(sub.license_number || sub.insurance_info) && (
                          <div className="flex items-center gap-2 mt-3">
                            {sub.license_number && (
                              <div className="flex items-center gap-1 text-xs bg-[#333333] px-2 py-1 rounded">
                                <Shield className="w-3 h-3" />
                                <span>Licensed</span>
                              </div>
                            )}
                            {sub.insurance_info && (
                              <div className="flex items-center gap-1 text-xs bg-[#333333] px-2 py-1 rounded">
                                <CheckCircle className="w-3 h-3" />
                                <span>Insured</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredSubcontractors.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-400">No subcontractors match your filters</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Subcontractor Drawer */}
      <EditSubcontractorDrawer
        subcontractor={editingSubcontractor}
        onClose={() => {
          console.log('🔧 EditSubcontractorDrawer onClose called');
          setEditingSubcontractor(null);
        }}
        onSuccess={() => {
          console.log('🔧 EditSubcontractorDrawer onSuccess called');
          loadSubcontractors();
          setEditingSubcontractor(null);
        }}
        onDelete={(subcontractorId) => {
          console.log('🔧 EditSubcontractorDrawer onDelete called for:', subcontractorId);
          setSubcontractors(subcontractors.filter(s => s.id !== subcontractorId));
          setEditingSubcontractor(null);
        }}
      />

      {/* Create Subcontractor Modal */}
      <CreateSubcontractorModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubcontractorCreated={() => {
          loadSubcontractors();
          setShowNewModal(false);
        }}
      />
    </div>
  );
}; 