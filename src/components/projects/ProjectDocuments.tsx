import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Check, Clock, Edit3, Eye, Download, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectDocument {
  id: string;
  project_id: string;
  document_template_id: string | null;
  name: string;
  type: 'scope_of_work' | 'contract_clause_set' | 'safety_checklist' | 'change_order_form' | 'other';
  content: string;
  status: 'draft' | 'in_review' | 'approved' | 'signed' | 'completed';
  signed_at: string | null;
  signed_by: string | null;
  client_signed_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ProjectDocumentsProps {
  projectId: string;
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order');

      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'scope_of_work':
        return '📋';
      case 'contract_clause_set':
        return '📄';
      case 'safety_checklist':
        return '⚠️';
      case 'change_order_form':
        return '🔄';
      default:
        return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/10 text-gray-400';
      case 'in_review':
        return 'bg-blue-500/10 text-blue-400';
      case 'approved':
        return 'bg-green-500/10 text-green-400';
      case 'signed':
        return 'bg-[#fbbf24]/10 text-[#fbbf24]';
      case 'completed':
        return 'bg-green-600/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit3 className="w-3 h-3" />;
      case 'in_review':
        return <Clock className="w-3 h-3" />;
      case 'approved':
      case 'signed':
      case 'completed':
        return <Check className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleSave = async () => {
    if (!selectedDocument) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('project_documents')
        .update({ 
          content: editedContent,
          status: 'draft' // Reset to draft when edited
        })
        .eq('id', selectedDocument.id);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, content: editedContent, status: 'draft' as const }
          : doc
      ));
      
      setSelectedDocument({ ...selectedDocument, content: editedContent, status: 'draft' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (documentId: string, newStatus: ProjectDocument['status']) => {
    try {
      const updateData: any = { status: newStatus };
      
      // Add timestamp for signed status
      if (newStatus === 'signed') {
        updateData.signed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('project_documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, ...updateData }
          : doc
      ));
      
      if (selectedDocument?.id === documentId) {
        setSelectedDocument({ ...selectedDocument, ...updateData });
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('Failed to update document status');
    }
  };

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#fbbf24] animate-pulse relative">
          <div className="absolute inset-1 bg-[#fbbf24] opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document List */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-lg">
        <div className="px-6 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Project Documents</h3>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No documents available for this project</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedDocument(doc);
                  setEditedContent(doc.content);
                  setIsEditing(false);
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                  <div>
                    <h4 className="text-sm font-medium text-white">{doc.name}</h4>
                    <p className="text-xs text-gray-500">
                      {formatDocumentType(doc.type)} • Updated {formatDistanceToNow(new Date(doc.updated_at))} ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {getStatusIcon(doc.status)}
                    {doc.status.replace('_', ' ')}
                  </span>
                  <Eye className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Viewer/Editor Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setSelectedDocument(null)}>
          <div className="fixed inset-4 md:inset-10 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getDocumentIcon(selectedDocument.type)}</span>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedDocument.name}</h2>
                  <p className="text-sm text-gray-500">{formatDocumentType(selectedDocument.type)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Status Selector */}
                <select
                  value={selectedDocument.status}
                  onChange={(e) => updateStatus(selectedDocument.id, e.target.value as ProjectDocument['status'])}
                  className="px-3 py-1.5 bg-[#111] border border-[#2a2a2a] rounded-lg text-sm text-white focus:outline-none focus:border-[#3a3a3a]"
                  disabled={isEditing}
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="signed">Signed</option>
                  <option value="completed">Completed</option>
                </select>

                {/* Edit/Save Button */}
                {!isEditing ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="px-4 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors"
                  >
                    <Edit3 className="w-4 h-4 inline mr-1.5" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-1.5 bg-[#fbbf24] text-black rounded-lg text-sm font-medium hover:bg-[#f59e0b] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(selectedDocument.content);
                      }}
                      className="px-4 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg text-sm hover:bg-[#2a2a2a] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="w-9 h-9 rounded-lg bg-transparent border border-[#2a2a2a] text-gray-500 hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all duration-200 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full p-4 bg-[#111] border border-[#2a2a2a] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#3a3a3a] resize-none"
                  placeholder="Enter document content..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap font-sans text-gray-300">
                    {selectedDocument.content}
                  </div>
                </div>
              )}
            </div>

            {/* Document Footer */}
            {selectedDocument.signed_at && (
              <div className="px-6 py-3 border-t border-[#2a2a2a] bg-[#111]">
                <div className="flex items-center gap-2 text-sm text-[#fbbf24]">
                  <Check className="w-4 h-4" />
                  <span>Signed on {new Date(selectedDocument.signed_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocuments; 