import React, { useState, useEffect } from 'react';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { TeamMemberService, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../services/TeamMemberService';
import { Trash2, User } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id?: string;
  organization_id: string;
  name: string;
  email?: string;
  phone?: string;
  job_title: string;
  department: string;
  employment_type: string;
  hourly_rate?: number;
  hire_date?: string;
  status: 'active' | 'inactive' | 'on-leave';
  permissions?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
  projectsAssigned?: number;
  hoursThisMonth?: number;
}

interface EditTeamMemberDrawerProps {
  teamMember: TeamMember | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (teamMemberId: string) => void;
}

export const EditTeamMemberDrawer: React.FC<EditTeamMemberDrawerProps> = ({
  teamMember,
  onClose,
  onSuccess,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    job_title: '',
    department: '',
    employment_type: 'full-time' as 'full-time' | 'part-time' | 'contractor',
    hourly_rate: 0,
    hire_date: '',
    status: 'active' as TeamMember['status'],
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = !!teamMember;

  useEffect(() => {
    if (teamMember) {
      setFormData({
        name: teamMember.name || '',
        email: teamMember.email || '',
        phone: teamMember.phone || '',
        job_title: teamMember.job_title || '',
        department: teamMember.department || '',
        employment_type: (teamMember.employment_type as 'full-time' | 'part-time' | 'contractor') || 'full-time',
        hourly_rate: teamMember.hourly_rate || 0,
        hire_date: teamMember.hire_date || '',
        status: teamMember.status || 'active',
        notes: teamMember.notes || ''
      });
    }
  }, [teamMember]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !teamMember) return;

    try {
      setIsSaving(true);
      await TeamMemberService.updateTeamMember(teamMember.id, formData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!teamMember) return;
    
    try {
      await TeamMemberService.deleteTeamMember(teamMember.id);
      if (onDelete) {
        onDelete(teamMember.id);
      }
      handleClose();
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Failed to delete team member. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      job_title: '',
      department: '',
      employment_type: 'full-time' as 'full-time' | 'part-time' | 'contractor',
      hourly_rate: 0,
      hire_date: '',
      status: 'active',
      notes: ''
    });
    setShowDeleteConfirm(false);
    onClose();
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'inactive': return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
      case 'on-leave': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      default: return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <>
      <SlideOutDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title="Edit Team Member"
        width="lg"
      >
        <div className="bg-[#0a0a0a] h-full flex flex-col">
          {/* Modern Header Section */}
          <div className="px-8 py-6 border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white tracking-tight">{teamMember?.name}</h2>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium capitalize border ${getStatusColor(teamMember?.status || 'active')}`}>
                    {teamMember?.status}
                  </span>
                </div>
                <p className="text-sm text-[#fbbf24] mt-1">{teamMember?.job_title}</p>
                <p className="text-sm text-gray-500">{teamMember?.department}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
            <div className="px-8 py-8 space-y-8">
              
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Personal Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
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
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
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
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Employment Information</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                        placeholder="e.g., Project Manager"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Department *
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 appearance-none"
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Employment Type
                      </label>
                      <select
                        value={formData.employment_type}
                        onChange={(e) => handleInputChange('employment_type', e.target.value)}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 appearance-none"
                      >
                        <option value="">Select employment type</option>
                        {EMPLOYMENT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Hourly Rate
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          value={formData.hourly_rate}
                          onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                          className="w-full h-12 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                          placeholder="25.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => handleInputChange('hire_date', e.target.value)}
                        className="w-full h-12 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
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

              {/* Notes */}
              <div className="space-y-6">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Additional Notes</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/20 transition-all duration-200 resize-none"
                    placeholder="Additional notes about this team member..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Member
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || isSaving}
                className="px-5 py-2.5 bg-[#fbbf24] text-black rounded-lg text-sm font-semibold hover:bg-[#f59e0b] hover:-translate-y-px transition-all duration-200 disabled:bg-[#2a2a2a] disabled:text-gray-600 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </SlideOutDrawer>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete Team Member</h3>
              <p className="text-gray-400 mb-8">
                Are you sure you want to delete <span className="text-white font-medium">{teamMember?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Delete Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};