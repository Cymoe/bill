import React, { useState, useEffect } from 'react';
import { 
  Building, Phone, Mail, Globe, Star, 
  Plus, Search, Filter, Edit2, Trash2, 
  MapPin, Shield, CreditCard, ChevronRight,
  CheckCircle, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { VendorService, Vendor, VENDOR_CATEGORIES } from '../../services/vendorService';
import { formatCurrency } from '../../utils/format';
import { CreateVendorModal } from './CreateVendorModal';
import { VendorDetailModal } from './VendorDetailModal';

export const VendorsList: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorStats, setVendorStats] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      loadVendors();
    }
  }, [user]);

  const loadVendors = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await VendorService.getVendors(user.id);
      setVendors(data);
      
      // Load stats for each vendor
      const stats: Record<string, any> = {};
      for (const vendor of data) {
        try {
          stats[vendor.id] = await VendorService.getVendorStats(vendor.id);
        } catch (error) {
          console.error(`Error loading stats for vendor ${vendor.id}:`, error);
        }
      }
      setVendorStats(stats);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await VendorService.deleteVendor(vendorId);
      await loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesPreferred = !showPreferredOnly || vendor.is_preferred;
    
    return matchesSearch && matchesCategory && matchesPreferred;
  });

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    vendors.forEach(vendor => {
      stats[vendor.category] = (stats[vendor.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">VENDOR MANAGEMENT</h1>
        <p className="text-white/60">Track preferred vendors and their contact information</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-concrete-gray p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm uppercase">Total Vendors</p>
              <p className="text-2xl font-bold text-white">{vendors.length}</p>
            </div>
            <Building className="w-8 h-8 text-steel-blue" />
          </div>
        </div>
        <div className="bg-concrete-gray p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm uppercase">Preferred</p>
              <p className="text-2xl font-bold text-white">
                {vendors.filter(v => v.is_preferred).length}
              </p>
            </div>
            <Star className="w-8 h-8 text-equipment-yellow" />
          </div>
        </div>
        <div className="bg-concrete-gray p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm uppercase">Total Spent</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  Object.values(vendorStats).reduce((sum, stats) => sum + (stats?.totalSpent || 0), 0)
                )}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-success-green" />
          </div>
        </div>
        <div className="bg-concrete-gray p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm uppercase">Categories</p>
              <p className="text-2xl font-bold text-white">{Object.keys(categoryStats).length}</p>
            </div>
            <Filter className="w-8 h-8 text-blueprint-blue" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
        >
          <option value="all">All Categories</option>
          {VENDOR_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({categoryStats[cat] || 0})
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowPreferredOnly(!showPreferredOnly)}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            showPreferredOnly 
              ? 'bg-equipment-yellow text-carbon-black' 
              : 'bg-concrete-gray text-white'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Preferred Only</span>
        </button>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-steel-blue text-white rounded flex items-center gap-2 hover:bg-steel-blue/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ADD VENDOR</span>
        </button>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-steel-blue"></div>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map(vendor => {
            const stats = vendorStats[vendor.id];
            return (
              <div
                key={vendor.id}
                className="bg-concrete-gray rounded border-l-4 border-steel-blue overflow-hidden cursor-pointer hover:bg-concrete-gray/80 transition-colors"
                onClick={() => setSelectedVendor(vendor)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        {vendor.name}
                        {vendor.is_preferred && (
                          <Star className="w-4 h-4 text-equipment-yellow fill-current" />
                        )}
                      </h3>
                      <p className="text-sm text-equipment-yellow">{vendor.category}</p>
                      {vendor.specialty && (
                        <p className="text-sm text-white/60">{vendor.specialty}</p>
                      )}
                    </div>
                    {vendor.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < vendor.rating! 
                                ? 'text-equipment-yellow fill-current' 
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-3">
                    {vendor.contact_name && (
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Info className="w-4 h-4 text-white/60" />
                        <span>{vendor.contact_name}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Phone className="w-4 h-4 text-white/60" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <Mail className="w-4 h-4 text-white/60" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <MapPin className="w-4 h-4 text-white/60" />
                        <span className="truncate">{vendor.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {stats && (
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-xs text-white/60 uppercase">Total Spent</p>
                        <p className="font-mono text-sm text-white">
                          {formatCurrency(stats.totalSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 uppercase">Projects</p>
                        <p className="font-mono text-sm text-white">{stats.projectCount}</p>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-3">
                    {vendor.license_number && (
                      <div className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded">
                        <Shield className="w-3 h-3" />
                        <span>Licensed</span>
                      </div>
                    )}
                    {vendor.insurance_info && (
                      <div className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        <span>Insured</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 p-3 bg-black/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVendor(vendor);
                    }}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVendor(vendor.id);
                    }}
                    className="p-2 text-white/60 hover:text-warning-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateVendorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onVendorCreated={loadVendors}
        />
      )}

      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          stats={vendorStats[selectedVendor.id]}
          isOpen={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onVendorUpdated={loadVendors}
        />
      )}
    </div>
  );
}; 