import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Check, Sparkles, ChevronRight, Package, FileText, DollarSign, Calendar, AlertCircle, Loader2, Zap, Building, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizationContext } from '../layouts/DashboardLayout';
import { formatCurrency } from '../../utils/format';
import { WorkPackService } from '../../services/WorkPackService';
import { DocumentTemplateService } from '../../services/DocumentTemplateService';
import { ActivityLogService } from '../../services/ActivityLogService';
import { IndustryWorkPackTemplates } from '../work-packs/IndustryWorkPackTemplates';
import type { Tables } from '../../lib/database';

interface EnhancedProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface WizardStep {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

interface ProjectType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  industry_id: string;
}

interface WorkPack {
  id: string;
  name: string;
  description?: string;
  industry_id: string;
  project_type_id?: string;
  tier?: 'budget' | 'standard' | 'premium';
  base_price: number;
  estimated_hours: number;
  typical_duration_days: number;
  included_items?: string[];
  required_permits?: string[];
  key_tasks?: string[];
  items?: any[];
  tasks?: any[];
  documents?: any[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  quantity?: number;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  estimated_hours: number;
  priority?: 'low' | 'medium' | 'high';
}

interface Document {
  id: string;
  name: string;
  type: string;
  template_id?: string;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, name: 'Industry', description: 'Select your industry', icon: <Building className="w-5 h-5" /> },
  { id: 2, name: 'Project Type', description: 'Choose project category', icon: <Briefcase className="w-5 h-5" /> },
  { id: 3, name: 'Work Pack', description: 'Choose your work pack', icon: <Package className="w-5 h-5" /> },
  { id: 4, name: 'Configuration', description: 'Products, tasks & documents', icon: <Zap className="w-5 h-5" /> },
  { id: 5, name: 'Details', description: 'Project info & timeline', icon: <FileText className="w-5 h-5" /> },
  { id: 6, name: 'Review', description: 'Confirm and create', icon: <Check className="w-5 h-5" /> }
];

export const EnhancedProjectWizard: React.FC<EnhancedProjectWizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  
  // Step 1: Industry & Type
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  
  // Step 2: Work Pack
  const [selectedWorkPack, setSelectedWorkPack] = useState<WorkPack | null>(null);
  const [workPackCustomizations, setWorkPackCustomizations] = useState({
    includeAllProducts: true,
    includeAllTasks: true,
    includeAllDocuments: true,
    customMarkup: 0
  });
  
  // Step 3: Configuration
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [estimateConfig, setEstimateConfig] = useState({
    generateEstimate: true,
    includeDeposit: true,
    depositPercentage: 30,
    paymentTerms: 'net30'
  });
  
  // Step 4: Project Details
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    client_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
    notes: ''
  });
  const [clients, setClients] = useState<Tables['clients'][]>([]);
  
  // Calculated values
  const [projectBudget, setProjectBudget] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (isOpen && selectedOrg?.id) {
      loadInitialData();
    }
  }, [isOpen, selectedOrg?.id]);

  useEffect(() => {
    // Calculate project budget based on selected products
    if (selectedProducts.length > 0) {
      const total = selectedProducts.reduce((sum, product) => {
        const quantity = product.quantity || 1;
        const price = product.price || 0;
        return sum + (quantity * price);
      }, 0);
      
      // Apply custom markup if any
      const markupMultiplier = 1 + (workPackCustomizations.customMarkup / 100);
      setProjectBudget(total * markupMultiplier);
    }
  }, [selectedProducts, workPackCustomizations.customMarkup]);

  useEffect(() => {
    // Calculate estimated duration based on tasks
    if (selectedTasks.length > 0) {
      const totalHours = selectedTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
      const workDays = Math.ceil(totalHours / 8); // Assuming 8-hour work days
      setEstimatedDuration(workDays);
      
      // Auto-set end date if start date is set
      if (projectDetails.start_date && workDays > 0) {
        const startDate = new Date(projectDetails.start_date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + workDays);
        setProjectDetails(prev => ({ ...prev, end_date: endDate.toISOString().split('T')[0] }));
      }
    }
  }, [selectedTasks, projectDetails.start_date]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setLoadingMessage('Loading data...');
    
    try {
      // Load organization's industries
      const { data: orgIndustries } = await supabase
        .from('organization_industries')
        .select('industry:industries(*)')
        .eq('organization_id', selectedOrg!.id);
      
      const industriesList = orgIndustries?.map(item => item.industry).filter(Boolean) || [];
      setIndustries(industriesList);
      
      // Load project types
      const { data: types } = await supabase
        .from('project_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      setProjectTypes(types || []);
      
      // Load clients
      const { data: clientsList } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrg!.id)
        .order('name');
      
      setClients(clientsList || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const loadWorkPackConfiguration = async (workPack: any) => {
    setIsLoading(true);
    setLoadingMessage('Loading work pack details...');
    
    try {
      // Load full work pack data
      const fullWorkPack = await WorkPackService.getById(workPack.id);
      if (!fullWorkPack) return;
      
      // Load products from work pack
      const products = fullWorkPack.items?.map(item => ({
        ...item.product || item.line_item,
        quantity: item.quantity,
        work_pack_price: item.price
      })) || [];
      setSelectedProducts(products);
      
      // Load tasks
      const tasks = fullWorkPack.tasks || [];
      setSelectedTasks(tasks);
      
      // Load document templates
      const { data: workPackDocs } = await supabase
        .from('work_pack_document_templates')
        .select('*, document_template:document_templates(*)')
        .eq('work_pack_id', workPack.id);
      
      const documents = workPackDocs?.map(doc => doc.document_template).filter(Boolean) || [];
      setSelectedDocuments(documents);
      
      // Set initial project name based on work pack
      setProjectDetails(prev => ({
        ...prev,
        name: workPack.name,
        description: workPack.description || ''
      }));
    } catch (error) {
      console.error('Error loading work pack configuration:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCreateProject = async () => {
    if (!user?.id || !selectedOrg?.id) return;
    
    setIsCreating(true);
    setLoadingMessage('Creating project...');
    
    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectDetails.name,
          description: projectDetails.description,
          client_id: projectDetails.client_id,
          organization_id: selectedOrg.id,
          user_id: user.id,
          status: 'active',
          budget: projectBudget,
          start_date: projectDetails.start_date,
          end_date: projectDetails.end_date,
          category: selectedProjectType,
          metadata: {
            industry_id: selectedIndustry,
            work_pack_id: selectedWorkPack?.id,
            auto_generated: true
          }
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Create estimate if configured
      if (estimateConfig.generateEstimate) {
        setLoadingMessage('Generating estimate...');
        
        const estimateItems = selectedProducts.map(product => ({
          product_id: product.id,
          description: product.name,
          quantity: product.quantity || 1,
          unit_price: product.price,
          total_price: (product.quantity || 1) * product.price
        }));
        
        const { data: estimate, error: estimateError } = await supabase
          .from('estimates')
          .insert({
            organization_id: selectedOrg.id,
            project_id: project.id,
            client_id: projectDetails.client_id,
            status: 'draft',
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            subtotal: projectBudget,
            tax_rate: 0,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: projectBudget,
            notes: projectDetails.notes,
            payment_terms: estimateConfig.paymentTerms
          })
          .select()
          .single();
        
        if (estimateError) throw estimateError;
        
        // Add estimate items
        if (estimateItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('estimate_items')
            .insert(estimateItems.map(item => ({
              ...item,
              estimate_id: estimate.id
            })));
          
          if (itemsError) console.error('Error creating estimate items:', itemsError);
        }
      }
      
      // Create tasks
      if (selectedTasks.length > 0) {
        setLoadingMessage('Creating tasks...');
        
        const { error: tasksError } = await supabase
          .from('project_tasks')
          .insert(selectedTasks.map((task, index) => ({
            project_id: project.id,
            title: task.title || task.description,
            description: task.description,
            estimated_hours: task.estimated_hours,
            status: 'pending',
            display_order: task.display_order || index
          })));
        
        if (tasksError) console.error('Error creating tasks:', tasksError);
      }
      
      // Generate documents
      if (selectedDocuments.length > 0) {
        setLoadingMessage('Generating documents...');
        
        for (const template of selectedDocuments) {
          try {
            const variables = {
              project_name: project.name,
              client_name: clients.find(c => c.id === projectDetails.client_id)?.name || '',
              start_date: projectDetails.start_date,
              end_date: projectDetails.end_date,
              total_price: projectBudget,
              contractor_name: selectedOrg.name
              // Add more variables as needed
            };
            
            await DocumentTemplateService.generateDocument(
              template.id,
              variables,
              project.id,
              selectedOrg.id
            );
          } catch (docError) {
            console.error('Error generating document:', docError);
          }
        }
      }
      
      // Log activity
      await ActivityLogService.log({
        organizationId: selectedOrg.id,
        entityType: 'project',
        entityId: project.id,
        action: 'created',
        description: `Created project "${project.name}" with automated setup`,
        metadata: {
          work_pack_id: selectedWorkPack?.id,
          products_count: selectedProducts.length,
          tasks_count: selectedTasks.length,
          documents_count: selectedDocuments.length,
          budget: projectBudget
        }
      });
      
      setLoadingMessage('Project created successfully!');
      
      setTimeout(() => {
        onSuccess?.();
        navigate(`/projects/${project.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
      setLoadingMessage('');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Industry Selection
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Your Industry</h3>
              <p className="text-sm text-gray-400 mb-6">
                Choose the industry that best represents your business
              </p>
              <div className="grid grid-cols-2 gap-4">
                {industries.map(industry => (
                  <button
                    key={industry.id}
                    onClick={() => {
                      setSelectedIndustry(industry.id);
                      setSelectedProjectType(''); // Reset project type when industry changes
                    }}
                    className={`p-6 rounded-lg border-2 transition-all text-left
                      ${selectedIndustry === industry.id
                        ? 'bg-[#0f1729] border-[#fbbf24] shadow-lg shadow-[#fbbf24]/20'
                        : 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{industry.icon}</span>
                      <div>
                        <div className="font-medium text-white text-lg">{industry.name}</div>
                        <div className="text-sm text-gray-400 mt-1">{industry.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Project Type Selection
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">What Type of Project?</h3>
              <p className="text-sm text-gray-400 mb-6">
                Select the category that best describes your project
              </p>
              <div className="grid grid-cols-2 gap-4">
                {projectTypes
                  .filter(type => type.industry_id === selectedIndustry)
                  .map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedProjectType(type.id)}
                      className={`p-6 rounded-lg border-2 transition-all text-left
                        ${selectedProjectType === type.id
                          ? 'bg-[#0f1729] border-[#fbbf24] shadow-lg shadow-[#fbbf24]/20'
                          : 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}
                    >
                      <div>
                        <div className="font-medium text-white text-lg">{type.name}</div>
                        <div className="text-sm text-gray-400 mt-2">{type.description}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      case 3: // Work Pack Selection
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Select Work Pack</h3>
              <p className="text-sm text-gray-400 mb-6">
                Choose a pre-configured work pack or create a custom project
              </p>
            </div>

            <IndustryWorkPackTemplates
              selectedIndustry={selectedIndustry}
              selectedProjectType={selectedProjectType}
              organizationId={selectedOrg!.id}
              onSelectWorkPack={(workPack) => {
                setSelectedWorkPack(workPack);
                loadWorkPackConfiguration(workPack);
              }}
            />

            <div className="border-t border-[#2a2a2a] pt-6">
              <button
                onClick={() => {
                  setSelectedWorkPack({ id: 'custom', name: 'Custom Project' });
                  setSelectedProducts([]);
                  setSelectedTasks([]);
                  setSelectedDocuments([]);
                }}
                className={`w-full p-4 rounded-lg border-2 transition-all
                  ${selectedWorkPack?.id === 'custom'
                    ? 'bg-[#0f1729] border-[#fbbf24]'
                    : 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a]'}`}
              >
                <div className="text-center">
                  <div className="font-medium text-white">Start from Scratch</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Create a custom project without a template
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 4: // Configuration
        return (
          <div className="space-y-6">
            {/* Products Section */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Products & Services</h3>
                <span className="text-sm text-gray-400">
                  {selectedProducts.length} items • {formatCurrency(projectBudget)}
                </span>
              </div>
              
              {selectedProducts.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded">
                      <div className="flex-1">
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">
                          {product.quantity} × {formatCurrency(product.price)} = {formatCurrency(product.quantity * product.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = [...selectedProducts];
                          updated[index].quantity = (updated[index].quantity || 1) + 1;
                          setSelectedProducts(updated);
                        }}
                        className="px-2 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded text-sm"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No products selected</p>
              )}
            </div>

            {/* Tasks Section */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tasks</h3>
                <span className="text-sm text-gray-400">
                  {selectedTasks.length} tasks • {estimatedDuration} days
                </span>
              </div>
              
              {selectedTasks.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded">
                      <div className="flex-1">
                        <div className="font-medium text-white">{task.title || task.description}</div>
                        <div className="text-sm text-gray-400">{task.estimated_hours} hours</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No tasks configured</p>
              )}
            </div>

            {/* Documents Section */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Documents</h3>
                <span className="text-sm text-gray-400">{selectedDocuments.length} templates</span>
              </div>
              
              {selectedDocuments.length > 0 ? (
                <div className="space-y-2">
                  {selectedDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-white">{doc.name}</div>
                        <div className="text-sm text-gray-400">{doc.document_type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents selected</p>
              )}
            </div>

            {/* Estimate Configuration */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estimate Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={estimateConfig.generateEstimate}
                    onChange={(e) => setEstimateConfig(prev => ({ ...prev, generateEstimate: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-white">Generate estimate automatically</span>
                </label>
                
                {estimateConfig.generateEstimate && (
                  <>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={estimateConfig.includeDeposit}
                        onChange={(e) => setEstimateConfig(prev => ({ ...prev, includeDeposit: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-white">Include deposit requirement</span>
                    </label>
                    
                    {estimateConfig.includeDeposit && (
                      <div className="flex items-center gap-3 ml-7">
                        <input
                          type="number"
                          value={estimateConfig.depositPercentage}
                          onChange={(e) => setEstimateConfig(prev => ({ ...prev, depositPercentage: parseInt(e.target.value) }))}
                          className="w-20 px-3 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white"
                          min="0"
                          max="100"
                        />
                        <span className="text-gray-400">% deposit</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 5: // Project Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectDetails.name}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
                <select
                  value={projectDetails.client_id}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={projectDetails.start_date}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={projectDetails.end_date}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={projectDetails.description}
                onChange={(e) => setProjectDetails(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white h-32"
                placeholder="Project description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Internal Notes</label>
              <textarea
                value={projectDetails.notes}
                onChange={(e) => setProjectDetails(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white h-20"
                placeholder="Notes for your team..."
              />
            </div>
          </div>
        );

      case 6: // Review
        return (
          <div className="space-y-6">
            <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Project Name</span>
                  <span className="text-white font-medium">{projectDetails.name}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Client</span>
                  <span className="text-white">{clients.find(c => c.id === projectDetails.client_id)?.name || 'Not selected'}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Timeline</span>
                  <span className="text-white">{projectDetails.start_date} to {projectDetails.end_date}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Budget</span>
                  <span className="text-[#fbbf24] font-semibold text-lg">{formatCurrency(projectBudget)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Products & Services</span>
                  <span className="text-white">{selectedProducts.length} items</span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-400">Tasks</span>
                  <span className="text-white">{selectedTasks.length} tasks ({estimatedDuration} days)</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Documents</span>
                  <span className="text-white">{selectedDocuments.length} templates</span>
                </div>
              </div>
            </div>

            {estimateConfig.generateEstimate && (
              <div className="bg-[#0f1729] border border-[#fbbf24]/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-[#fbbf24] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-white">Estimate will be generated</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      An estimate will be automatically created with all selected products
                      {estimateConfig.includeDeposit && ` and a ${estimateConfig.depositPercentage}% deposit requirement`}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-900/20 border border-yellow-600/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-300">Ready to create project?</h4>
                  <p className="text-sm text-yellow-200/80 mt-1">
                    This will create the project, generate all associated documents, tasks, and estimates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedIndustry !== '';
      case 2: return selectedProjectType !== '';
      case 3: return selectedWorkPack !== null;
      case 4: return true; // Configuration is optional
      case 5: return projectDetails.name && projectDetails.client_id;
      case 6: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]">
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Create Project with AI Assistant</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Let's build your project with industry-specific templates and automation
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between mt-8">
              {WIZARD_STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center ${currentStep >= step.id ? 'text-[#fbbf24]' : 'text-gray-600'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                      ${currentStep >= step.id 
                        ? 'border-[#fbbf24] bg-[#fbbf24] text-black' 
                        : 'border-gray-600 bg-transparent'}`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.icon}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">{step.name}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-all
                      ${currentStep > step.id ? 'bg-[#fbbf24]' : 'bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-[#fbbf24] mb-4" />
                <p className="text-gray-400">{loadingMessage}</p>
              </div>
            ) : (
              renderStepContent()
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium transition-all
                  ${currentStep === 1
                    ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                    : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'}`}
              >
                Back
              </button>

              <div className="flex items-center gap-4">
                {currentStep === 6 ? (
                  <button
                    onClick={handleCreateProject}
                    disabled={!canProceed() || isCreating}
                    className={`px-8 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                      ${canProceed() && !isCreating
                        ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
                        : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'}`}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Project
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className={`px-8 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                      ${canProceed()
                        ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
                        : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'}`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};