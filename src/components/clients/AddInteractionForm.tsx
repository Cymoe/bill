import React, { useState } from 'react';
import { X, Save, Clock, Phone, Mail, Calendar, MapPin, FileText, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useContext } from 'react';
import { OrganizationContext } from '../layouts/DashboardLayout';

interface AddInteractionFormProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddInteractionForm: React.FC<AddInteractionFormProps> = ({
  clientId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    description: '',
    contact_method: 'phone',
    duration_minutes: '',
    interaction_date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
    priority: 'normal',
    outcome: '',
    action_items: '',
    scheduled_follow_up: ''
  });

  const interactionTypes = [
    { value: 'call', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'meeting', label: 'Meeting', icon: <Calendar className="w-4 h-4" /> },
    { value: 'site_visit', label: 'Site Visit', icon: <MapPin className="w-4 h-4" /> },
    { value: 'quote_sent', label: 'Quote Sent', icon: <FileText className="w-4 h-4" /> },
    { value: 'follow_up', label: 'Follow Up', icon: <Clock className="w-4 h-4" /> },
    { value: 'note', label: 'Note', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const contactMethods = [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'in_person', label: 'In Person' },
    { value: 'video_call', label: 'Video Call' },
    { value: 'text', label: 'Text Message' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-400' },
    { value: 'normal', label: 'Normal', color: 'text-white' },
    { value: 'high', label: 'High', color: 'text-[#F9D71C]' },
    { value: 'urgent', label: 'Urgent', color: 'text-[#D32F2F]' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      alert('Please enter a subject for this interaction');
      return;
    }

    try {
      setLoading(true);

      const interactionData = {
        client_id: clientId,
        user_id: user?.id,
        type: formData.type,
        subject: formData.subject,
        description: formData.description || null,
        contact_method: formData.contact_method || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        interaction_date: formData.interaction_date,
        priority: formData.priority,
        outcome: formData.outcome || null,
        action_items: formData.action_items || null,
        scheduled_follow_up: formData.scheduled_follow_up || null,
        status: 'completed',
        organization_id: selectedOrg?.id
      };

      const { error } = await supabase
        .from('client_interactions')
        .insert(interactionData);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating interaction:', error);
      alert('Failed to create interaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E1E1E] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#333]">
        {/* Header */}
        <div className="p-6 border-b border-[#333] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">Add New Interaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Interaction Type */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
              Interaction Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {interactionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('type', type.value)}
                  className={`p-3 rounded border transition-all text-left ${
                    formData.type === type.value
                      ? 'bg-[#336699]/10 border-[#336699] text-[#336699]'
                      : 'bg-[#111] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full h-12 px-4 bg-[#111] border border-[#2a2a2a] rounded 
                       text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] 
                       transition-colors"
              placeholder="Brief description of the interaction"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.interaction_date}
                onChange={(e) => handleChange('interaction_date', e.target.value)}
                className="w-full h-12 px-4 bg-[#111] border border-[#2a2a2a] rounded 
                         text-white focus:outline-none focus:border-[#336699] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full h-12 px-4 bg-[#111] border border-[#2a2a2a] rounded 
                         text-white focus:outline-none focus:border-[#336699] transition-colors"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Method and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Contact Method
              </label>
              <select
                value={formData.contact_method}
                onChange={(e) => handleChange('contact_method', e.target.value)}
                className="w-full h-12 px-4 bg-[#111] border border-[#2a2a2a] rounded 
                         text-white focus:outline-none focus:border-[#336699] transition-colors"
              >
                {contactMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => handleChange('duration_minutes', e.target.value)}
                className="w-full h-12 px-4 bg-[#111] border border-[#2a2a2a] rounded 
                         text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] 
                         transition-colors"
                placeholder="e.g., 30"
                min="1"
                max="999"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full p-4 bg-[#111] border border-[#2a2a2a] rounded 
                       text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] 
                       transition-colors resize-none"
              placeholder="Detailed notes about the interaction..."
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
              Outcome
            </label>
            <textarea
              value={formData.outcome}
              onChange={(e) => handleChange('outcome', e.target.value)}
              rows={3}
              className="w-full p-4 bg-[#111] border border-[#2a2a2a] rounded 
                       text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] 
                       transition-colors resize-none"
              placeholder="What was the result of this interaction?"
            />
          </div>

          {/* Action Items */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
              Action Items
            </label>
            <textarea
              value={formData.action_items}
              onChange={(e) => handleChange('action_items', e.target.value)}
              rows={3}
              className="w-full p-4 bg-[#111] border border-[#2a2a2a] rounded 
                       text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] 
                       transition-colors resize-none"
              placeholder="What needs to be done next?"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium mb-2">
              Scheduled Follow-up
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_follow_up}
              onChange={(e) => handleChange('scheduled_follow_up', e.target.value)}
              className="w-full h-12 px-4 bg-[#111] border border-[#2a2a2a] rounded 
                       text-white focus:outline-none focus:border-[#336699] transition-colors"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[#333] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-gray-400 rounded
                     hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.subject.trim()}
            className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-[#336699]/80 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Interaction
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 