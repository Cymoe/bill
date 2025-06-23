import React, { useState, useEffect } from 'react';
import { TeamMemberService, DEPARTMENTS, EMPLOYMENT_TYPES } from '../../services/TeamMemberService';
import { Save, Trash2, User, Mail, Phone, Briefcase } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex justify-end">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border-l border-[#1a1a1a] overflow-hidden flex flex-col shadow-2xl">
        {/* Header with Gradient Accent */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-600/10" />
          <div className="relative px-8 py-6 border-b border-[#1a1a1a]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Edit Team Member</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Update team member information</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-xl bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center text-xl font-light"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Employment Information
                </h3>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Job Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => handleInputChange('job_title', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                      placeholder="e.g., Project Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Department <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200 appearance-none"
                    >
                      <option value="" className="bg-[#0a0a0a] text-white">Select department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept} className="bg-[#0a0a0a] text-white">{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={formData.employment_type}
                      onChange={(e) => handleInputChange('employment_type', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200 appearance-none"
                    >
                      <option value="" className="bg-[#0a0a0a] text-white">Select employment type</option>
                      {EMPLOYMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value} className="bg-[#0a0a0a] text-white">
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
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                        className="w-full h-11 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                        placeholder="25.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleInputChange('hire_date', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200 appearance-none"
                    >
                      <option value="active" className="bg-[#0a0a0a] text-white">Active</option>
                      <option value="inactive" className="bg-[#0a0a0a] text-white">Inactive</option>
                      <option value="on-leave" className="bg-[#0a0a0a] text-white">On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 transition-all duration-200 resize-none"
                    placeholder="Additional notes about this team member..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#1a1a1a] flex items-center justify-between bg-[#050505]">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name.trim() || isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[12000]">
            <div className="bg-[#0a0a0a] rounded-xl max-w-md w-full border border-white/10 shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Team Member</h3>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete "{teamMember?.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-10 px-5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-10 px-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};