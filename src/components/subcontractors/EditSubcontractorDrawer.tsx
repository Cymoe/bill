import React, { useState, useEffect } from 'react';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { SubcontractorService, TRADE_CATEGORIES } from '../../services/subcontractorService';
import { Save, Trash2, Star, Heart, Wrench } from 'lucide-react';

interface Subcontractor {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  trade_category: string;
  specialty: string;
  hourly_rate?: number;
  license_number?: string;
  certification_info?: string;
  insurance_info?: string;
  rating?: number;
  is_preferred: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  totalValue?: number;
  projectCount?: number;
  lastProjectDate?: string;
}

interface EditSubcontractorDrawerProps {
  subcontractor: Subcontractor | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (subcontractorId: string) => void;
}

export const EditSubcontractorDrawer: React.FC<EditSubcontractorDrawerProps> = ({
  subcontractor,
  onClose,
  onSuccess,
  onDelete
}) => {
  console.log('🔧 EditSubcontractorDrawer render - subcontractor:', subcontractor);
  
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    trade_category: '',
    specialty: '',
    hourly_rate: 0,
    license_number: '',
    certification_info: '',
    insurance_info: '',
    rating: 0,
    is_preferred: false,
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = !!subcontractor;

  console.log('🔧 EditSubcontractorDrawer render - subcontractor:', subcontractor);
  console.log('🔧 EditSubcontractorDrawer render - isOpen:', isOpen);

  useEffect(() => {
    if (subcontractor) {
      console.log('🔧 EditSubcontractorDrawer useEffect - setting form data for:', subcontractor.name);
      setFormData({
        name: subcontractor.name || '',
        company_name: subcontractor.company_name || '',
        email: subcontractor.email || '',
        phone: subcontractor.phone || '',
        address: subcontractor.address || '',
        city: subcontractor.city || '',
        state: subcontractor.state || '',
        zip: subcontractor.zip || '',
        trade_category: subcontractor.trade_category || '',
        specialty: subcontractor.specialty || '',
        hourly_rate: subcontractor.hourly_rate || 0,
        license_number: subcontractor.license_number || '',
        certification_info: subcontractor.certification_info || '',
        insurance_info: subcontractor.insurance_info || '',
        rating: subcontractor.rating || 0,
        is_preferred: subcontractor.is_preferred || false,
        notes: subcontractor.notes || ''
      });
    }
  }, [subcontractor]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !subcontractor) return;

    try {
      setIsSaving(true);

      await SubcontractorService.updateSubcontractor(subcontractor.id, formData);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating subcontractor:', error);
      alert('Failed to update subcontractor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subcontractor) return;
    
    try {
      await SubcontractorService.deleteSubcontractor(subcontractor.id);

      if (onDelete) {
        onDelete(subcontractor.id);
      }
      handleClose();
    } catch (error) {
      console.error('Error deleting subcontractor:', error);
      alert('Failed to delete subcontractor. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      trade_category: '',
      specialty: '',
      hourly_rate: 0,
      license_number: '',
      certification_info: '',
      insurance_info: '',
      rating: 0,
      is_preferred: false,
      notes: ''
    });
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <SlideOutDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Subcontractor"
      width="xl"
    >
      <div className="flex flex-col h-full bg-[#0a0a0a]">
        {/* Header with Actions */}
        <div className="p-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/20">
              <Wrench className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {subcontractor?.name}
                </h2>
                {subcontractor?.is_preferred && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <Heart className="w-4 h-4 text-red-400 fill-current" />
                    <span className="text-xs text-red-400 font-medium">Preferred</span>
                  </div>
                )}
              </div>
              {subcontractor?.company_name && (
                <p className="text-white/60 text-sm mb-1">{subcontractor.company_name}</p>
              )}
              <p className="text-orange-400 text-sm font-medium">{subcontractor?.trade_category}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="h-12 px-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name.trim() || isSaving}
              className="h-12 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-3 shadow-lg"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
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
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
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
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Trade Category *
                  </label>
                  <select
                    value={formData.trade_category}
                    onChange={(e) => handleInputChange('trade_category', e.target.value)}
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
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="contractor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    value={formData.hourly_rate || ''}
                    onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Rating
                  </label>
                  <div className="flex items-center gap-2 h-12">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleInputChange('rating', star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            formData.rating && star <= formData.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_preferred}
                    onChange={(e) => handleInputChange('is_preferred', e.target.checked)}
                    className="w-5 h-5 text-red-500 bg-white/5 border border-white/10 rounded focus:ring-red-500/20"
                  />
                  <span className="text-white flex items-center gap-2 font-medium">
                    <Heart className="w-5 h-5 text-red-400" />
                    Preferred Subcontractor
                  </span>
                </label>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-lg font-semibold text-white mb-1">Additional Information</h3>
                <p className="text-white/60 text-sm">Professional credentials and notes</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="License #"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Certification Info
                  </label>
                  <input
                    type="text"
                    value={formData.certification_info}
                    onChange={(e) => handleInputChange('certification_info', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Certifications"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Insurance Info
                  </label>
                  <input
                    type="text"
                    value={formData.insurance_info}
                    onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Insurance provider & policy"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all resize-none"
                    placeholder="Additional notes about this subcontractor..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a0a0a] rounded-xl max-w-md w-full border border-white/10 shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Delete Subcontractor</h3>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete "{subcontractor?.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-12 px-6 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="h-12 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all font-medium flex items-center gap-3 shadow-lg"
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
    </SlideOutDrawer>
  );
}; 