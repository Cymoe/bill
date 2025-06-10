import React, { useState, useEffect } from 'react';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { SubcontractorService, TRADE_CATEGORIES } from '../../services/subcontractorService';
import { Save, Trash2, Star, Heart } from 'lucide-react';

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
      <div className="flex flex-col h-full">
        {/* Header with Actions */}
        <div className="px-6 py-4 border-b border-[#333333] bg-[#1E1E1E]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {subcontractor?.name}
                {subcontractor?.is_preferred && <Heart className="w-5 h-5 text-[#D32F2F] fill-current" />}
              </h2>
              <p className="text-sm text-gray-400">{subcontractor?.company_name}</p>
              <p className="text-sm text-[#F9D71C]">{subcontractor?.trade_category}</p>
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
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
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
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter company name"
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

            {/* Trade Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Trade Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trade Category *
                  </label>
                  <select
                    value={formData.trade_category}
                    onChange={(e) => handleInputChange('trade_category', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  >
                    <option value="">Select trade category</option>
                    {TRADE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Specific skills or specializations"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>

            {/* Credentials & Certifications */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Credentials & Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Insurance Information
                  </label>
                  <input
                    type="text"
                    value={formData.insurance_info}
                    onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Insurance details"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certifications
                  </label>
                  <textarea
                    value={formData.certification_info}
                    onChange={(e) => handleInputChange('certification_info', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none"
                    placeholder="List certifications, training, or qualifications"
                  />
                </div>
              </div>
            </div>

            {/* Rating & Preferences */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Rating & Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleInputChange('rating', star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= formData.rating
                                ? 'text-[#F9D71C] fill-current'
                                : 'text-gray-600 hover:text-[#F9D71C]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">({formData.rating}/5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Contractor
                  </label>
                  <button
                    type="button"
                    onClick={() => handleInputChange('is_preferred', !formData.is_preferred)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.is_preferred
                        ? 'bg-[#D32F2F] border-[#D32F2F] text-white'
                        : 'bg-transparent border-gray-600 text-gray-400 hover:border-[#D32F2F] hover:text-[#D32F2F]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${formData.is_preferred ? 'fill-current' : ''}`} />
                    {formData.is_preferred ? 'Preferred' : 'Mark as Preferred'}
                  </button>
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
                placeholder="Additional notes about this subcontractor..."
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
            <h3 className="text-lg font-semibold text-white mb-2">Delete Subcontractor</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this subcontractor? This action cannot be undone.
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