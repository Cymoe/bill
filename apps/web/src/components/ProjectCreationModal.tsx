import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/format';
import { X, Calendar, MapPin, DollarSign, User, Building } from 'lucide-react';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
  servicePackage: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    level?: 'essentials' | 'complete' | 'deluxe';
    duration_hours?: number;
    includes_warranty?: boolean;
    items?: any[];
  };
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  servicePackage
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: `${servicePackage.name} Project`,
    description: servicePackage.description || '',
    client_id: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: servicePackage.base_price,
    status: 'planning' as 'planning' | 'active' | 'completed' | 'on-hold'
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      // Set default dates
      const today = new Date();
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
      
      setFormData(prev => ({
        ...prev,
        start_date: today.toISOString().split('T')[0],
        end_date: twoWeeksFromNow.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user?.id)
        .order('name');

      if (!error) {
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const createProjectFromTemplate = async () => {
    try {
      setLoading(true);

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: formData.name,
          description: formData.description,
          client_id: formData.client_id,
          location: formData.location,
          start_date: formData.start_date,
          end_date: formData.end_date,
          budget: formData.budget,
          status: formData.status,
          work_pack_template_id: servicePackage.id,
          user_id: user?.id
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Copy tasks from template
      if (servicePackage.tasks && servicePackage.tasks.length > 0) {
        const projectTasks = servicePackage.tasks.map(task => ({
          title: task.title,
          description: task.description,
          estimated_hours: task.estimated_hours,
          status: 'pending',
          priority: 'medium',
          project_id: project.id,
          user_id: user?.id,
          sequence_order: task.sequence_order,
          category: task.category
        }));

        const { error: tasksError } = await supabase
          .from('tasks')
          .insert(projectTasks);

        if (tasksError) {
          console.error('Error copying tasks:', tasksError);
        }
      }


      // TODO: Copy service package items when service_package_items table is available
      // This will include loading the service options and line items

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess(project.id);
      } else {
        // Redirect to the new project
        window.location.href = `/projects/${project.id}`;
      }
      
    } catch (error) {
      console.error('Error creating project from template:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectFromTemplate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Project from Template</h2>
            <p className="text-sm text-gray-400 mt-1">
              Using template: <span className="text-[#F9D71C]">{servicePackage.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Template Preview */}
        <div className="p-6 border-b border-[#2a2a2a] bg-[#111827]/30">
          <h3 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">
            Template Will Include
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-[#111827]/50 rounded-[4px] p-3">
              <div className="text-lg font-bold text-white capitalize">{servicePackage.level || 'Standard'}</div>
              <div className="text-xs text-gray-400">Level</div>
            </div>
            <div className="bg-[#111827]/50 rounded-[4px] p-3">
              <div className="text-lg font-bold text-white">{servicePackage.duration_hours || 0}h</div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
            <div className="bg-[#111827]/50 rounded-[4px] p-3">
              <div className="text-lg font-bold text-white">{servicePackage.includes_warranty ? 'Yes' : 'No'}</div>
              <div className="text-xs text-gray-400">Warranty</div>
            </div>
            <div className="bg-[#111827]/50 rounded-[4px] p-3">
              <div className="text-lg font-bold text-[#F9D71C]">{formatCurrency(servicePackage.base_price)}</div>
              <div className="text-xs text-gray-400">Base Price</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
              required
            />
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Client *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699]"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="123 Main St, City, State"
              className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699]"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Budget
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              step="0.01"
              className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Based on template base price: {formatCurrency(servicePackage.base_price)}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699]"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-[#111827]/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] resize-none"
              placeholder="Additional details about this project..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.client_id}
              className="flex items-center gap-2 px-6 py-2 bg-[#F9D71C] text-black rounded-[4px] hover:bg-[#E6C419] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Building className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 