import React, { useState, useContext } from 'react';
import { X, Save, Star } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Subcontractor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/90 uppercase tracking-wider">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter contractor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Enter company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Trade Category *
                </label>
                <select
                  required
                  value={formData.trade_category}
                  onChange={(e) => setFormData({ ...formData, trade_category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {TRADE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty || ''}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Kitchen electrical"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="contractor@example.com"
              />
            </div>
          </div>

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
              disabled={loading || !formData.name}
              className="h-10 px-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
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