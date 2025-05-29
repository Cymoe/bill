import React, { useState } from 'react';
import { X, Save, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { VendorService, VendorFormData, VENDOR_CATEGORIES } from '../../services/vendorService';

interface CreateVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorCreated: () => void;
}

export const CreateVendorModal: React.FC<CreateVendorModalProps> = ({
  isOpen,
  onClose,
  onVendorCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    category: 'General Contractor',
    specialty: '',
    notes: '',
    rating: undefined,
    is_preferred: false,
    license_number: '',
    insurance_info: '',
    tax_id: '',
    payment_terms: 'Net 30'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await VendorService.createVendor(user.id, formData);
      onVendorCreated();
      onClose();
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background-medium rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background-medium p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">ADD NEW VENDOR</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white uppercase">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                placeholder="Enter company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                >
                  {VENDOR_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty || ''}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="e.g., Kitchen remodels"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_preferred}
                  onChange={(e) => setFormData({ ...formData, is_preferred: e.target.checked })}
                  className="w-4 h-4 text-equipment-yellow bg-concrete-gray border-gray-600 rounded focus:ring-equipment-yellow"
                />
                <span className="text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-equipment-yellow" />
                  Preferred Vendor
                </span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white/60">Rating:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          formData.rating && star <= formData.rating
                            ? 'text-equipment-yellow fill-current'
                            : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white uppercase">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="Primary contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="vendor@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Address
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue resize-none"
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white uppercase">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="License #"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formData.tax_id || ''}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="EIN or Tax ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Payment Terms
                </label>
                <select
                  value={formData.payment_terms || 'Net 30'}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                >
                  <option value="Due on receipt">Due on receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Insurance Info
                </label>
                <input
                  type="text"
                  value={formData.insurance_info || ''}
                  onChange={(e) => setFormData({ ...formData, insurance_info: e.target.value })}
                  className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
                  placeholder="Insurance provider & policy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-concrete-gray text-white rounded focus:outline-none focus:ring-2 focus:ring-blueprint-blue resize-none"
                placeholder="Additional notes about this vendor..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-white border border-white/20 rounded hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="px-6 py-2 bg-steel-blue text-white rounded hover:bg-steel-blue/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'CREATE VENDOR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 