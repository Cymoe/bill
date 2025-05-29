import React, { useState } from 'react';
import { Users, Building, HardHat, UserCheck } from 'lucide-react';
import { ClientList } from '../components/clients/ClientList';
import { VendorsList } from '../components/vendors/VendorsList';

type PersonType = 'clients' | 'vendors' | 'subcontractors' | 'team';

export const People: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PersonType>('clients');

  const tabs = [
    { id: 'clients' as PersonType, label: 'Clients', icon: Users, count: 0 },
    { id: 'vendors' as PersonType, label: 'Vendors', icon: Building, count: 0 },
    { id: 'subcontractors' as PersonType, label: 'Subcontractors', icon: HardHat, count: 0 },
    { id: 'team' as PersonType, label: 'Team Members', icon: UserCheck, count: 0 }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="bg-background-medium border-b border-white/10">
        <div className="px-6 pt-6 pb-0">
          <h1 className="text-2xl font-bold text-white mb-2">PEOPLE</h1>
          <p className="text-white/60 mb-6">Manage all your business relationships in one place</p>
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-steel-blue text-white bg-white/5'
                      : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium uppercase text-sm">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                      activeTab === tab.id ? 'bg-steel-blue text-white' : 'bg-white/10 text-white/60'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'clients' && <ClientList />}
        {activeTab === 'vendors' && <VendorsList />}
        {activeTab === 'subcontractors' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Subcontractors Placeholder */}
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-equipment-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HardHat className="w-8 h-8 text-equipment-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Subcontractor Management</h2>
                <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                  Track your trusted subcontractors, their specialties, certifications, and project history.
                </p>
                
                {/* Quick Start */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-concrete-gray rounded p-6 border-l-4 border-equipment-yellow">
                    <h3 className="text-white font-bold mb-2">Track Specialties</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Organize subs by trade (electrical, plumbing, HVAC, etc.)
                    </p>
                  </div>
                  <div className="bg-concrete-gray rounded p-6 border-l-4 border-steel-blue">
                    <h3 className="text-white font-bold mb-2">Verify Credentials</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Store licenses, insurance, and certification info
                    </p>
                  </div>
                  <div className="bg-concrete-gray rounded p-6 border-l-4 border-success-green">
                    <h3 className="text-white font-bold mb-2">Rate Performance</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Track reliability, quality, and project completion rates
                    </p>
                  </div>
                </div>

                <button className="px-6 py-3 bg-equipment-yellow text-carbon-black rounded font-medium hover:bg-equipment-yellow/80 transition-colors">
                  ADD FIRST SUBCONTRACTOR
                </button>
                
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    Already have a list of subcontractors?
                  </p>
                  <button className="text-steel-blue hover:text-white transition-colors font-medium text-sm mt-2">
                    IMPORT FROM CSV →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'team' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Team Members Placeholder */}
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-steel-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-steel-blue" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Team Management</h2>
                <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                  Add and manage your internal team members, assign roles, and track permissions.
                </p>
                
                {/* Quick Start */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-concrete-gray rounded p-6 border-l-4 border-steel-blue">
                    <h3 className="text-white font-bold mb-2">Add Team Members</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Invite employees and contractors to collaborate
                    </p>
                  </div>
                  <div className="bg-concrete-gray rounded p-6 border-l-4 border-equipment-yellow">
                    <h3 className="text-white font-bold mb-2">Set Permissions</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Control what each team member can access
                    </p>
                  </div>
                  <div className="bg-concrete-gray rounded p-6 border-l-4 border-success-green">
                    <h3 className="text-white font-bold mb-2">Track Activity</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Monitor team performance and productivity
                    </p>
                  </div>
                </div>

                <button className="px-6 py-3 bg-steel-blue text-white rounded font-medium hover:bg-steel-blue/80 transition-colors">
                  ADD FIRST TEAM MEMBER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 