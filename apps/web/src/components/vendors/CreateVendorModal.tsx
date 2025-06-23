import React, { useState, useContext } from 'react';
import { X, Save, Building2, Upload, Mail, Phone, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { VendorService, VendorFormData, VENDOR_CATEGORIES } from '../../services/vendorService';
import { QuickAddInput } from '../shared/QuickAddInput';
import { UniversalImportModal } from '../shared/UniversalImportModal';

interface CreateVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVendorCreated: (vendor?: any) => void;
}

export const CreateVendorModal: React.FC<CreateVendorModalProps> = ({
  isOpen,
  onClose,
  onVendorCreated
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Create initial form data state
  const getInitialFormData = (): VendorFormData => ({
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
  
  const [formData, setFormData] = useState<VendorFormData>(getInitialFormData());
  
  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !selectedOrg?.id) return;

    setLoading(true);
    try {
      const newVendor = await VendorService.createVendor(selectedOrg.id, formData);
      onVendorCreated(newVendor);
      onClose();
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient Accent */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
          <div className="relative px-8 py-6 border-b border-[#1a1a1a]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Add New Vendor</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new vendor profile</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center text-xl font-light"
              >
                ×
              </button>
            </div>
            
            {/* Simplified Import Actions */}
            <div className="flex items-center gap-2 mt-4">
              <QuickAddInput 
                personType="vendor"
                onDataExtracted={(data) => {
                  setFormData(prev => ({ ...prev, ...data }));
                }}
                className="text-xs"
              />
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-transparent border border-[#333333] text-gray-400 hover:text-white hover:border-[#336699] rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Multiple
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Vendor Information
                </h3>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                >
                  {VENDOR_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#0a0a0a] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty || ''}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="e.g., Kitchen remodels"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Primary contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="vendor@example.com"
                />
              </div>
            </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#1a1a1a] flex items-center justify-between bg-[#050505]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!user || !selectedOrg?.id) return;
                
                setLoading(true);
                try {
                  const newVendor = await VendorService.createVendor(selectedOrg.id, formData);
                  onVendorCreated(newVendor);
                  
                  // Reset form for next entry
                  setFormData(getInitialFormData());
                } catch (error) {
                  console.error('Error creating vendor:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Add & Continue
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Import Modal */}
      <UniversalImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={async (vendors) => {
          // Handle bulk vendor import
          if (!user || !selectedOrg?.id) return;
          
          setLoading(true);
          try {
            for (const vendor of vendors) {
              await VendorService.createVendor(selectedOrg.id, vendor);
            }
            onVendorCreated();
            onClose();
          } catch (error) {
            console.error('Error importing vendors:', error);
          } finally {
            setLoading(false);
          }
        }}
        personType="vendor"
        title="Import Vendors"
      />
    </div>
  );
}; 