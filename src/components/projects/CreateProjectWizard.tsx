import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Check, Sparkles, Home, Paintbrush, Hammer, Wrench, Building, TreePine, Bath, Package, ChevronLeft, Briefcase, Building2, Zap, Wind, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { ExpenseService } from '../../services/expenseService';

// Project type configurations
const projectTypes = [
  {
    id: 'kitchen-remodel',
    name: 'Kitchen Remodel',
    icon: Home,
    color: 'from-blue-500 to-blue-600',
    description: 'Full kitchen renovation',
    estimatedDuration: '4-8 weeks',
    priceRange: '$15k - $50k+'
  },
  {
    id: 'bathroom-remodel',
    name: 'Bathroom Remodel',
    icon: Bath,
    color: 'from-purple-500 to-purple-600',
    description: 'Complete bathroom renovation',
    estimatedDuration: '2-4 weeks',
    priceRange: '$8k - $25k'
  },
  {
    id: 'flooring',
    name: 'Flooring',
    icon: Package,
    color: 'from-amber-500 to-amber-600',
    description: 'Flooring installation or replacement',
    estimatedDuration: '1-2 weeks',
    priceRange: '$3k - $15k'
  },
  {
    id: 'exterior-paint',
    name: 'Exterior Paint',
    icon: Paintbrush,
    color: 'from-green-500 to-green-600',
    description: 'Exterior painting services',
    estimatedDuration: '3-5 days',
    priceRange: '$2k - $8k'
  },
  {
    id: 'interior-paint',
    name: 'Interior Paint',
    icon: Paintbrush,
    color: 'from-teal-500 to-teal-600',
    description: 'Interior painting services',
    estimatedDuration: '2-4 days',
    priceRange: '$1k - $5k'
  },
  {
    id: 'roofing',
    name: 'Roofing',
    icon: Home,
    color: 'from-red-500 to-red-600',
    description: 'Roof repair or replacement',
    estimatedDuration: '2-5 days',
    priceRange: '$5k - $20k'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: TreePine,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Landscape design and installation',
    estimatedDuration: '1-3 weeks',
    priceRange: '$2k - $15k'
  },
  {
    id: 'general-construction',
    name: 'General Construction',
    icon: Building,
    color: 'from-gray-500 to-gray-600',
    description: 'General construction projects',
    estimatedDuration: 'Varies',
    priceRange: 'Custom'
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    icon: Wrench,
    color: 'from-indigo-500 to-indigo-600',
    description: 'General repairs and maintenance',
    estimatedDuration: '1-3 days',
    priceRange: '$200 - $2k'
  },
  {
    id: 'custom',
    name: 'Custom Project',
    icon: Hammer,
    color: 'from-pink-500 to-pink-600',
    description: 'Build your own project',
    estimatedDuration: 'Custom',
    priceRange: 'Custom'
  }
];

interface Template {
  id: string;
  name: string;
  description: string;
  projectType: string;
  totalAmount: number;
  itemCount: number;
  estimatedDuration: string;
  popularity?: number;
  lastUsed?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  client_id: string;
  template_id: string;
  start_date: string;
  end_date: string;
}

interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Map icon names to components
const iconMap: Record<string, React.FC<any>> = {
  'Home': Home,
  'Bath': Bath,
  'Package': Package,
  'TreePine': TreePine,
  'Paintbrush': Paintbrush,
  'Wrench': Wrench,
  'Zap': Zap,
  'Wind': Wind,
  'Tool': Settings
};

export const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    client_id: '',
    template_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load clients and categories
      const [clientsRes, categoriesRes] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', user?.id)
          .order('name'),
        supabase
          .from('project_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);
        
      if (clientsRes.error) throw clientsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      
      setClients(clientsRes.data || []);
      setCategories(categoriesRes.data || []);
      
      // For now, create mock templates since we don't have project templates yet
      // In the future, this would load from a project_templates table
      const mockTemplates: Template[] = [
        {
          id: '1',
          name: 'Standard Kitchen Remodel',
          description: 'Complete kitchen renovation with mid-range finishes',
          projectType: 'kitchen-remodel',
          totalAmount: 35000,
          itemCount: 25,
          estimatedDuration: '6 weeks',
          popularity: 95
        },
        {
          id: '2',
          name: 'Premium Kitchen Remodel',
          description: 'High-end kitchen renovation with luxury finishes',
          projectType: 'kitchen-remodel',
          totalAmount: 65000,
          itemCount: 35,
          estimatedDuration: '8 weeks',
          popularity: 80
        },
        {
          id: '3',
          name: 'Budget Kitchen Refresh',
          description: 'Cabinet refacing and countertop replacement',
          projectType: 'kitchen-remodel',
          totalAmount: 15000,
          itemCount: 15,
          estimatedDuration: '3 weeks',
          popularity: 70
        },
        {
          id: '4',
          name: 'Master Bathroom Remodel',
          description: 'Complete master bathroom renovation',
          projectType: 'bathroom-remodel',
          totalAmount: 18000,
          itemCount: 20,
          estimatedDuration: '3 weeks',
          popularity: 90
        },
        {
          id: '5',
          name: 'Powder Room Update',
          description: 'Small bathroom refresh',
          projectType: 'bathroom-remodel',
          totalAmount: 5000,
          itemCount: 10,
          estimatedDuration: '1 week',
          popularity: 60
        }
      ];
      
      setTemplates(mockTemplates);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStep(2);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      template_id: template.id
    }));
    setStep(3);
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !formData.client_id) return;

    setIsCreating(true);
    try {
      // Calculate end date based on template duration
      const startDate = new Date(formData.start_date);
      const weeks = parseInt(selectedTemplate.estimatedDuration) || 4;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (weeks * 7));
      
      // Find the category ID based on selected type
      const category = categories.find(c => c.slug === selectedType);
      
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          name: formData.name,
          description: formData.description,
          client_id: formData.client_id,
          status: 'active',
          budget: selectedTemplate.totalAmount,
          start_date: formData.start_date,
          end_date: endDate.toISOString().split('T')[0],
          category: selectedType, // Keep for backward compatibility
          category_id: category?.id // New field
        })
        .select()
        .single();
        
      if (projectError) throw projectError;
      
      // Create tasks from task templates for this category
      if (category?.id) {
        // Fetch task templates for this category
        const { data: taskTemplates, error: taskTemplatesError } = await supabase
          .from('task_templates')
          .select('*')
          .eq('category_id', category.id)
          .order('display_order');
          
        if (taskTemplatesError) {
          console.error('Error fetching task templates:', taskTemplatesError);
        } else if (taskTemplates && taskTemplates.length > 0) {
          // Create tasks from templates
          const tasksToCreate = taskTemplates.map(template => {
            // Calculate due date based on project start date and template duration
            const dueDate = new Date(startDate);
            dueDate.setDate(dueDate.getDate() + (template.typical_duration_days || 7));
            
            return {
              user_id: user?.id,
              project_id: project.id,
              category_id: category.id,
              title: template.title,
              description: template.description,
              priority: template.default_priority || 'medium',
              status: 'pending',
              due_date: dueDate.toISOString().split('T')[0]
            };
          });
          
          const { error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksToCreate);
            
          if (tasksError) {
            console.error('Error creating tasks:', tasksError);
          } else {
            console.log(`Created ${tasksToCreate.length} tasks for project`);
          }
        }

        // Generate expenses from expense templates
        try {
          await ExpenseService.generateExpensesFromTemplates(
            project.id,
            category.id,
            user?.id || '',
            formData.start_date
          );
          console.log('Generated expenses for project');
        } catch (expenseError) {
          console.error('Error generating expenses:', expenseError);
          // Don't fail the whole project creation if expense generation fails
        }
      }
      
      // In the future, this would also create:
      // - Invoice templates
      // - Initial timeline/schedule
      
      // Navigate to the new project
      navigate(`/projects/${project.id}`);
      onClose();
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      description: '',
      client_id: '',
      template_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const filteredTemplates = selectedType 
    ? templates.filter(t => t.projectType === selectedType)
    : templates;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]" onClick={onClose} />
      
      {/* Wizard Container */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-[#1E1E1E] rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#336699] to-[#2A5580] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Project</h2>
                  <p className="text-blue-100 text-sm">
                    Step {step} of 3 - {
                      step === 1 ? 'Choose Project Type' : 
                      step === 2 ? 'Select Template' : 
                      'Project Details'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-[#333333]">
            <div 
              className="h-full bg-gradient-to-r from-[#336699] to-[#F9D71C] transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            
            {/* Step 1: Project Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">What are you building?</h3>
                  <p className="text-gray-400">Select the type of project to see relevant templates</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => {
                    const Icon = iconMap[category.icon || 'Tool'] || Settings;
                    
                    // Dynamic color assignment based on category
                    const colorClasses: Record<string, string> = {
                      'kitchen-remodel': 'from-blue-500 to-blue-600',
                      'bathroom-remodel': 'from-cyan-500 to-cyan-600',
                      'flooring': 'from-amber-500 to-amber-600',
                      'roof-repair': 'from-red-500 to-red-600',
                      'deck-construction': 'from-green-500 to-green-600',
                      'interior-painting': 'from-purple-500 to-purple-600',
                      'exterior-painting': 'from-indigo-500 to-indigo-600',
                      'plumbing': 'from-blue-500 to-blue-600',
                      'electrical': 'from-yellow-500 to-yellow-600',
                      'hvac': 'from-gray-500 to-gray-600',
                      'landscaping': 'from-green-500 to-green-600',
                      'general-repair': 'from-gray-500 to-gray-600'
                    };
                    
                    const colorClass = colorClasses[category.slug] || 'from-gray-500 to-gray-600';
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleTypeSelect(category.slug)}
                        className="group relative bg-[#333333] hover:bg-[#404040] rounded-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity`} />
                        
                        <div className="relative space-y-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="text-left">
                            <h4 className="font-semibold text-white">{category.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Template Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Choose a template</h3>
                  <p className="text-gray-400">
                    Templates include pre-configured invoices, tasks, and schedules
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#336699]"></div>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No templates available for this project type yet.</p>
                    <button
                      onClick={() => handleTypeSelect('custom')}
                      className="mt-4 px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors"
                    >
                      Create Custom Project
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="group bg-[#333333] hover:bg-[#3A3A3A] rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border border-transparent hover:border-[#336699]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-white">{template.name}</h4>
                              {template.popularity && template.popularity >= 90 && (
                                <span className="px-2 py-1 bg-[#F9D71C]/20 text-[#F9D71C] text-xs rounded-full font-medium">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Total Budget</p>
                                <p className="text-white font-mono font-semibold">
                                  {formatCurrency(template.totalAmount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Items Included</p>
                                <p className="text-white font-semibold">{template.itemCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-white font-semibold">{template.estimatedDuration}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-[#336699]" />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Custom Project Option */}
                    <div
                      onClick={() => handleTypeSelect('custom')}
                      className="group bg-[#1E1E1E] border-2 border-dashed border-[#444444] hover:border-[#336699] rounded-lg p-6 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5 text-[#336699]" />
                        <span className="text-white font-medium">Start from scratch</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Project Details */}
            {step === 3 && selectedTemplate && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Project Details</h3>
                  <p className="text-gray-400">Almost done! Just a few more details</p>
                </div>

                {/* Template Summary */}
                <div className="bg-[#336699]/10 border border-[#336699]/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Check className="w-5 h-5 text-[#336699]" />
                    <span className="text-sm text-gray-300">Selected Template</span>
                  </div>
                  <h4 className="text-white font-semibold mb-1">{selectedTemplate.name}</h4>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-400">
                      Budget: <span className="text-white font-mono">{formatCurrency(selectedTemplate.totalAmount)}</span>
                    </span>
                    <span className="text-gray-400">
                      Duration: <span className="text-white">{selectedTemplate.estimatedDuration}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#333333] border border-[#555555] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] transition-colors"
                      placeholder="e.g., Smith Kitchen Remodel"
                    />
                  </div>

                  {/* Client Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Client *
                    </label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#333333] border border-[#555555] rounded-lg text-white focus:outline-none focus:border-[#336699] transition-colors"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#333333] border border-[#555555] rounded-lg text-white focus:outline-none focus:border-[#336699] transition-colors"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-[#333333] border border-[#555555] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] transition-colors resize-none"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>
                </div>

                {/* What will be created */}
                <div className="bg-[#2A2A2A] rounded-lg p-4 space-y-3">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">This will create:</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#388E3C]" />
                      <span className="text-gray-300">Project with {selectedTemplate.itemCount} pre-configured items</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#388E3C]" />
                      <span className="text-gray-300">Invoice templates ready to send</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#388E3C]" />
                      <span className="text-gray-300">Task list and timeline</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#388E3C]" />
                      <span className="text-gray-300">Budget tracking setup</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!formData.client_id || isCreating}
                    className="px-8 py-3 bg-gradient-to-r from-[#336699] to-[#2A5580] text-white rounded-lg hover:from-[#2A5580] hover:to-[#1E4060] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}; 