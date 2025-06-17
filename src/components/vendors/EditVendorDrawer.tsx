import React, { useState, useEffect } from 'react';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { VendorService, VENDOR_CATEGORIES } from '../../services/vendorService';
import { Save, Trash2, Star, Building2 } from 'lucide-react';

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
      <div className="flex flex-col h-full bg-[#0a0a0a]">
        {/* Header with Actions */}
        <div className="p-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {vendor?.name}
                </h2>
                {vendor?.is_preferred && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xs text-yellow-400 font-medium">Preferred</span>
                  </div>
                )}
              </div>
              <p className="text-blue-400 text-sm font-medium">{vendor?.category}</p>
              {vendor?.specialty && (
                <p className="text-white/60 text-sm">{vendor.specialty}</p>
              )}
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
                <p className="text-white/60 text-sm">Essential details about the vendor</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  >
                    {VENDOR_CATEGORIES.map(cat => (
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
                    placeholder="e.g., Kitchen remodels"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Primary contact person"
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
                    placeholder="vendor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="https://example.com"
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
                    className="w-5 h-5 text-yellow-500 bg-white/5 border border-white/10 rounded focus:ring-yellow-500/20"
                  />
                  <span className="text-white flex items-center gap-2 font-medium">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Preferred Vendor
                  </span>
                </label>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-lg font-semibold text-white mb-1">Additional Information</h3>
                <p className="text-white/60 text-sm">Business details and notes</p>
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
                    Payment Terms
                  </label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  >
                    <option value="Due on receipt" className="bg-[#0a0a0a] text-white">Due on receipt</option>
                    <option value="Net 15" className="bg-[#0a0a0a] text-white">Net 15</option>
                    <option value="Net 30" className="bg-[#0a0a0a] text-white">Net 30</option>
                    <option value="Net 45" className="bg-[#0a0a0a] text-white">Net 45</option>
                    <option value="Net 60" className="bg-[#0a0a0a] text-white">Net 60</option>
                  </select>
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
                    placeholder="Additional notes about this vendor..."
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
                <h3 className="text-lg font-semibold text-white mb-2">Delete Vendor</h3>
                <p className="text-white/60 mb-6">
                  Are you sure you want to delete "{vendor?.name}"? This action cannot be undone.
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