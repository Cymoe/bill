import React, { useState, useContext } from 'react';
import { User, Building2, Mail, Phone, MapPin, Zap, FileText, Upload, Sparkles, Camera, Mic, FileImage, Link2, Users2, Briefcase, HardHat, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { ClientService, Client } from '../../services/ClientService';
import { ClientImportService } from '../../services/ClientImportService';
import { MagicImportModal } from './MagicImportModal';
import { QuickAddInput } from '../shared/QuickAddInput';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client?: Client) => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  
  // Create initial form data state
  const getInitialFormData = (): Partial<Client> => ({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    user_id: user?.id || '',
    organization_id: selectedOrg?.id || ''
  });
  
  const [quickAddMode, setQuickAddMode] = useState(false);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importData, setImportData] = useState<Client[]>([]);
  const [importMode, setImportMode] = useState<'manual' | 'template' | 'smart'>('manual');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [bulkAddText, setBulkAddText] = useState('');
  const [showAdvancedImport, setShowAdvancedImport] = useState(false);
  const [parsedClients, setParsedClients] = useState<Client[]>([]);
  const [showMagicImport, setShowMagicImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>(getInitialFormData());
  
  // Cleanup effect to ensure body overflow is reset and form is reset
  React.useEffect(() => {
    if (!isOpen) {
      // Ensure body overflow is reset when modal closes
      document.body.style.overflow = 'unset';
      // Reset magic import state when modal closes
      setShowMagicImport(false);
    } else {
      // Reset form when modal opens
      setFormData(getInitialFormData());
      setQuickAddMode(false);
      setQuickAddInput('');
      setError(null);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, user?.id, selectedOrg?.id]);

  const handleQuickAddParse = () => {
    // Parse format: "John Doe | Acme Corp | john@acme.com | 555-1234 | 123 Main St"
    const parts = quickAddInput.split('|').map(p => p.trim());
    
    if (parts.length > 0) {
      const updates: Partial<Client> = {};
      if (parts[0]) updates.name = parts[0];
      if (parts[1]) updates.company_name = parts[1];
      if (parts[2]) updates.email = parts[2];
      if (parts[3]) updates.phone = parts[3];
      if (parts[4]) updates.address = parts[4];
      
      setFormData(prev => ({ ...prev, ...updates }));
      setQuickAddMode(false);
      setQuickAddInput('');
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse CSV - assume first line is headers
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      // Enhanced header matching for construction industry
      const nameIndex = headers.findIndex(h => 
        h.includes('name') || h.includes('contact') || h.includes('contractor') || h.includes('foreman')
      );
      const companyIndex = headers.findIndex(h => 
        h.includes('company') || h.includes('organization') || h.includes('firm') || h.includes('business')
      );
      const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('e-mail'));
      const phoneIndex = headers.findIndex(h => 
        h.includes('phone') || h.includes('tel') || h.includes('mobile') || h.includes('cell')
      );
      const addressIndex = headers.findIndex(h => 
        h.includes('address') || h.includes('location') || h.includes('street')
      );
      const cityIndex = headers.findIndex(h => h.includes('city') || h.includes('town'));
      const stateIndex = headers.findIndex(h => h.includes('state') || h.includes('province'));
      const zipIndex = headers.findIndex(h => h.includes('zip') || h.includes('postal'));
      const licenseIndex = headers.findIndex(h => h.includes('license') || h.includes('lic'));
      const tradeIndex = headers.findIndex(h => h.includes('trade') || h.includes('specialty'));
      
      const parsedClients: Client[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values[nameIndex] || values[companyIndex]) {
          const notes: string[] = [];
          if (licenseIndex >= 0 && values[licenseIndex]) {
            notes.push(`License: ${values[licenseIndex]}`);
          }
          if (tradeIndex >= 0 && values[tradeIndex]) {
            notes.push(`Trade: ${values[tradeIndex]}`);
          }
          
          parsedClients.push({
            name: values[nameIndex] || '',
            company_name: companyIndex >= 0 ? values[companyIndex] : '',
            email: emailIndex >= 0 ? values[emailIndex] : '',
            phone: phoneIndex >= 0 ? values[phoneIndex] : '',
            address: addressIndex >= 0 ? values[addressIndex] : '',
            city: cityIndex >= 0 ? values[cityIndex] : '',
            state: stateIndex >= 0 ? values[stateIndex] : '',
            zip: zipIndex >= 0 ? values[zipIndex] : '',
            notes: notes.length > 0 ? notes.join(' • ') : '',
            user_id: user?.id || '',
            organization_id: selectedOrg?.id || ''
          });
        }
      }
      
      // Validate and enrich the data
      const enrichedClients = await ClientImportService.validateAndEnrich(parsedClients);
      setImportData(enrichedClients);
      setShowImportPreview(true);
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      alert('Failed to parse CSV file. Please check the format and try again.');
    }
  };

  const handleBulkImport = async () => {
    if (!user || !selectedOrg?.id || importData.length === 0) return;

    setLoading(true);
    try {
      for (const client of importData) {
        await ClientService.create({
          ...client,
          user_id: user.id,
          organization_id: selectedOrg.id
        });
      }
      
      onClientCreated();
      setImportData([]);
      setShowImportPreview(false);
      onClose();
    } catch (error) {
      console.error('Error importing clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Try to parse email signature format
      const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
      const phoneRegex = /[\d\s()+-]+/;
      
      const emailMatch = text.match(emailRegex);
      const phoneMatch = text.match(phoneRegex);
      
      // Extract name (usually first line)
      const lines = text.split('\n').filter(line => line.trim());
      const potentialName = lines[0]?.trim();
      
      const updates: Partial<Client> = {};
      if (potentialName && !emailRegex.test(potentialName)) {
        updates.name = potentialName;
      }
      if (emailMatch) updates.email = emailMatch[0];
      if (phoneMatch && phoneMatch[0].length > 6) {
        updates.phone = phoneMatch[0].trim();
      }
      
      setFormData(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOrg?.id) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        user_id: user.id,
        organization_id: selectedOrg.id
      };
      
      const newClient = await ClientService.create(submitData);
      onClientCreated(newClient);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        user_id: user?.id || '',
        organization_id: selectedOrg?.id || ''
      });
    } catch (error: any) {
      console.error('Error creating client:', error);
      setError(error.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOrg?.id) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        user_id: user.id,
        organization_id: selectedOrg.id
      };
      
      const newClient = await ClientService.create(submitData);
      onClientCreated(newClient);
      
      // Reset form but keep modal open
      setFormData({
        name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        user_id: user?.id || '',
        organization_id: selectedOrg?.id || ''
      });
      
      // Focus on first input
      const firstInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      firstInput?.focus();
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
                    <h2 className="text-xl font-semibold text-white tracking-tight">Add New Client</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Create a new client profile</p>
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
                  personType="client"
                  onDataExtracted={(data) => {
                    setFormData(prev => ({ ...prev, ...data }));
                  }}
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    console.log('Import Multiple button clicked');
                    setShowMagicImport(true);
                  }}
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
              
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="border-b border-[#1a1a1a] pb-3">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 px-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="John Doe"
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
                      placeholder="Acme Corporation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="john@example.com"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Address
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                    placeholder="123 Main Street, Suite 100&#10;City, State 12345"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-[#1a1a1a] flex items-center justify-between bg-[#050505]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddAnother}
                  disabled={loading || !formData.name}
                  className="px-5 py-2.5 bg-transparent border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Add & Continue
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-px transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      Create Client
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowImportPreview(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div 
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Import Preview</h3>
                  <p className="text-sm text-gray-500 mt-1">Review {importData.length} clients to import</p>
                </div>
                <button
                  onClick={() => setShowImportPreview(false)}
                  className="w-8 h-8 rounded-lg bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  {importData.map((client, index) => (
                    <div key={index} className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
                      <div className="grid grid-cols-5 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Name</p>
                          <p className="text-white">{client.name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Company</p>
                          <p className="text-white">{client.company_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="text-white">{client.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Phone</p>
                          <p className="text-white">{client.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Address</p>
                          <p className="text-white truncate">{client.address || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#1a1a1a] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowImportPreview(false)}
                  className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={loading || importData.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-semibold hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-px transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {importData.length} Clients
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Import Modal */}
      {showAdvancedImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowAdvancedImport(false)}>
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div 
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-600/10" />
                <div className="relative px-8 py-6 border-b border-[#1a1a1a]/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white tracking-tight">Advanced Client Import</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Smart import tools for construction professionals</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAdvancedImport(false)}
                      className="w-10 h-10 rounded-xl bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center text-xl font-light"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {/* Import Method Tabs */}
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      onClick={() => setImportMode('smart')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        importMode === 'smart' 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                          : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Smart Parse
                    </button>
                    <button
                      onClick={() => setImportMode('template')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        importMode === 'template' 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                          : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Templates
                    </button>
                    <button
                      onClick={() => setImportMode('manual')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        importMode === 'manual' 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white' 
                          : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Bulk Entry
                    </button>
                  </div>

                  {/* Smart Parse Mode */}
                  {importMode === 'smart' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                          type="button"
                          className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                        >
                          <FileImage className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Business Cards</p>
                          <p className="text-xs text-gray-500 mt-1">Upload photos</p>
                        </button>
                        <button
                          type="button"
                          className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                        >
                          <Mail className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Email Thread</p>
                          <p className="text-xs text-gray-500 mt-1">Paste conversation</p>
                        </button>
                        <button
                          type="button"
                          className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all group"
                        >
                          <FileText className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Documents</p>
                          <p className="text-xs text-gray-500 mt-1">Contracts, permits</p>
                        </button>
                        <button
                          type="button"
                          className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group"
                        >
                          <Mic className="w-8 h-8 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm font-medium text-white">Voice Input</p>
                          <p className="text-xs text-gray-500 mt-1">Speak to add</p>
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Paste or type anything - we'll figure it out
                        </label>
                        <textarea
                          value={bulkAddText}
                          onChange={(e) => setBulkAddText(e.target.value)}
                          placeholder="Examples:\n• Email signatures\n• Business card text\n• Contact lists\n• Email threads\n• Voice transcriptions"
                          className="w-full h-48 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const parsed = await ClientImportService.parseSmartBulkText(bulkAddText);
                            const enriched = await ClientImportService.validateAndEnrich(parsed);
                            setParsedClients(enriched);
                          }}
                          disabled={!bulkAddText.trim()}
                          className="mt-3 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                        >
                          Parse Contacts
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Template Mode */}
                  {importMode === 'template' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ClientImportService.templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-4 bg-[#1a1a1a] border rounded-xl text-left transition-all ${
                              selectedTemplate === template.id 
                                ? 'border-purple-500 bg-purple-500/10' 
                                : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-600/20 flex items-center justify-center">
                                {template.icon === 'HardHat' && <HardHat className="w-5 h-5 text-purple-400" />}
                                {template.icon === 'Wrench' && <Wrench className="w-5 h-5 text-blue-400" />}
                                {template.icon === 'Package' && <Building2 className="w-5 h-5 text-green-400" />}
                                {template.icon === 'Ruler' && <Users2 className="w-5 h-5 text-yellow-400" />}
                                {template.icon === 'Home' && <User className="w-5 h-5 text-pink-400" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-white">{template.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {selectedTemplate && (
                        <div>
                          <p className="text-sm text-gray-400 mb-3">
                            Enter multiple {ClientImportService.templates.find(t => t.id === selectedTemplate)?.name.toLowerCase()}s, one per line
                          </p>
                          <textarea
                            value={bulkAddText}
                            onChange={(e) => setBulkAddText(e.target.value)}
                            placeholder="John Smith | ABC Construction | john@abc.com | 555-1234 | License #12345"
                            className="w-full h-32 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none font-mono text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Manual Bulk Entry Mode */}
                  {importMode === 'manual' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-3">
                          Enter contacts in any format - we support CSV, tab-separated, or custom delimiters
                        </p>
                        <textarea
                          value={bulkAddText}
                          onChange={(e) => setBulkAddText(e.target.value)}
                          placeholder="Name, Company, Email, Phone, Address\nJohn Doe, ABC Corp, john@abc.com, 555-1234, 123 Main St\nJane Smith, XYZ Inc, jane@xyz.com, 555-5678, 456 Oak Ave"
                          className="w-full h-64 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 resize-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Parsed Results Preview */}
                  {parsedClients.length > 0 && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <p className="text-sm font-medium text-green-400 mb-3">
                        Found {parsedClients.length} contacts ready to import
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {parsedClients.map((client, index) => (
                          <div key={index} className="p-2 bg-[#0f0f0f] rounded-lg text-xs">
                            <span className="text-white font-medium">{client.name}</span>
                            {client.company_name && <span className="text-gray-400"> • {client.company_name}</span>}
                            {client.email && <span className="text-blue-400"> • {client.email}</span>}
                            {client.phone && <span className="text-gray-400"> • {client.phone}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-[#1a1a1a] flex items-center justify-between bg-[#050505]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedImport(false);
                    setBulkAddText('');
                    setParsedClients([]);
                  }}
                  className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (parsedClients.length > 0) {
                      setImportData(parsedClients);
                      setShowImportPreview(true);
                      setShowAdvancedImport(false);
                    }
                  }}
                  disabled={parsedClients.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-px transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Review & Import ({parsedClients.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Magic Import Modal - rendered outside of CreateClientModal */}
      {showMagicImport && (
        <MagicImportModal
          isOpen={showMagicImport}
          onClose={() => setShowMagicImport(false)}
          onImportComplete={() => {
            setShowMagicImport(false);
            onClose(); // Close the create client modal too
            onClientCreated();
          }}
        />
      )}
    </div>
  );
};