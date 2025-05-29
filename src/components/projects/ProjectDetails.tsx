import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Calendar, DollarSign, MapPin, User, CheckCircle, 
  Clock, AlertCircle, Plus, ChevronRight, Camera, FileText, ListTodo, 
  Receipt, MessageSquare, MoreVertical, Download, Share2, 
  TrendingUp, TrendingDown, Users, Phone, Mail, Building, Briefcase,
  Package, AlertTriangle, ChevronDown, Filter, Search, X, Upload,
  CheckSquare, Square, Star, Pin
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';
import { TaskList } from '../tasks/TaskList';
import { ExpensesList } from '../expenses/ExpensesList';

interface ProjectWithDetails {
  id: string;
  name: string;
  description: string;
  client_id: string;
  status: 'active' | 'on-hold' | 'completed' | 'cancelled';
  budget: number;
  start_date: string;
  end_date: string;
  created_at: string;
  category_id?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to?: string;
  completed_at?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'paid';
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  taken_at: string;
  phase: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  is_pinned: boolean;
}

export const ProjectDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'expenses' | 'timeline' | 'photos' | 'notes'>('overview');
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadProjectData();
    }
  }, [id, user]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project with client details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', id)
        .single();
        
      if (projectError) throw projectError;
      setProject(projectData);
      
      // Load real task count
      const { count: taskCount, error: taskCountError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);
        
      if (!taskCountError) {
        setTaskCount(taskCount || 0);
      }
      
      // Load expense totals
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('project_id', id);
        
      if (!expenseError && expenseData) {
        setExpenseCount(expenseData.length);
        const total = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
        setExpenseTotal(total);
      }
      
      // Load photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .eq('project_id', id);
        
      if (photosError) throw photosError;
      setPhotos(photosData);
      
      // Load notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', id);
        
      if (notesError) throw notesError;
      setNotes(notesData);
      
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[#10b981] bg-[#10b981]/20';
      case 'completed': return 'text-[#3b82f6] bg-[#3b82f6]/20';
      case 'on-hold': return 'text-[#f59e0b] bg-[#f59e0b]/20';
      case 'cancelled': return 'text-[#ef4444] bg-[#ef4444]/20';
      default: return 'text-[#6b7280] bg-[#6b7280]/20';
    }
  };

  const getProgress = () => {
    if (!project) return 0;
    const start = new Date(project.start_date).getTime();
    const end = new Date(project.end_date).getTime();
    const now = new Date().getTime();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getSpentAmount = () => {
    return expenseTotal;
  };

  const getCompletedTasksCount = () => {
    return taskCount;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'tasks', label: 'Tasks', icon: ListTodo, count: taskCount },
    { id: 'expenses', label: 'Expenses', icon: Receipt, count: expenseCount },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'photos', label: 'Photos', icon: Camera, count: photos.length },
    { id: 'notes', label: 'Notes', icon: MessageSquare, count: notes.length }
  ];

  const handleGenerateInvoice = () => {
    // Navigate to invoices page with project context
    navigate('/invoices', { 
      state: { 
        createNew: true,
        projectId: project?.id,
        clientId: project?.client_id,
        projectName: project?.name,
        projectBudget: project?.budget
      } 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#336699]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-[#ef4444] mx-auto mb-4" />
          <p className="text-white text-lg">Project not found</p>
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const spentAmount = getSpentAmount();
  const budgetPercentage = (spentAmount / project.budget) * 100;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="bg-[#1E1E1E] border-b border-[#333333]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">
                    {project.client?.name || 'No client assigned'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => navigate(`/projects/${project.id}/edit`)}
                className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#404040] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 hover:bg-[#333333] rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg z-50 py-1">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#333333] transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#333333] transition-colors flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </button>
                    <div className="border-t border-[#333333] my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#333333] transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Metrics Bar */}
        <div className="px-6 py-3 bg-[#121212] border-t border-[#333333]">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase">Budget</p>
              <p className="text-lg font-mono font-semibold">{formatCurrency(project.budget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Spent</p>
              <p className="text-lg font-mono font-semibold flex items-center gap-1">
                {formatCurrency(spentAmount)}
                <span className={`text-xs ${budgetPercentage > 90 ? 'text-[#ef4444]' : 'text-gray-400'}`}>
                  ({Math.round(budgetPercentage)}%)
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Timeline</p>
              <p className="text-lg font-semibold">
                {Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[#333333] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#336699] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Tasks</p>
              <p className="text-lg font-semibold">
                {getCompletedTasksCount()}/{taskCount} complete
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1E1E1E] border-b border-[#333333] px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-white border-[#336699]'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-[#336699]' : 'bg-[#333333]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Details */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-6">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Description</p>
                    <p className="text-white">{project.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Start Date</p>
                      <p className="text-white">{new Date(project.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">End Date</p>
                      <p className="text-white">{new Date(project.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Task "Order kitchen cabinets" marked complete</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#3b82f6] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">New expense added: $2,500 for electrical work</p>
                      <p className="text-xs text-gray-400">Yesterday at 3:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#F9D71C] rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">2 new photos uploaded</p>
                      <p className="text-xs text-gray-400">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-6">
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                
                {project.client ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="text-white font-medium">{project.client.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a href={`mailto:${project.client.email}`} className="text-[#336699] hover:underline">
                        {project.client.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <a href={`tel:${project.client.phone}`} className="text-[#336699] hover:underline">
                        {project.client.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No client assigned</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  <button 
                    onClick={handleGenerateInvoice}
                    className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#404040] transition-colors text-left flex items-center gap-3"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Invoice
                  </button>
                  <button className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#404040] transition-colors text-left flex items-center gap-3">
                    <Camera className="w-4 h-4" />
                    Upload Photos
                  </button>
                  <button className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#404040] transition-colors text-left flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    Send Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <TaskList projectId={project.id} categoryId={project.category_id} />
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <ExpensesList projectId={project.id} />
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Timeline view coming soon...</p>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Project Photos</h3>
              <button className="px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Photos
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-[#1E1E1E] rounded-lg border border-[#333333] overflow-hidden hover:border-[#336699] transition-colors cursor-pointer">
                  <div className="aspect-square bg-[#333333] flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-600" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{photo.caption}</p>
                    <p className="text-xs text-gray-400">{photo.phase} • {new Date(photo.taken_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Project Notes</h3>
              <button 
                onClick={() => setShowNoteForm(true)}
                className="px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>

            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-[#1E1E1E] rounded-lg border border-[#333333] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white">{note.content}</p>
                    {note.is_pinned && <Pin className="w-4 h-4 text-[#F9D71C]" />}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
