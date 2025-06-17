import React, { useState, useContext } from 'react';
import { X, Save, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { SubcontractorService, SubcontractorFormData, TRADE_CATEGORIES } from '../../services/subcontractorService';

interface CreateSubcontractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubcontractorCreated: () => void;
}

export const CreateSubcontractorModal: React.FC<CreateSubcontractorModalProps> = ({
  isOpen,
  onClose,
  onSubcontractorCreated
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SubcontractorFormData>({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    trade_category: 'General Labor',
    specialty: '',
    hourly_rate: undefined,
    license_number: '',
    certification_info: '',
    insurance_info: '',
    notes: '',
    rating: undefined,
    is_preferred: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const orgId = selectedOrg?.id || '264f2bfa-3073-41ca-81cc-d7b795507522';
      await SubcontractorService.createSubcontractor(orgId, user.id, formData);
      onSubcontractorCreated();
      onClose();
    } catch (error) {
      console.error('Error creating subcontractor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0a0a0a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/20">
              <Wrench className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add New Subcontractor</h2>
              <p className="text-white/60 text-sm">Create a new subcontractor profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-white mb-1">Basic Information</h3>
              <p className="text-white/60 text-sm">Essential details about the subcontractor</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="Enter contractor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Trade Category *
                </label>
                <select
                  required
                  value={formData.trade_category}
                  onChange={(e) => setFormData({ ...formData, trade_category: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                >
                  {TRADE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty || ''}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="e.g., Kitchen electrical"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="contractor@example.com"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="h-12 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-3 shadow-lg"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Subcontractor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 