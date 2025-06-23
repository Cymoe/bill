import React, { useState } from 'react';
import { 
  Sparkles, Camera, Mic, Clipboard, Mail, MapPin, 
  X, Upload, Loader2, Check, AlertCircle, Users,
  FileText, Smartphone, Calendar, Building2, DollarSign,
  Wrench, HardHat, UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { UniversalImportService, PersonType } from '../../services/UniversalImportService';
import { CalendarIntegrationService } from '../../services/CalendarIntegrationService';
import { EmailIntegrationService } from '../../services/EmailIntegrationService';
import { QuickBooksIntegrationService } from '../../services/QuickBooksIntegrationService';
import { supabase } from '../../lib/supabase';
import { Client } from '../../services/ClientService';
import { VendorFormData } from '../../services/vendorService';
import { SubcontractorFormData } from '../../services/subcontractorService';
import { TeamMemberFormData } from '../../services/TeamMemberService';

interface UniversalImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: Array<Client | VendorFormData | SubcontractorFormData | TeamMemberFormData>) => void;
  personType: PersonType;
  title?: string;
}

type ImportMethod = 'photo' | 'voice' | 'paste' | 'email' | 'location' | 'calendar' | 'contacts' | 'quickbooks';

export const UniversalImportModal: React.FC<UniversalImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  personType,
  title
}) => {
  const { user } = useAuth();
  const { selectedOrg } = React.useContext(OrganizationContext);
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState<Array<Client | VendorFormData | SubcontractorFormData | TeamMemberFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState('');

  // Get person-specific icons and titles
  const getPersonIcon = () => {
    switch (personType) {
      case 'vendor': return Building2;
      case 'subcontractor': return HardHat;
      case 'team': return UserCheck;
      default: return Users;
    }
  };

  const getPersonTitle = () => {
    switch (personType) {
      case 'vendor': return title || 'Import Vendors';
      case 'subcontractor': return title || 'Import Subcontractors';
      case 'team': return title || 'Import Team Members';
      default: return title || 'Import Clients';
    }
  };

  const getPersonPlaceholder = () => {
    switch (personType) {
      case 'vendor': return 'Paste vendor details, supplier info, or business cards...';
      case 'subcontractor': return 'Paste contractor info, licenses, or trade details...';
      case 'team': return 'Paste team member emails, bios, or contact info...';
      default: return 'Paste contact info, email signatures, or business cards...';
    }
  };

  const importMethods = [
    {
      id: 'paste' as ImportMethod,
      icon: Clipboard,
      title: 'Smart Paste',
      description: 'Paste any text, AI extracts contacts',
      color: 'from-green-500 to-emerald-500',
      available: true
    },
    {
      id: 'email' as ImportMethod,
      icon: Mail,
      title: 'Email Scan',
      description: 'Import from recent email threads',
      color: 'from-orange-500 to-red-500',
      available: true
    },
    {
      id: 'calendar' as ImportMethod,
      icon: Calendar,
      title: 'Calendar Contacts',
      description: 'Import from recent meetings',
      color: 'from-yellow-500 to-orange-500',
      available: true
    },
    {
      id: 'quickbooks' as ImportMethod,
      icon: DollarSign,
      title: 'QuickBooks',
      description: personType === 'vendor' ? 'Import vendors' : 'Import customers',
      color: 'from-green-600 to-green-500',
      available: personType === 'client' || personType === 'vendor'
    },
    {
      id: 'photo' as ImportMethod,
      icon: Camera,
      title: 'Photo Import',
      description: 'Business cards, documents',
      color: 'from-purple-500 to-pink-500',
      available: true
    },
    {
      id: 'contacts' as ImportMethod,
      icon: Smartphone,
      title: 'Phone Contacts',
      description: 'Sync from your phone',
      color: 'from-teal-500 to-cyan-500',
      available: false // Coming soon
    }
  ];

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSmartPaste = async () => {
    if (!pasteInput.trim()) {
      setError('Please paste some text to import.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = UniversalImportService.parseSmartInput(pasteInput, personType);
      
      if (result.data.length === 0) {
        setError(`Could not extract any ${personType} information from the pasted text.`);
        return;
      }
      
      setImportResults(result.data);
    } catch (err) {
      console.error('Error processing paste input:', err);
      setError('Failed to process the pasted text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailImport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const extractedContacts = await EmailIntegrationService.extractContactsFromRecentEmails({
        limit: 50,
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
      
      // Convert to appropriate person type
      const converted = extractedContacts.map(c => 
        UniversalImportService.parseSmartInput(
          `${c.name}\n${c.company_name}\n${c.email}\n${c.phone}`,
          personType
        ).data[0]
      ).filter(Boolean);
      
      if (converted.length === 0) {
        setError(`No ${personType}s found in recent emails.`);
        return;
      }
      
      setImportResults(converted);
    } catch (err) {
      console.error('Error importing from email:', err);
      setError('Failed to import from email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarImport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await UniversalImportService.extractContactsFromCalendar(personType);
      
      if (result.data.length === 0) {
        setError(`No ${personType}s found in recent calendar events.`);
        return;
      }
      
      setImportResults(result.data);
    } catch (err) {
      console.error('Error importing from calendar:', err);
      setError('Failed to import from calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!importResults || importResults.length === 0) return;
    onImportComplete(importResults);
    onClose();
  };

  const renderMethodSelection = () => (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3">
        {importMethods.filter(m => m.available).map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className="group relative p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl hover:border-[#3a3a3a] transition-all duration-200 text-left overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${method.color} p-0.5 mb-2`}>
                  <div className="w-full h-full bg-[#0f0f0f] rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{method.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderImportInterface = () => {
    switch (selectedMethod) {
      case 'paste':
        return (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste anything with {personType} information
              </label>
              <textarea
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                onPaste={(e) => {
                  setTimeout(() => {
                    if (e.target.value.trim()) {
                      handleSmartPaste();
                    }
                  }, 100);
                }}
                placeholder={getPersonPlaceholder()}
                className="w-full h-40 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                AI will automatically extract relevant information
              </p>
            </div>
            <button
              onClick={handleSmartPaste}
              disabled={!pasteInput.trim() || loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
            >
              Extract {personType === 'team' ? 'Team Members' : personType.charAt(0).toUpperCase() + personType.slice(1) + 's'}
            </button>
          </div>
        );

      case 'email':
        return (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Email Contact Extraction</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                Extract {personType}s from your recent email conversations
              </p>
              <button
                onClick={handleEmailImport}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                Extract from Emails
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Demo mode: Shows sample {personType} contacts
              </p>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Calendar Import</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                Import {personType}s from your recent meetings and events
              </p>
              <button
                onClick={handleCalendarImport}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
              >
                Import from Calendar
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Demo mode: Shows sample {personType} contacts
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-white font-medium mb-2">Coming Soon</p>
              <p className="text-sm text-gray-500">
                This import method is under development.
              </p>
            </div>
          </div>
        );
    }
  };

  const renderImportResults = () => {
    if (!importResults) return null;

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Found {importResults.length} {personType === 'team' ? 'Team Member' : personType.charAt(0).toUpperCase() + personType.slice(1)}{importResults.length !== 1 ? 's' : ''}
          </h3>
          <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-xs text-green-400">Ready to import</p>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {importResults.map((item, index) => (
            <div key={index} className="p-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {item.name || item.contact_name || 'No Name'}
                  </p>
                  {item.company_name && (
                    <p className="text-sm text-gray-400">{item.company_name}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {item.email}
                      </span>
                    )}
                    {item.phone && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        {item.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              setImportResults(null);
              setSelectedMethod(null);
              setPasteInput('');
            }}
            className="flex-1 py-3 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-xl font-medium transition-all duration-200"
          >
            Start Over
          </button>
          <button
            onClick={handleImportConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Import {importResults.length} {personType === 'team' ? 'Member' : personType.charAt(0).toUpperCase() + personType.slice(1)}{importResults.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const PersonIcon = getPersonIcon();

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70]" onClick={onClose}>
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
          <div 
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <div className="relative px-6 py-5 border-b border-[#1a1a1a]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <PersonIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white tracking-tight">{getPersonTitle()}</h2>
                      <p className="text-sm text-gray-500">Choose how you'd like to import</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="m-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </p>
                </div>
              )}

              {!selectedMethod && !importResults && renderMethodSelection()}
              {selectedMethod && !importResults && renderImportInterface()}
              {importResults && renderImportResults()}
            </div>

            {/* Footer - Always show back button */}
            <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#050505] flex justify-between items-center">
              {selectedMethod && !importResults ? (
                <button
                  onClick={() => {
                    setSelectedMethod(null);
                    setPasteInput('');
                    setError(null);
                  }}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  ← Back to methods
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  ← Back to form
                </button>
              )}
              <div className="text-xs text-gray-500">
                Press ESC to close
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};