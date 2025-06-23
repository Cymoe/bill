import React, { useState } from 'react';
import { AlertTriangle, Check, X, Users, Mail, Phone, Building2, Merge } from 'lucide-react';
import { Client } from '../../services/ClientService';

interface DuplicateDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newClients: Client[];
  existingClients: Client[];
  onProceed: (clientsToImport: Client[], clientsToMerge: Array<{new: Client, existing: Client}>) => void;
}

interface DuplicateMatch {
  newClient: Client;
  existingClient: Client;
  matchType: 'email' | 'phone' | 'name' | 'company';
  confidence: number;
}

export const DuplicateDetectionModal: React.FC<DuplicateDetectionModalProps> = ({
  isOpen,
  onClose,
  newClients,
  existingClients,
  onProceed
}) => {
  const [selectedAction, setSelectedAction] = useState<Record<string, 'skip' | 'import' | 'merge'>>({});
  const [selectedMergeTargets, setSelectedMergeTargets] = useState<Record<string, string>>({});

  // Find potential duplicates
  const findDuplicates = (): DuplicateMatch[] => {
    const duplicates: DuplicateMatch[] = [];
    
    for (const newClient of newClients) {
      for (const existing of existingClients) {
        let confidence = 0;
        let matchType: 'email' | 'phone' | 'name' | 'company' | null = null;
        
        // Email match (highest confidence)
        if (newClient.email && existing.email && 
            newClient.email.toLowerCase() === existing.email.toLowerCase()) {
          confidence = 0.95;
          matchType = 'email';
        }
        // Phone match (high confidence)
        else if (newClient.phone && existing.phone) {
          const newPhone = newClient.phone.replace(/\D/g, '');
          const existingPhone = existing.phone.replace(/\D/g, '');
          if (newPhone === existingPhone && newPhone.length >= 10) {
            confidence = 0.85;
            matchType = 'phone';
          }
        }
        // Name match with company
        else if (newClient.name && existing.name && 
                 newClient.company_name && existing.company_name) {
          const nameMatch = newClient.name.toLowerCase() === existing.name.toLowerCase();
          const companyMatch = newClient.company_name.toLowerCase() === existing.company_name.toLowerCase();
          if (nameMatch && companyMatch) {
            confidence = 0.8;
            matchType = 'name';
          } else if (nameMatch || companyMatch) {
            confidence = 0.5;
            matchType = nameMatch ? 'name' : 'company';
          }
        }
        // Just name match
        else if (newClient.name && existing.name && 
                 newClient.name.toLowerCase() === existing.name.toLowerCase()) {
          confidence = 0.6;
          matchType = 'name';
        }
        
        if (matchType && confidence > 0.5) {
          duplicates.push({
            newClient,
            existingClient: existing,
            matchType,
            confidence
          });
          break; // Only match with first duplicate found
        }
      }
    }
    
    return duplicates;
  };

  const duplicates = findDuplicates();
  const duplicateNewClientIds = new Set(duplicates.map(d => d.newClient));
  const nonDuplicates = newClients ? newClients.filter(c => !duplicateNewClientIds.has(c)) : [];

  const handleProceed = () => {
    if (!onProceed) return;
    
    const clientsToImport: Client[] = [...nonDuplicates];
    const clientsToMerge: Array<{new: Client, existing: Client}> = [];
    
    duplicates.forEach(dup => {
      const clientKey = JSON.stringify(dup.newClient);
      const action = selectedAction[clientKey] || 'skip';
      
      if (action === 'import') {
        clientsToImport.push(dup.newClient);
      } else if (action === 'merge') {
        const targetId = selectedMergeTargets[clientKey];
        const target = existingClients.find(c => c.id === targetId);
        if (target) {
          clientsToMerge.push({ new: dup.newClient, existing: target });
        }
      }
    });
    
    onProceed(clientsToImport, clientsToMerge);
  };

  const getMatchIcon = (matchType: string) => {
    switch (matchType) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'name': return <Users className="w-4 h-4" />;
      case 'company': return <Building2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  if (!isOpen || !newClients || !existingClients) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-[80] p-4">
        <div 
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Duplicate Detection</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Found {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''}
                  </p>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {duplicates.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-white text-lg font-medium">No duplicates detected!</p>
                <p className="text-gray-500 mt-2">All {newClients.length} contacts are unique.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4">
                  <h3 className="text-sm font-medium text-white mb-3">Import Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">New Contacts</p>
                      <p className="text-2xl font-semibold text-white">{newClients.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Potential Duplicates</p>
                      <p className="text-2xl font-semibold text-yellow-400">{duplicates.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unique Contacts</p>
                      <p className="text-2xl font-semibold text-green-400">{nonDuplicates.length}</p>
                    </div>
                  </div>
                </div>

                {/* Duplicate List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Review Duplicates</h3>
                  
                  {duplicates.map((dup, index) => {
                    const clientKey = JSON.stringify(dup.newClient);
                    const action = selectedAction[clientKey] || 'skip';
                    
                    return (
                      <div key={index} className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getMatchIcon(dup.matchType)}
                            <span className={`text-xs px-2 py-1 rounded-lg border ${getConfidenceColor(dup.confidence)}`}>
                              {Math.round(dup.confidence * 100)}% Match
                            </span>
                            <span className="text-xs text-gray-500">
                              Matched by {dup.matchType}
                            </span>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedAction({...selectedAction, [clientKey]: 'skip'})}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                action === 'skip' 
                                  ? 'bg-gray-600 text-white' 
                                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                              }`}
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => setSelectedAction({...selectedAction, [clientKey]: 'import'})}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                action === 'import' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                              }`}
                            >
                              Import Anyway
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAction({...selectedAction, [clientKey]: 'merge'});
                                setSelectedMergeTargets({...selectedMergeTargets, [clientKey]: dup.existingClient.id!});
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                                action === 'merge' 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                              }`}
                            >
                              <Merge className="w-3 h-3" />
                              Merge
                            </button>
                          </div>
                        </div>
                        
                        {/* Comparison */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">New Contact</p>
                            <div className="bg-[#050505] rounded-lg p-3 border border-[#2a2a2a]">
                              <p className="text-sm font-medium text-white">{dup.newClient.name || 'No Name'}</p>
                              {dup.newClient.company_name && (
                                <p className="text-xs text-gray-400">{dup.newClient.company_name}</p>
                              )}
                              {dup.newClient.email && (
                                <p className="text-xs text-blue-400 mt-1">{dup.newClient.email}</p>
                              )}
                              {dup.newClient.phone && (
                                <p className="text-xs text-gray-400">{dup.newClient.phone}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Existing Contact</p>
                            <div className="bg-[#050505] rounded-lg p-3 border border-[#2a2a2a]">
                              <p className="text-sm font-medium text-white">{dup.existingClient.name || 'No Name'}</p>
                              {dup.existingClient.company_name && (
                                <p className="text-xs text-gray-400">{dup.existingClient.company_name}</p>
                              )}
                              {dup.existingClient.email && (
                                <p className="text-xs text-blue-400 mt-1">{dup.existingClient.email}</p>
                              )}
                              {dup.existingClient.phone && (
                                <p className="text-xs text-gray-400">{dup.existingClient.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1a1a1a] flex items-center justify-between bg-[#050505]">
            <div className="text-sm text-gray-500">
              {nonDuplicates.length} will be imported automatically
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Proceed with Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};