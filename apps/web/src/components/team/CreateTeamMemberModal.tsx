import React, { useState, useContext } from 'react';
import { User, Upload, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { TeamMemberService, CreateTeamMemberData, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../services/TeamMemberService';
import { QuickAddInput } from '../shared/QuickAddInput';
import { UniversalImportModal } from '../shared/UniversalImportModal';

interface CreateTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamMemberCreated: (teamMember?: any) => void;
}

export const CreateTeamMemberModal: React.FC<CreateTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onTeamMemberCreated
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Create initial form data state
  const getInitialFormData = (): CreateTeamMemberData => ({
    name: '',
    email: '',
    phone: '',
    job_title: '',
    department: 'Field Operations',
    hire_date: '',
    salary: undefined,
    hourly_rate: undefined,
    employment_type: 'full-time',
    status: 'active',
    permissions: [],
    manager_id: '',
    emergency_contact: '',
    address: '',
    user_id: '',
    organization_id: selectedOrg?.id || '264f2bfa-3073-41ca-81cc-d7b795507522'
  });
  
  const [formData, setFormData] = useState<CreateTeamMemberData>(getInitialFormData());
  
  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen, selectedOrg?.id]);

  const formRef = React.useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e?: React.FormEvent, keepOpen?: boolean) => {
    if (e) e.preventDefault();
    if (!user || !selectedOrg?.id) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        organization_id: selectedOrg.id,
        // Remove empty optional fields
        salary: formData.salary || undefined,
        hourly_rate: formData.hourly_rate || undefined,
        hire_date: formData.hire_date || undefined,
        manager_id: formData.manager_id || undefined,
        emergency_contact: formData.emergency_contact || undefined,
        address: formData.address || undefined,
        user_id: formData.user_id || undefined
      };
      
      const newTeamMember = await TeamMemberService.createTeamMember(submitData);
      onTeamMemberCreated(newTeamMember);
      setFormData(getInitialFormData()); // Reset form
      
      if (keepOpen) {
        // Scroll to top of form when keeping modal open
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollTop = 0;
          }
        }, 100);
      }
      
      if (!keepOpen) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating team member:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient Accent */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
          <div className="relative px-8 py-6 border-b border-[#1a1a1a]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Add Team Member</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new team member profile</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center text-xl font-light"
              >
                ×
              </button>
            </div>
            
            {/* Simplified Import Actions */}
            <div className="flex items-center gap-2 mt-4">
              <QuickAddInput 
                personType="team"
                onDataExtracted={(data) => {
                  setFormData(prev => ({ ...prev, ...data }));
                }}
                className="text-xs rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-transparent border border-[#333333] text-gray-400 hover:text-white hover:border-[#336699] rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Multiple
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <form ref={formRef} onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Team Member Information
                </h3>
              </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="name@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Job Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="e.g., Project Manager, Site Supervisor"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Department <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 appearance-none"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept} className="bg-[#0a0a0a] text-white">{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Employment Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as 'full-time' | 'part-time' | 'contractor' })}
                        className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 appearance-none"
                      >
                        {EMPLOYMENT_TYPES.map(type => (
                          <option key={type.value} value={type.value} className="bg-[#0a0a0a] text-white">{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        value={formData.hire_date || ''}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' })}
                        className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 appearance-none"
                      >
                        <option value="active" className="bg-[#0a0a0a] text-white">Active</option>
                        <option value="inactive" className="bg-[#0a0a0a] text-white">Inactive</option>
                        <option value="on-leave" className="bg-[#0a0a0a] text-white">On Leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-4">
                <div className="border-b border-[#1a1a1a] pb-3">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Compensation</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Annual Salary
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        step="1000"
                        min="0"
                        value={formData.salary || ''}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full h-11 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="65000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hourly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.hourly_rate || ''}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full h-11 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                        placeholder="25.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="border-b border-[#1a1a1a] pb-3">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Additional Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Contact name and phone number"
                    />
                  </div>
                </div>
              </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#1a1a1a] flex items-center justify-between bg-[#050505]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(undefined, true);
                  }}
                  disabled={loading || !formData.name || !formData.job_title}
                  className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  Add & Continue
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(undefined, false);
                  }}
                  disabled={loading || !formData.name || !formData.job_title}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Team Member'}
                </button>
              </div>
            </div>
      </div>
      
      {/* Import Modal */}
      <UniversalImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={async (teamMembers) => {
          // Handle bulk team member import
          if (!user || !selectedOrg?.id) return;
          
          setLoading(true);
          try {
            for (const member of teamMembers) {
              await TeamMemberService.createTeamMember(selectedOrg.id, {
                ...member,
                organization_id: selectedOrg.id,
                job_title: member.role || 'Team Member',
                department: member.department || 'Field Operations',
                employment_type: 'full-time',
                status: 'active'
              });
            }
            onTeamMemberCreated();
            onClose();
          } catch (error) {
            console.error('Error importing team members:', error);
          } finally {
            setLoading(false);
          }
        }}
        personType="team"
        title="Import Team Members"
      />
    </div>
  );
}; 