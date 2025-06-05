import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { X, Calendar, Percent, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client_id: string;
  budget: number;
  status: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface ProgressBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
  projectId?: string;
}

interface MilestoneTemplate {
  name: string;
  percentage: number;
  description: string;
}

const defaultMilestones: MilestoneTemplate[] = [
  { name: 'Project Start', percentage: 25, description: 'Initial payment upon project commencement' },
  { name: 'Materials Delivered', percentage: 25, description: 'Payment upon delivery of materials' },
  { name: 'Rough-In Complete', percentage: 25, description: 'Payment upon completion of rough work' },
  { name: 'Project Completion', percentage: 25, description: 'Final payment upon project completion' },
];

export const ProgressBillingModal: React.FC<ProgressBillingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Form state
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [milestoneName, setMilestoneName] = useState('');
  const [milestonePercentage, setMilestonePercentage] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [usePercentage, setUsePercentage] = useState(true);
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  
  // Calculated values
  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const selectedClient = clients.find(c => c.id === selectedProjectData?.client_id);
  const calculatedAmount = usePercentage && selectedProjectData?.budget && milestonePercentage 
    ? (selectedProjectData.budget * parseFloat(milestonePercentage)) / 100 
    : parseFloat(customAmount) || 0;

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [projectId]);

  // Auto-calculate due date based on payment terms
  useEffect(() => {
    if (issueDate && paymentTerms) {
      const issue = new Date(issueDate);
      let daysToAdd = 30; // Default
      
      if (paymentTerms === 'Net 15') daysToAdd = 15;
      if (paymentTerms === 'Net 30') daysToAdd = 30;
      if (paymentTerms === 'Net 60') daysToAdd = 60;
      if (paymentTerms === 'Due on Receipt') daysToAdd = 0;
      
      const due = new Date(issue);
      due.setDate(due.getDate() + daysToAdd);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [issueDate, paymentTerms]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [projectsRes, clientsRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user?.id)
          .order('name'),
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', user?.id)
      ]);
      
      if (projectsRes.error) throw projectsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      
      setProjects(projectsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneSelect = (milestone: MilestoneTemplate) => {
    setMilestoneName(milestone.name);
    setMilestonePercentage(milestone.percentage.toString());
    setDescription(milestone.description);
    setUsePercentage(true);
  };

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_invoice_number', { org_id: user?.id });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      return `INV-${Date.now().toString().slice(-6)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !milestoneName || calculatedAmount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();
      
      // Create the progress invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user?.id,
          client_id: selectedProjectData?.client_id,
          project_id: selectedProject,
          invoice_number: invoiceNumber,
          amount: calculatedAmount,
          balance_due: calculatedAmount,
          status: 'draft',
          issue_date: issueDate,
          due_date: dueDate,
          description: description,
          payment_terms: paymentTerms,
          is_progress_billing: true,
          project_milestone: milestoneName,
          milestone_percentage: usePercentage ? parseFloat(milestonePercentage) : null,
          parent_project_value: selectedProjectData?.budget
        })
        .select()
        .single();
        
      if (invoiceError) throw invoiceError;
      
      // Success - close modal and navigate
      onSuccess(invoice.id);
      handleClose();
      
    } catch (error) {
      console.error('Error creating progress invoice:', error);
      alert('Failed to create progress invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedProject(projectId || '');
    setMilestoneName('');
    setMilestonePercentage('');
    setCustomAmount('');
    setUsePercentage(true);
    setDescription('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setPaymentTerms('Net 30');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-bold text-white">Create Progress Invoice</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded-[4px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
              required
              disabled={!!projectId}
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {formatCurrency(project.budget || 0)}
                </option>
              ))}
            </select>
            {selectedClient && (
              <div className="text-xs text-gray-400 mt-1">
                Client: {selectedClient.name}
              </div>
            )}
          </div>

          {/* Milestone Templates */}
          {selectedProject && (
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Quick Milestones
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {defaultMilestones.map((milestone, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMilestoneSelect(milestone)}
                    className="p-3 bg-[#333333] border border-[#555555] rounded-[4px] text-left hover:border-[#336699] transition-colors"
                  >
                    <div className="text-white font-medium text-sm">{milestone.name}</div>
                    <div className="text-[#336699] text-sm">{milestone.percentage}%</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milestone Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Milestone Name */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Milestone Name
              </label>
              <input
                type="text"
                value={milestoneName}
                onChange={(e) => setMilestoneName(e.target.value)}
                className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                placeholder="e.g., Project Start, Rough-In Complete"
                required
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>

          {/* Amount Calculation */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Invoice Amount
            </label>
            
            {/* Toggle between percentage and fixed amount */}
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={usePercentage}
                  onChange={() => setUsePercentage(true)}
                  className="mr-2"
                />
                <span className="text-white text-sm">Percentage of Project</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!usePercentage}
                  onChange={() => setUsePercentage(false)}
                  className="mr-2"
                />
                <span className="text-white text-sm">Fixed Amount</span>
              </label>
            </div>

            {usePercentage ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={milestonePercentage}
                    onChange={(e) => setMilestonePercentage(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                    placeholder="25.0"
                    required={usePercentage}
                  />
                </div>
                <div className="bg-[#2a2a2a] border border-[#444444] rounded-[4px] px-4 py-2 flex items-center">
                  <span className="text-white font-mono">
                    {calculatedAmount > 0 ? formatCurrency(calculatedAmount) : '$0.00'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                  placeholder="0.00"
                  required={!usePercentage}
                />
              </div>
            )}
            
            {selectedProjectData?.budget && usePercentage && milestonePercentage && (
              <div className="text-xs text-gray-400 mt-2">
                {milestonePercentage}% of {formatCurrency(selectedProjectData.budget)} project budget
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
              rows={3}
              placeholder="Describe the milestone or work completed..."
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issue Date */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Issue Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#333333] border border-[#555555] rounded-[4px] text-white focus:border-[#336699] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {calculatedAmount > 0 && (
            <div className="bg-[#336699]/10 border border-[#336699]/20 rounded-[4px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-[#336699]" />
                <span className="text-[#336699] font-medium text-sm">Invoice Summary</span>
              </div>
              <div className="text-white">
                <div className="text-sm">
                  <strong>{milestoneName}</strong> for <strong>{selectedProjectData?.name}</strong>
                </div>
                <div className="text-lg font-mono font-bold mt-1">
                  {formatCurrency(calculatedAmount)}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-transparent border border-[#555555] text-white rounded-[4px] hover:bg-[#333333] transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2a5580] transition-colors disabled:opacity-50"
              disabled={saving || calculatedAmount <= 0}
            >
              {saving ? 'Creating...' : 'Create Progress Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 