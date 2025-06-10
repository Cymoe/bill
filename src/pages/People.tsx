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
  
  // Dynamic counts loaded from database
  const [tabCounts, setTabCounts] = useState({
    clients: 0,
    vendors: 0,
    subcontractors: 0,
    team: 0
  });

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
          VendorService.getVendors(user.id),
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
      {/* Header Section */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">People</h1>
          <p className="text-gray-400 mt-1">Manage all your business relationships in one place</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddClick}
            className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-[8px] text-sm font-medium transition-colors flex items-center gap-2 w-[140px] justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>{getAddButtonText()}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation - Matching ProjectDetails */}
      <div className="flex justify-between mb-0 border-b border-[#2a2a2a]">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'clients'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Clients
          <span className="text-xs text-gray-500">{tabCounts.clients}</span>
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'vendors'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Vendors
          <span className="text-xs text-gray-500">{tabCounts.vendors}</span>
        </button>
        <button
          onClick={() => setActiveTab('subcontractors')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'subcontractors'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Subs
          <span className="text-xs text-gray-500">{tabCounts.subcontractors}</span>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'team'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Team
          <span className="text-xs text-gray-500">{tabCounts.team}</span>
        </button>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'clients' && (
          <ClientList 
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            hideAddButton={true}
          />
        )}
        {activeTab === 'vendors' && (
          <VendorsList 
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            hideAddButton={true}
          />
        )}
        {activeTab === 'subcontractors' && (
          <SubcontractorsList 
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            hideAddButton={true}
          />
        )}
        {activeTab === 'team' && (
          <TeamMembersList 
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            hideAddButton={true}
          />
        )}
      </div>
    </div>
  );
}; 