import React, { useState, useContext } from 'react';
import { X, Save, Wrench, Upload, Mail, Phone, MapPin, Zap, HardHat } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { SubcontractorService, SubcontractorFormData, TRADE_CATEGORIES } from '../../services/subcontractorService';
import { QuickAddInput } from '../shared/QuickAddInput';
import { UniversalImportModal } from '../shared/UniversalImportModal';

interface CreateSubcontractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubcontractorCreated: (subcontractor?: any) => void;
}

export const CreateSubcontractorModal: React.FC<CreateSubcontractorModalProps> = ({
  isOpen,
  onClose,
  onSubcontractorCreated
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Create initial form data state
  const getInitialFormData = (): SubcontractorFormData => ({
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
  
  const [formData, setFormData] = useState<SubcontractorFormData>(getInitialFormData());
  
  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [isOpen]);

  const formRef = React.useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e?: React.FormEvent, keepOpen?: boolean) => {
    if (e) e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const orgId = selectedOrg?.id || '264f2bfa-3073-41ca-81cc-d7b795507522';
      const newSubcontractor = await SubcontractorService.createSubcontractor(orgId, user.id, formData);
      onSubcontractorCreated(newSubcontractor);
      setFormData(getInitialFormData()); // Reset form
      
      if (keepOpen) {
        // Scroll to top of form when keeping modal open
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.scrollTop = 0;
          }
        }, 100);
      }
      
      if (!keepOpen) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating subcontractor:', error);
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
                  <HardHat className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Add New Subcontractor</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new subcontractor profile</p>
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
                personType="subcontractor"
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
        <form ref={formRef} onSubmit={(e) => handleSubmit(e, false)} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="border-b border-[#1a1a1a] pb-3">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <HardHat className="w-4 h-4" />
                  Subcontractor Information
                </h3>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Enter contractor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trade Category <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.trade_category}
                  onChange={(e) => setFormData({ ...formData, trade_category: e.target.value })}
                  className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                >
                  {TRADE_CATEGORIES.map(cat => (
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
                  placeholder="e.g., Kitchen electrical"
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
                  placeholder="contractor@example.com"
                />
              </div>
            </div>
            </div>
          </div>

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
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(undefined, true);
                }}
                disabled={loading || !formData.name}
                className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Add & Continue
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <HardHat className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Subcontractor'}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Import Modal */}
      <UniversalImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={async (subcontractors) => {
          // Handle bulk subcontractor import
          if (!user || !selectedOrg?.id) return;
          
          setLoading(true);
          try {
            for (const sub of subcontractors) {
              await SubcontractorService.createSubcontractor(selectedOrg.id, user.id, sub);
            }
            onSubcontractorCreated();
            onClose();
          } catch (error) {
            console.error('Error importing subcontractors:', error);
          } finally {
            setLoading(false);
          }
        }}
        personType="subcontractor"
        title="Import Subcontractors"
      />
    </div>
  );
}; 