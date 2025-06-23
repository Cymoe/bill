import React, { useState, useEffect } from 'react';
import { SubcontractorService, TRADE_CATEGORIES } from '../../services/subcontractorService';
import { Save, Trash2, Star, HardHat, MapPin, Shield, CreditCard } from 'lucide-react';

interface Subcontractor {
  id: string;
  user_id: string;
  name: string;
  trade: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  license_number?: string;
  insurance_info?: string;
  insurance_expiry?: string;
  rating?: number;
  is_preferred: boolean;
  hourly_rate?: number;
  availability?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
  const [formData, setFormData] = useState({
    name: '',
    trade: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    license_number: '',
    insurance_info: '',
    insurance_expiry: '',
    rating: 0,
    is_preferred: false,
    hourly_rate: 0,
    availability: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = !!subcontractor;

  useEffect(() => {
    if (subcontractor) {
      setFormData({
        name: subcontractor.name || '',
        trade: subcontractor.trade || '',
        contact_name: subcontractor.contact_name || '',
        email: subcontractor.email || '',
        phone: subcontractor.phone || '',
        address: subcontractor.address || '',
        city: subcontractor.city || '',
        state: subcontractor.state || '',
        zip: subcontractor.zip || '',
        license_number: subcontractor.license_number || '',
        insurance_info: subcontractor.insurance_info || '',
        insurance_expiry: subcontractor.insurance_expiry || '',
        rating: subcontractor.rating || 0,
        is_preferred: subcontractor.is_preferred || false,
        hourly_rate: subcontractor.hourly_rate || 0,
        availability: subcontractor.availability || '',
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
      trade: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      license_number: '',
      insurance_info: '',
      insurance_expiry: '',
      rating: 0,
      is_preferred: false,
      hourly_rate: 0,
      availability: '',
      notes: ''
    });
    setShowDeleteConfirm(false);
    onClose();
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10" />
          <div className="relative px-8 py-6 border-b border-[#1a1a1a]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center">
                  <HardHat className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Edit Subcontractor</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Update subcontractor information</p>
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
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <HardHat className="w-4 h-4" />
                  Subcontractor Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trade <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.trade}
                    onChange={(e) => handleInputChange('trade', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200 appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0a] text-white">Select a trade</option>
                    {TRADE_CATEGORIES.map(trade => (
                      <option key={trade} value={trade} className="bg-[#0a0a0a] text-white">{trade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Primary contact person"
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
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="(555) 123-4567"
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
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="subcontractor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate || ''}
                      onChange={(e) => handleInputChange('hourly_rate', parseFloat(e.target.value) || 0)}
                      className="w-full h-11 pl-8 pr-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                      placeholder="75.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
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
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200 appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0a] text-white">Select availability</option>
                    <option value="available" className="bg-[#0a0a0a] text-white">Available</option>
                    <option value="busy" className="bg-[#0a0a0a] text-white">Busy</option>
                    <option value="booked" className="bg-[#0a0a0a] text-white">Fully Booked</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_preferred}
                    onChange={(e) => handleInputChange('is_preferred', e.target.checked)}
                    className="w-5 h-5 text-green-500 bg-[#0f0f0f] border border-[#2a2a2a] rounded focus:ring-green-500/20 focus:ring-offset-0"
                  />
                  <span className="text-white flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Preferred Subcontractor
                  </span>
                </label>
              </div>
            </div>

            {/* Location & License Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  License & Insurance
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                      placeholder="City"
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
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                      placeholder="12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                      placeholder="License #"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Insurance Expiry
                    </label>
                    <input
                      type="date"
                      value={formData.insurance_expiry}
                      onChange={(e) => handleInputChange('insurance_expiry', e.target.value)}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Insurance Info
                  </label>
                  <input
                    type="text"
                    value={formData.insurance_info}
                    onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                    className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Insurance provider & policy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200 resize-none"
                    placeholder="Additional notes about this subcontractor..."
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
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
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
                <h3 className="text-lg font-semibold text-white mb-2">Delete Subcontractor</h3>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete "{subcontractor?.name}"? This action cannot be undone.
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