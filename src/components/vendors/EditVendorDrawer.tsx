import React, { useState, useEffect } from 'react';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { VendorService, VENDOR_CATEGORIES } from '../../services/vendorService';
import { Save, Trash2, Star } from 'lucide-react';

interface Vendor {
  id: string;
  user_id: string;
  name: string;
  category: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  specialty?: string;
  rating?: number;
  is_preferred: boolean;
  license_number?: string;
  insurance_info?: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface EditVendorDrawerProps {
  vendor: Vendor | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (vendorId: string) => void;
}

export const EditVendorDrawer: React.FC<EditVendorDrawerProps> = ({
  vendor,
  onClose,
  onSuccess,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    specialty: '',
    rating: 0,
    is_preferred: false,
    license_number: '',
    insurance_info: '',
    payment_terms: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOpen = !!vendor;

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        category: vendor.category || '',
        contact_name: vendor.contact_name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        website: vendor.website || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        zip: vendor.zip || '',
        specialty: vendor.specialty || '',
        rating: vendor.rating || 0,
        is_preferred: vendor.is_preferred || false,
        license_number: vendor.license_number || '',
        insurance_info: vendor.insurance_info || '',
        payment_terms: vendor.payment_terms || '',
        notes: vendor.notes || ''
      });
    }
  }, [vendor]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !vendor) return;

    try {
      setIsSaving(true);

      await VendorService.updateVendor(vendor.id, formData);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating vendor:', error);
      alert('Failed to update vendor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vendor) return;
    
    try {
      await VendorService.deleteVendor(vendor.id);

      if (onDelete) {
        onDelete(vendor.id);
      }
      handleClose();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Failed to delete vendor. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      category: '',
      contact_name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      specialty: '',
      rating: 0,
      is_preferred: false,
      license_number: '',
      insurance_info: '',
      payment_terms: '',
      notes: ''
    });
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <SlideOutDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Vendor"
      width="xl"
    >
      <div className="flex flex-col h-full">
        {/* Header with Actions */}
        <div className="px-6 py-4 border-b border-[#333333] bg-[#1E1E1E]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {vendor?.name}
                {vendor?.is_preferred && <Star className="w-5 h-5 text-[#F9D71C] fill-current" />}
              </h2>
              <p className="text-sm text-[#F9D71C]">{vendor?.category}</p>
              {vendor?.specialty && <p className="text-sm text-gray-400">{vendor.specialty}</p>}
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
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter vendor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {VENDOR_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Specific products or services"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Enter phone number"
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
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="https://www.example.com"
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

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Business Information</h3>
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
                    placeholder="Business license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="e.g., Net 30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Insurance Information
                  </label>
                  <textarea
                    value={formData.insurance_info}
                    onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent resize-none"
                    placeholder="Insurance details and coverage information"
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
                    Preferred Vendor
                  </label>
                  <button
                    type="button"
                    onClick={() => handleInputChange('is_preferred', !formData.is_preferred)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.is_preferred
                        ? 'bg-[#F9D71C] border-[#F9D71C] text-[#121212]'
                        : 'bg-transparent border-gray-600 text-gray-400 hover:border-[#F9D71C] hover:text-[#F9D71C]'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${formData.is_preferred ? 'fill-current' : ''}`} />
                    {formData.is_preferred ? 'Preferred Vendor' : 'Mark as Preferred'}
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
                placeholder="Additional notes about this vendor..."
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
            <h3 className="text-lg font-semibold text-white mb-2">Delete Vendor</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this vendor? This action cannot be undone.
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