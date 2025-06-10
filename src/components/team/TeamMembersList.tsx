import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, Phone, Mail, Calendar, Users, 
  Plus, Search, Filter, Edit2, Trash2, 
  Shield, CheckCircle, ChevronDown, Settings, List, LayoutGrid, Rows3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { TableSkeleton } from '../skeletons/TableSkeleton';
import { CardSkeleton } from '../skeletons/CardSkeleton';
import { TeamMemberService, TeamMember, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../services/TeamMemberService';
import { CreateTeamMemberModal } from './CreateTeamMemberModal';
import { EditTeamMemberDrawer } from './EditTeamMemberDrawer';

interface TeamMembersListProps {
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
  hideAddButton?: boolean;
}

export const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  showAddModal: externalShowAddModal, 
  setShowAddModal: externalSetShowAddModal, 
  hideAddButton = false 
}) => {
  const { user } = useAuth();
  const { isConstrained } = useContext(LayoutContext);
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'condensed' | 'cards'>('list');
  const [internalShowNewModal, setInternalShowNewModal] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  
  // Use external modal state if provided, otherwise use internal state
  const showNewModal = externalShowAddModal !== undefined ? externalShowAddModal : internalShowNewModal;
  const setShowNewModal = externalSetShowAddModal || setInternalShowNewModal;

  // Load team members data from database
  useEffect(() => {
    if (selectedOrg?.id) {
      loadTeamMembers();
    } else {
      setTeamMembers([]);
      setLoading(false);
    }
  }, [selectedOrg?.id]);

  const loadTeamMembers = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      setLoading(true);
      console.log('🔧 Loading team members for organization:', selectedOrg.id);
      const members = await TeamMemberService.getTeamMembers(selectedOrg.id);
      console.log('🔧 Loaded team members:', members.length);
      setTeamMembers(members);
    } catch (error) {
      console.error('🔧 Error loading team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.job_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getDepartmentStats = () => {
    const stats: Record<string, number> = {};
    teamMembers.forEach(member => {
      stats[member.department] = (stats[member.department] || 0) + 1;
    });
    return stats;
  };

  // Calculate metrics
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const fullTimeMembers = teamMembers.filter(m => m.employment_type === 'full-time').length;
  const totalProjects = teamMembers.reduce((sum, m) => sum + (m.projectsAssigned || 0), 0);
  const totalHours = teamMembers.reduce((sum, m) => sum + (m.hoursThisMonth || 0), 0);

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'inactive': return 'text-gray-400 bg-gray-400/10';
      case 'on-leave': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

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
      ) : teamMembers.length === 0 ? (
        // Onboarding/Empty State
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#336699]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-[#336699]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Team Management</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Add and manage your internal team members, assign roles, and track permissions.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#336699]">
                <h3 className="text-white font-bold mb-2">Add Team Members</h3>
                <p className="text-gray-400 text-sm">
                  Invite employees and contractors to collaborate
                </p>
              </div>
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#F9D71C]">
                <h3 className="text-white font-bold mb-2">Set Permissions</h3>
                <p className="text-gray-400 text-sm">
                  Control what each team member can access
                </p>
              </div>
              <div className="bg-[#333333] rounded-[4px] p-6 border-l-4 border-[#388E3C]">
                <h3 className="text-white font-bold mb-2">Track Activity</h3>
                <p className="text-gray-400 text-sm">
                  Monitor team performance and productivity
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowNewModal(true)}
              className="px-6 py-3 bg-white text-black rounded-[8px] font-medium hover:bg-gray-100 transition-colors"
            >
              ADD FIRST TEAM MEMBER
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Team Members Section */}
          <div className="pb-8">
            {/* Unified Container */}
            <div className="bg-transparent border border-[#333333] rounded-[4px]">
              {/* Stats Section */}
              <div className={`${isConstrained ? 'px-4 py-3' : 'px-6 py-4'} border-b border-[#333333]/50 rounded-t-[4px]`}>
                {isConstrained ? (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL</div>
                      <div className="text-base font-semibold mt-1">{teamMembers.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">ACTIVE</div>
                      <div className="text-base font-semibold text-green-400 mt-1">{activeMembers}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">PROJECTS</div>
                      <div className="text-base font-semibold text-blue-400 mt-1">{totalProjects}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">HOURS</div>
                      <div className="text-base font-semibold text-yellow-400 mt-1">{totalHours}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">TOTAL TEAM</div>
                      <div className="text-lg font-semibold mt-1">{teamMembers.length}</div>
                      <div className="text-xs text-gray-500">team members</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">ACTIVE</div>
                      <div className="text-lg font-semibold text-green-400 mt-1">{activeMembers}</div>
                      <div className="text-xs text-gray-500">working now</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">PROJECTS ASSIGNED</div>
                      <div className="text-lg font-semibold text-blue-400 mt-1">{totalProjects}</div>
                      <div className="text-xs text-gray-500">active projects</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">HOURS THIS MONTH</div>
                      <div className="text-lg font-semibold text-yellow-400 mt-1">{totalHours}</div>
                      <div className="text-xs text-gray-500">total hours</div>
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
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="all">All Departments ({teamMembers.length})</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>
                            {dept} ({getDepartmentStats()[dept] || 0})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <div className="relative">
                      <select
                        className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none pr-10"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
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
                          <span>Add Team Member</span>
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
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projects</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hours</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Team Member</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projects</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hours</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#333333]">
                        {filteredTeamMembers.map((member) => (
                          <tr 
                            key={member.id} 
                            className="hover:bg-[#1E1E1E] transition-colors"
                          >
                            {viewMode === 'condensed' ? (
                              <>
                                <td className="px-3 py-2">
                                  <div 
                                    className="text-xs font-medium text-white hover:text-blue-400 cursor-pointer"
                                    onClick={() => navigate(`/team-members/${member.id}`)}
                                  >
                                    {member.name}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs text-[#F9D71C] font-medium">{member.job_title}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs font-semibold text-blue-400">
                                    {member.projectsAssigned || 0}
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="text-xs font-semibold text-yellow-400">
                                    {member.hoursThisMonth || 0}h
                                  </div>
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTeamMember(member);
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
                                  <div>
                                    <div 
                                      className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer"
                                      onClick={() => navigate(`/team-members/${member.id}`)}
                                    >
                                      {member.name}
                                    </div>
                                    <div className="text-xs text-blue-400">{member.email}</div>
                                    <div className="text-xs text-gray-400">{member.phone}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-[#F9D71C] font-medium">{member.job_title}</div>
                                  <div className="text-xs text-gray-400">{member.department}</div>
                                  <div className="text-xs text-gray-400 capitalize">{member.employment_type}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-blue-400">
                                    {member.projectsAssigned || 0}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-yellow-400">
                                    {member.hoursThisMonth || 0}h
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTeamMember(member);
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
                    {filteredTeamMembers.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-400">No team members match your filters</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-[#1E1E1E] border border-[#333333] rounded-[4px] p-4 hover:bg-[#252525] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 
                              className="text-sm font-semibold text-white mb-1 hover:text-blue-400 cursor-pointer"
                              onClick={() => navigate(`/team-members/${member.id}`)}
                            >
                              {member.name}
                            </h3>
                            <p className="text-xs text-[#F9D71C]">{member.job_title}</p>
                            <p className="text-xs text-gray-400">{member.department}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTeamMember(member);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded-md border border-blue-400/30 hover:border-blue-300/50 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="text-xs text-blue-400">{member.email}</div>
                          <div className="text-xs text-gray-300">{member.phone}</div>
                          <div className="text-xs text-gray-400 capitalize">{member.employment_type}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#121212] rounded-[4px] p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Projects</div>
                            <div className="text-sm font-semibold text-blue-400">
                              {member.projectsAssigned || 0}
                            </div>
                          </div>
                          <div className="bg-[#121212] rounded-[4px] p-3">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Hours</div>
                            <div className="text-sm font-semibold text-yellow-400">
                              {member.hoursThisMonth || 0}h
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#333333]">
                          <div className="text-xs text-gray-400">
                            Hired: {member.hire_date ? new Date(member.hire_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredTeamMembers.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-400">No team members match your filters</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Team Member Modal */}
      <CreateTeamMemberModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onTeamMemberCreated={() => {
          loadTeamMembers();
          setShowNewModal(false);
        }}
      />

      {/* Edit Team Member Drawer */}
      <EditTeamMemberDrawer
        teamMember={editingTeamMember}
        onClose={() => setEditingTeamMember(null)}
        onSuccess={() => {
          loadTeamMembers();
          setEditingTeamMember(null);
        }}
        onDelete={(teamMemberId) => {
          setTeamMembers(teamMembers.filter(m => m.id !== teamMemberId));
          setEditingTeamMember(null);
        }}
      />
    </div>
  );
}; 