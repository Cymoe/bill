import React, { useState, useEffect } from 'react';
import { 
  X, Save, Star, Phone, Mail, Globe, MapPin, 
  Shield, CheckCircle, Edit2, DollarSign, 
  Briefcase, Calendar, TrendingUp, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { VendorService, Vendor, VendorFormData, VENDOR_CATEGORIES } from '../../services/vendorService';
import { formatCurrency } from '../../utils/format';

interface VendorDetailModalProps {
  vendor: Vendor;
  stats?: {
    totalSpent: number;
    projectCount: number;
    expenseCount: number;
    averageExpense: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onVendorUpdated: () => void;
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  vendor,
  stats,
  isOpen,
  onClose,
  onVendorUpdated
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState<VendorFormData>({
    name: vendor.name,
    contact_name: vendor.contact_name || '',
    phone: vendor.phone || '',
    email: vendor.email || '',
    website: vendor.website || '',
    address: vendor.address || '',
    category: vendor.category,
    specialty: vendor.specialty || '',
    notes: vendor.notes || '',
    rating: vendor.rating,
    is_preferred: vendor.is_preferred,
    license_number: vendor.license_number || '',
    insurance_info: vendor.insurance_info || '',
    tax_id: vendor.tax_id || '',
    payment_terms: vendor.payment_terms || 'Net 30'
  });

  useEffect(() => {
    if (vendor && isOpen) {
      loadVendorData();
    }
  }, [vendor, isOpen]);

  const loadVendorData = async () => {
    try {
      // Load recent expenses
      const expenseData = await VendorService.getVendorExpenses(vendor.id);
      setExpenses(expenseData.slice(0, 5)); // Show only 5 most recent

      // Load associated projects
      // This would need a separate query to get projects with expenses from this vendor
    } catch (error) {
      console.error('Error loading vendor data:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await VendorService.updateVendor(vendor.id, formData);
      onVendorUpdated();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background-medium rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background-medium p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {vendor.name}
                {vendor.is_preferred && (
                  <Star className="w-5 h-5 text-equipment-yellow fill-current" />
                )}
              </h2>
              <span className="px-3 py-1 bg-steel-blue/20 text-steel-blue rounded text-sm">
                {vendor.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleUpdate} className="p-6 space-y-6">
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
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
                {loading ? 'Saving...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="p-6 space-y-6">
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-concrete-gray p-4 rounded">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs uppercase">Total Spent</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(stats.totalSpent)}
                  </p>
                </div>
                <div className="bg-concrete-gray p-4 rounded">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs uppercase">Projects</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.projectCount}</p>
                </div>
                <div className="bg-concrete-gray p-4 rounded">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase">Expenses</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stats.expenseCount}</p>
                </div>
                <div className="bg-concrete-gray p-4 rounded">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs uppercase">Avg Expense</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(stats.averageExpense)}
                  </p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white uppercase">Contact Information</h3>
                <div className="space-y-3">
                  {vendor.contact_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Contact Name</p>
                        <p className="text-white">{vendor.contact_name}</p>
                      </div>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Phone</p>
                        <p className="text-white">{vendor.phone}</p>
                      </div>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Email</p>
                        <p className="text-white">{vendor.email}</p>
                      </div>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Website</p>
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blueprint-blue hover:underline">
                          {vendor.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60">Address</p>
                        <p className="text-white">{vendor.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white uppercase">Business Information</h3>
                <div className="space-y-3">
                  {vendor.specialty && (
                    <div>
                      <p className="text-xs text-white/60">Specialty</p>
                      <p className="text-white">{vendor.specialty}</p>
                    </div>
                  )}
                  {vendor.license_number && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success-green" />
                      <div>
                        <p className="text-xs text-white/60">License Number</p>
                        <p className="text-white">{vendor.license_number}</p>
                      </div>
                    </div>
                  )}
                  {vendor.insurance_info && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-green" />
                      <div>
                        <p className="text-xs text-white/60">Insurance</p>
                        <p className="text-white">{vendor.insurance_info}</p>
                      </div>
                    </div>
                  )}
                  {vendor.tax_id && (
                    <div>
                      <p className="text-xs text-white/60">Tax ID</p>
                      <p className="text-white">{vendor.tax_id}</p>
                    </div>
                  )}
                  {vendor.payment_terms && (
                    <div>
                      <p className="text-xs text-white/60">Payment Terms</p>
                      <p className="text-white">{vendor.payment_terms}</p>
                    </div>
                  )}
                  {vendor.rating && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Rating</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < vendor.rating!
                                ? 'text-equipment-yellow fill-current'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {vendor.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white uppercase">Notes</h3>
                <div className="bg-concrete-gray p-4 rounded">
                  <p className="text-white/80 whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              </div>
            )}

            {/* Recent Expenses */}
            {expenses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white uppercase">Recent Expenses</h3>
                <div className="space-y-2">
                  {expenses.map(expense => (
                    <div key={expense.id} className="bg-concrete-gray p-4 rounded flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{expense.description}</p>
                        <p className="text-sm text-white/60">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-mono">{formatCurrency(expense.amount)}</p>
                        <p className="text-xs text-white/60">{expense.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 