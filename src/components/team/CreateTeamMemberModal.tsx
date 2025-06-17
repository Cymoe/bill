import React, { useState, useContext } from 'react';
import { X, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { TeamMemberService, CreateTeamMemberData, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../services/TeamMemberService';

interface CreateTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamMemberCreated: () => void;
}

export const CreateTeamMemberModal: React.FC<CreateTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onTeamMemberCreated
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeamMemberData>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      await TeamMemberService.createTeamMember(submitData);
      onTeamMemberCreated();
      onClose();
    } catch (error) {
      console.error('Error creating team member:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div 
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Add Team Member</h2>
                <p className="text-sm text-gray-500 mt-1">Create a new team member profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center text-lg"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-8 py-8 space-y-8">
              
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Basic Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                        placeholder="name@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                      placeholder="e.g., Project Manager, Site Supervisor"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Department *
                      </label>
                      <select
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 appearance-none"
                      >
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Employment Type *
                      </label>
                      <select
                        required
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as 'full-time' | 'part-time' | 'contractor' })}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 appearance-none"
                      >
                        {EMPLOYMENT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        value={formData.hire_date || ''}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' })}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 appearance-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Compensation</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
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
                        className="w-full h-12 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                        placeholder="65000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
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
                        className="w-full h-12 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                        placeholder="25.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Additional Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Address
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 resize-none"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={formData.emergency_contact || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                      placeholder="Contact name and phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-[#1a1a1a] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.job_title}
                className="px-5 py-2.5 bg-[#fbbf24] text-black rounded-lg text-sm font-semibold hover:bg-[#f59e0b] hover:-translate-y-px transition-all duration-200 disabled:bg-[#2a2a2a] disabled:text-gray-600 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                    Creating...
                  </>
                ) : (
                  'Create Team Member'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 