import React, { useState, useContext } from 'react';
import { X, Save, User } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Team Member</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wider">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g., Project Manager, Site Supervisor"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Department *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Employment Type *
                </label>
                <select
                  required
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as 'full-time' | 'part-time' | 'contractor' })}
                  className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on-leave' })}
                  className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wider">Compensation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Annual Salary
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.salary || ''}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full h-10 pl-8 pr-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="65000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Hourly Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full h-10 pl-8 pr-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="25.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wider">Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Address
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergency_contact || ''}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="w-full h-10 px-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Contact name and phone number"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.job_title}
              className="h-10 px-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 