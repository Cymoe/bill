import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { ClientList } from '../components/clients/ClientList';
import { VendorsList } from '../components/vendors/VendorsList';
import { SubcontractorsList } from '../components/subcontractors/SubcontractorsList';
import { TeamMembersList } from '../components/team/TeamMembersList';
import { VendorService } from '../services/vendorService';
import { SubcontractorService } from '../services/subcontractorService';
import { TeamMemberService } from '../services/TeamMemberService';
import { useAuth } from '../contexts/AuthContext';
import { useContext } from 'react';
import { OrganizationContext } from '../components/layouts/DashboardLayout';
import { supabase } from '../lib/supabase';


type PersonType = 'clients' | 'vendors' | 'subcontractors' | 'team';

export const People: React.FC = () => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [activeTab, setActiveTab] = useState<PersonType>('clients');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ensure body overflow is reset when component mounts/unmounts
  useEffect(() => {
    // Reset any stuck overflow hidden
    document.body.style.overflow = 'unset';
    document.body.classList.remove('modal-open');
    
    // Also check for any stuck modal backdrops
    const stuckBackdrops = document.querySelectorAll('.fixed.inset-0');
    stuckBackdrops.forEach(backdrop => {
      if (!backdrop.closest('[data-modal-active="true"]')) {
        backdrop.remove();
      }
    });
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, []);
  
  // Dynamic counts loaded from database
  const [tabCounts, setTabCounts] = useState({
    clients: 0,
    vendors: 0,
    subcontractors: 0,
    team: 0
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Load actual counts from database
  useEffect(() => {
    const loadCounts = async () => {
      if (!user?.id || !selectedOrg?.id) return;
      
      try {
        console.log('🔧 Loading all tab counts...');
        
        // Load all counts in parallel
        const [clientsRes, vendors, subcontractors, teamMembers] = await Promise.all([
          supabase
            .from('clients')
            .select('id')
            .eq('organization_id', selectedOrg.id),
          VendorService.getVendors(selectedOrg.id),
          SubcontractorService.getSubcontractors(selectedOrg.id),
          TeamMemberService.getTeamMembers(selectedOrg.id)
        ]);
        
        const clientsCount = clientsRes.data?.length || 0;
        
        setTabCounts({
          clients: clientsCount,
          vendors: vendors.length,
          subcontractors: subcontractors.length,
          team: teamMembers.length
        });

        console.log('🔧 All tab counts loaded:', {
          clients: clientsCount,
          vendors: vendors.length,
          subcontractors: subcontractors.length,
          team: teamMembers.length
        });
      } catch (error) {
        console.error('🔧 Error loading counts:', error);
      }
    };

    loadCounts();
  }, [user?.id, selectedOrg?.id]);

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'clients': return 'Add Client';
      case 'vendors': return 'Add Vendor';
      case 'subcontractors': return 'Add Sub';
      case 'team': return 'Add Member';
      default: return 'Add';
    }
  };

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Single Unified Card */}
      <div className="border border-[#333333]">
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between bg-transparent">
          <h1 className="text-xl font-semibold text-white">People</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-transparent border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-[300px]"
              />
            </div>
            <button
              onClick={handleAddClick}
              className="bg-white hover:bg-gray-100 text-black px-5 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 w-[150px] justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>{getAddButtonText()}</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-[#333333] flex">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'clients'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            Clients
            <span className="text-xs opacity-70">({tabCounts.clients})</span>
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'vendors'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            Vendors
            <span className="text-xs opacity-70">({tabCounts.vendors})</span>
          </button>
          <button
            onClick={() => setActiveTab('subcontractors')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'subcontractors'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            Subs
            <span className="text-xs opacity-70">({tabCounts.subcontractors})</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'team'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            Team
            <span className="text-xs opacity-70">({tabCounts.team})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="border-t border-[#333333]">
          {activeTab === 'clients' && (
            <ClientList 
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              hideAddButton={true}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === 'vendors' && (
            <VendorsList 
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              hideAddButton={true}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === 'subcontractors' && (
            <SubcontractorsList 
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              hideAddButton={true}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === 'team' && (
            <TeamMembersList 
              showAddModal={showAddModal}
              setShowAddModal={setShowAddModal}
              hideAddButton={true}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>
      
      {/* Test button for development */}

    </div>
  );
}; 