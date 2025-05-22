import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PackageList } from './PackageList';
import { NewPackageModal } from '../modals/NewPackageModal';
import TabMenu from '../common/TabMenu';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/database';

export const PackagesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [packageCounts, setPackageCounts] = useState({
    all: 0,
    service: 0,
    product: 0,
    custom: 0
  });
  
  // Filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchPackageCounts();
    }
  }, [user]);
  
  const fetchPackageCounts = async () => {
    if (!user) return;
    try {
      const packages = await db.invoice_templates.list(user.id);
      
      // Count packages by type
      const counts = {
        all: packages.length,
        service: packages.filter(pkg => pkg.type === 'service').length,
        product: packages.filter(pkg => pkg.type === 'product').length,
        custom: packages.filter(pkg => pkg.type === 'custom').length
      };
      
      setPackageCounts(counts);
    } catch (error) {
      console.error('Error fetching package counts:', error);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Packages"
        hideTitle={true}
      />
      
      {showFilter && (
        <div className="p-4 bg-[#1E2130] border border-gray-800 rounded-lg mx-4 mt-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Filter Packages</h3>
            <button 
              onClick={() => setShowFilter(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white pr-10"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
              <div className="grid grid-cols-5 gap-2 items-center">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="col-span-2 w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <div className="text-center text-gray-500">to</div>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="col-span-2 w-full bg-[#232635] border border-gray-700 rounded-lg px-3 py-2 text-white"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-700 rounded-full hover:bg-gray-800"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilter(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <TabMenu
          items={[
            { id: 'all', label: 'All', count: packageCounts.all },
            { id: 'service', label: 'Service', count: packageCounts.service },
            { id: 'product', label: 'Product', count: packageCounts.product },
            { id: 'custom', label: 'Custom', count: packageCounts.custom }
          ]}
          activeItemId={activeTab}
          onItemClick={setActiveTab}
        />
        <div className="mt-6">
          <PackageList 
            searchTerm={searchTerm} 
            packageType={activeTab === 'all' ? undefined : activeTab}
            minPrice={minPrice ? parseFloat(minPrice) : undefined}
            maxPrice={maxPrice ? parseFloat(maxPrice) : undefined}
            status={selectedStatus === 'all' ? undefined : selectedStatus}
          />
        </div>
      </div>
      
      {/* Modals */}
      {showNewModal && (
        <NewPackageModal
          onClose={() => setShowNewModal(false)}
          onSave={() => {
            setShowNewModal(false);
            // The PackageList component will handle fetching updated data
          }}
        />
      )}
    </DashboardLayout>
  );
};
