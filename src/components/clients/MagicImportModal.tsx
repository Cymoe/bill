import React, { useState, useRef } from 'react';
import { 
  Sparkles, Camera, Mic, Clipboard, Mail, MapPin, 
  X, Upload, Loader2, Check, AlertCircle, Users,
  FileText, Smartphone, Calendar, Building2, DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { ClientService, Client } from '../../services/ClientService';
import { ClientImportService } from '../../services/ClientImportService';
import { DuplicateDetectionModal } from './DuplicateDetectionModal';
import { ImportHistoryService } from '../../services/ImportHistoryService';
import { OCRService } from '../../services/OCRService';
import { CalendarIntegrationService } from '../../services/CalendarIntegrationService';
import { EmailIntegrationService } from '../../services/EmailIntegrationService';
import { QuickBooksIntegrationService } from '../../services/QuickBooksIntegrationService';
import { supabase } from '../../lib/supabase';

// Speech Recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface MagicImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type ImportMethod = 'photo' | 'voice' | 'paste' | 'email' | 'location' | 'calendar' | 'contacts' | 'quickbooks';

interface ImportResult {
  clients: Client[];
  source: string;
  confidence: number;
}

export const MagicImportModal: React.FC<MagicImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  console.log('MagicImportModal render - isOpen:', isOpen);
  const { user } = useAuth();
  const { selectedOrg } = React.useContext(OrganizationContext);
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingClients, setExistingClients] = useState<Client[]>([]);
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Paste input state
  const [pasteInput, setPasteInput] = useState('');
  
  // Photo input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMethods = [
    {
      id: 'photo' as ImportMethod,
      icon: Camera,
      title: 'Photo Import',
      description: 'Business cards, whiteboards, documents',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'voice' as ImportMethod,
      icon: Mic,
      title: 'Voice Entry',
      description: 'Speak contact names and details',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'paste' as ImportMethod,
      icon: Clipboard,
      title: 'Smart Paste',
      description: 'Paste any text, AI extracts contacts',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'email' as ImportMethod,
      icon: Mail,
      title: 'Email Scan',
      description: 'Import from recent email threads',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'location' as ImportMethod,
      icon: MapPin,
      title: 'Nearby Contractors',
      description: 'Find contractors near your projects',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'calendar' as ImportMethod,
      icon: Calendar,
      title: 'Calendar Contacts',
      description: 'Import from recent meetings',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'contacts' as ImportMethod,
      icon: Smartphone,
      title: 'Phone Contacts',
      description: 'Sync from your phone contacts',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'quickbooks' as ImportMethod,
      icon: DollarSign,
      title: 'QuickBooks',
      description: 'Import customers from QuickBooks',
      color: 'from-green-600 to-green-500'
    }
  ];

  // Initialize voice recognition
  const initVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        
        setVoiceTranscript(prev => prev + finalTranscript);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setError('Voice recognition error. Please try again.');
        setIsRecording(false);
      };
    }
  };

  const handleVoiceStart = () => {
    if (!recognitionRef.current) {
      initVoiceRecognition();
    }
    
    if (recognitionRef.current) {
      setIsRecording(true);
      setVoiceTranscript('');
      recognitionRef.current.start();
    } else {
      setError('Voice recognition is not supported in your browser.');
    }
  };

  const handleVoiceStop = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Process the voice transcript
      if (voiceTranscript) {
        processVoiceInput(voiceTranscript);
      }
    }
  };

  const processVoiceInput = async (transcript: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse voice input using the smart parser
      const parsedClients = ClientImportService.parseSmartInput(transcript);
      
      if (parsedClients.length === 0) {
        setError('Could not extract any contact information from the voice input.');
        return;
      }
      
      setImportResults({
        clients: parsedClients,
        source: 'Voice Input',
        confidence: 0.8
      });
    } catch (err) {
      console.error('Error processing voice input:', err);
      setError('Failed to process voice input. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartPaste = async () => {
    if (!pasteInput.trim()) {
      setError('Please paste some text to import.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the enhanced smart parser
      const parsedClients = ClientImportService.parseSmartInput(pasteInput);
      
      if (parsedClients.length === 0) {
        setError('Could not extract any contact information from the pasted text.');
        return;
      }
      
      setImportResults({
        clients: parsedClients,
        source: 'Smart Paste',
        confidence: 0.9
      });
    } catch (err) {
      console.error('Error processing paste input:', err);
      setError('Failed to process the pasted text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const file = files[0];
      
      // Use OCR to extract text from the image
      const extractedClients = await OCRService.extractContactsFromImage(file);
      
      if (extractedClients.length === 0) {
        setError('Could not extract any contact information from the image. Please ensure the text is clear and try again.');
        return;
      }
      
      setImportResults({
        clients: extractedClients,
        source: `Photo Import (${file.name})`,
        confidence: 0.85
      });
    } catch (err) {
      console.error('Error processing photo:', err);
      setError('Failed to process the photo. Please ensure the image contains clear text and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailImport = async () => {
    console.log('Email import clicked');
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would connect to the user's email provider
      // For now, use the mock data from the service
      const extractedContacts = await EmailIntegrationService.extractContactsFromRecentEmails({
        limit: 50,
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });
      
      if (extractedContacts.length === 0) {
        setError('No contacts found in recent emails.');
        return;
      }
      
      setImportResults({
        clients: extractedContacts,
        source: 'Email Import (Last 30 days)',
        confidence: 0.9
      });
    } catch (err) {
      console.error('Error importing from email:', err);
      setError('Failed to import contacts from email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarImport = async () => {
    console.log('Calendar import clicked');
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would connect to the user's calendar provider
      // For now, use the mock data from the service
      const extractedContacts = await CalendarIntegrationService.extractContactsFromRecentEvents({
        timeMin: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        timeMax: new Date(),
        maxResults: 100
      });
      
      if (extractedContacts.length === 0) {
        setError('No contacts found in recent calendar events.');
        return;
      }
      
      setImportResults({
        clients: extractedContacts,
        source: 'Calendar Import (Last 90 days)',
        confidence: 0.85
      });
    } catch (err) {
      console.error('Error importing from calendar:', err);
      setError('Failed to import contacts from calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBooksImport = async () => {
    console.log('QuickBooks import clicked');
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would connect to the user's QuickBooks account
      // For now, use the mock data from the service
      const customers = await QuickBooksIntegrationService.importCustomers({
        activeOnly: true,
        limit: 100,
        includeJobs: false
      });
      
      if (customers.length === 0) {
        setError('No customers found in QuickBooks.');
        return;
      }
      
      setImportResults({
        clients: customers,
        source: 'QuickBooks Import',
        confidence: 0.95
      });
    } catch (err) {
      console.error('Error importing from QuickBooks:', err);
      setError('Failed to import customers from QuickBooks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingClients = async () => {
    if (!selectedOrg?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrg.id);
      
      if (error) throw error;
      setExistingClients(data || []);
    } catch (err) {
      console.error('Error loading existing clients:', err);
    }
  };

  // Load existing clients when import results are ready
  React.useEffect(() => {
    if (importResults && importResults.clients.length > 0) {
      loadExistingClients();
    }
  }, [importResults]);

  // Handle ESC key to close modal
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

  const handleImportConfirm = async () => {
    if (!importResults || importResults.clients.length === 0) return;
    
    // Check for duplicates first
    setShowDuplicateModal(true);
  };

  const handleDuplicateProceed = async (
    clientsToImport: Client[], 
    clientsToMerge: Array<{new: Client, existing: Client}>
  ) => {
    setShowDuplicateModal(false);
    setLoading(true);
    setError(null);
    
    const totalToImport = importResults?.clients.length || 0;
    const skipped = totalToImport - clientsToImport.length - clientsToMerge.length;
    let successCount = 0;
    
    try {
      // Validate we have required IDs
      if (!user?.id || !selectedOrg?.id) {
        throw new Error('Missing user or organization information. Please try logging in again.');
      }
      
      // Import non-duplicate clients
      for (const client of clientsToImport) {
        await ClientService.create({
          ...client,
          user_id: user.id,
          organization_id: selectedOrg.id
        });
        successCount++;
      }
      
      // Handle merges
      for (const merge of clientsToMerge) {
        // Update existing client with new data
        const updates: Partial<Client> = {};
        
        // Only update fields that are empty in existing client
        if (!merge.existing.email && merge.new.email) {
          updates.email = merge.new.email;
        }
        if (!merge.existing.phone && merge.new.phone) {
          updates.phone = merge.new.phone;
        }
        if (!merge.existing.company_name && merge.new.company_name) {
          updates.company_name = merge.new.company_name;
        }
        if (!merge.existing.address && merge.new.address) {
          updates.address = merge.new.address;
        }
        
        if (Object.keys(updates).length > 0 && merge.existing.id) {
          await ClientService.update(merge.existing.id, updates);
        }
      }
      
      // Track import history
      if (selectedOrg?.id && user?.id && selectedMethod) {
        const methodMap: Record<ImportMethod, 'voice' | 'paste' | 'photo' | 'email' | 'calendar'> = {
          voice: 'voice',
          paste: 'paste',
          photo: 'photo',
          email: 'email',
          location: 'paste',
          calendar: 'calendar',
          contacts: 'paste',
          quickbooks: 'paste' // Using 'paste' as a fallback for now
        };
        
        await ImportHistoryService.trackMagicImport(
          selectedOrg.id,
          user.id,
          methodMap[selectedMethod],
          {
            total: totalToImport,
            imported: successCount,
            skipped: skipped,
            merged: clientsToMerge.length,
            source: importResults?.source || 'Magic Import'
          }
        );
      }
      
      // Success! Close all modals
      setShowDuplicateModal(false);
      onImportComplete();
      onClose();
    } catch (err: any) {
      console.error('Error importing clients:', err);
      setError(err.message || 'Failed to import clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3">
        {importMethods.map((method) => {
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
      case 'voice':
        return (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <button
                onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                className={`w-32 h-32 rounded-full mx-auto mb-4 transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                <Mic className={`w-16 h-16 mx-auto text-white ${isRecording ? 'animate-pulse' : ''}`} />
              </button>
              <p className="text-sm text-gray-400 mb-2">
                {isRecording ? 'Listening... Click to stop' : 'Click to start speaking'}
              </p>
              <p className="text-xs text-gray-500">
                Say something like: "Add John Doe from ABC Construction, phone 555-1234, email john@abc.com"
              </p>
            </div>
            {voiceTranscript && (
              <div className="p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl">
                <p className="text-sm text-white">{voiceTranscript}</p>
              </div>
            )}
          </div>
        );

      case 'paste':
        return (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste anything with contact information
              </label>
              <textarea
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                onPaste={(e) => {
                  // Auto-process on paste
                  setTimeout(() => {
                    if (e.target.value.trim()) {
                      handleSmartPaste();
                    }
                  }, 100);
                }}
                placeholder="Paste email signatures, business card text, contact lists, meeting notes, etc."
                className="w-full h-48 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                AI will automatically extract names, emails, phones, companies, and addresses
              </p>
            </div>
            <button
              onClick={handleSmartPaste}
              disabled={!pasteInput.trim() || loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
            >
              Extract Contacts
            </button>
          </div>
        );

      case 'photo':
        return (
          <div className="p-6 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="sr-only"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#3a3a3a] rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Camera className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-white font-medium mb-2">Click to upload photos</p>
              <p className="text-sm text-gray-500">
                Business cards, whiteboards, contact lists, or any image with text
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-xs text-yellow-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Photo OCR is in beta. For best results, ensure text is clear and well-lit.
              </p>
            </div>
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
                Connect your email account to automatically extract contacts from recent conversations
              </p>
              <button
                onClick={handleEmailImport}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              >
                Extract from Recent Emails
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Demo mode: Shows sample email contacts
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
              <h3 className="text-lg font-medium text-white mb-2">Calendar Contact Import</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                Import contacts from your recent meetings and calendar events
              </p>
              <button
                onClick={handleCalendarImport}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
              >
                Import from Calendar
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Demo mode: Shows sample meeting contacts
              </p>
            </div>
          </div>
        );

      case 'quickbooks':
        return (
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600/20 to-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">QuickBooks Customer Import</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                Import your customers directly from QuickBooks accounting software
              </p>
              <button
                onClick={handleQuickBooksImport}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200"
              >
                Import from QuickBooks
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Demo mode: Shows sample QuickBooks customers
              </p>
            </div>
          </div>
        );

      case 'location':
      case 'contacts':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-white font-medium mb-2">Coming Soon</p>
              <p className="text-sm text-gray-500">
                This import method requires additional integration setup.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderImportResults = () => {
    if (!importResults) return null;

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">
              Found {importResults.clients.length} Contact{importResults.clients.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-500">Source: {importResults.source}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-400">
                {Math.round(importResults.confidence * 100)}% Confidence
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {importResults.clients.map((client, index) => (
            <div key={index} className="p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">{client.name || 'No Name'}</p>
                  {client.company_name && (
                    <p className="text-sm text-gray-400">{client.company_name}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        {client.phone}
                      </span>
                    )}
                    {client.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {client.address}
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
              setVoiceTranscript('');
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
                Import {importResults.clients.length} Contact{importResults.clients.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    console.log('MagicImportModal not rendering - isOpen is false');
    return null;
  }

  return (
    <>
      {/* Main Import Modal - hide when showing duplicates */}
      {!showDuplicateModal && (
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
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">Magic Import</h2>
                    <p className="text-sm text-gray-500">Choose how you'd like to import contacts</p>
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
                  setVoiceTranscript('');
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
      )}

      {/* Duplicate Detection Modal - show separately */}
      {showDuplicateModal && importResults && (
        <DuplicateDetectionModal
          isOpen={true}
          onClose={() => {
            setShowDuplicateModal(false);
            // Don't clear import results so user can go back
          }}
          newClients={importResults.clients}
          existingClients={existingClients}
          onProceed={handleDuplicateProceed}
        />
      )}
    </>
  );
};