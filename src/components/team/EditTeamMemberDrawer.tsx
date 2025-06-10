import React, { useState, useEffect } from 'react';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { TeamMemberService, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../services/TeamMemberService';
import { Save, Trash2, UserCheck } from 'lucide-react';

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
    employment_type: '',
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
        employment_type: teamMember.employment_type || '',
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
      employment_type: '',
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
    <SlideOutDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Team Member"
      width="lg"
    >
      <div className="flex flex-col h-full">
        {/* Header with Actions */}
        <div className="px-6 py-4 border-b border-[#333333] bg-[#1E1E1E]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {teamMember?.name}
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(teamMember?.status || 'active')}`}>
                  {teamMember?.status}
                </span>
              </h2>
              <p className="text-sm text-[#F9D71C]">{teamMember?.job_title}</p>
              <p className="text-sm text-gray-400">{teamMember?.department}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-transparent border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || isSaving}
                className="px-4 py-2 bg-[#EAB308] hover:bg-[#D97706] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Notes</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none"
                placeholder="Additional notes about this team member..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[#1E1E1E] rounded-lg border border-[#333333] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Team Member</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this team member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SlideOutDrawer>
  );
};