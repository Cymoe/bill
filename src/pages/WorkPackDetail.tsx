import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, MoreVertical, Share2, FileText, Camera, 
  MessageSquare, DollarSign, CheckSquare, Plus, Phone, Mail, MapPin, ExternalLink, Users, Calendar, Tag, Clock, TrendingUp, Trash2, X,
  Filter, ArrowUpDown, ChevronDown, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WorkPackTaskList } from '../components/WorkPackTaskList';
import { WorkPackTimelineView } from '../components/WorkPackTimelineView';
import { WorkPackAnalytics } from '../components/WorkPackAnalytics';

interface WorkPack {
  id: string;
  name: string;
  description: string;
  industry_id: string;
  project_type_id: string;
  tier: string;
  base_price: number;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  industry?: {
    id: string;
    name: string;
    slug: string;
  };
  project_type?: {
    id: string;
    name: string;
    slug: string;
  };
  tasks?: any[];
  expenses?: any[];
  items?: any[];
}

type TabType = 'overview' | 'tasks' | 'expenses' | 'budget' | 'products' | 'timeline' | 'analytics';

export const WorkPackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workPack, setWorkPack] = useState<WorkPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [costCodes, setCostCodes] = useState<any[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cost-codes' | 'categories'>('categories');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'material',
    vendor: '',
    cost_code_id: ''
  });

  useEffect(() => {
    if (id) {
      loadWorkPackDetails();
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.more-menu') && !target.closest('.more-menu-trigger')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadWorkPackDetails = async () => {
    try {
      setLoading(true);
      
      const { data: workPackData, error } = await supabase
        .from('work_packs')
        .select(`
          *,
          industry:industries(id, name, slug),
          project_type:project_categories!project_type_id(id, name, slug),
          tasks:work_pack_tasks(*),
          expenses:work_pack_expenses(
            *,
            cost_code:cost_codes(id, name, code)
          ),
          items:work_pack_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();

      if (!error && workPackData) {
        // Mock usage count for now
        setWorkPack({ ...workPackData, usage_count: 15 });
      } else if (error) {
        console.error('Error loading work pack:', error);
      }
    } catch (error) {
      console.error('Error loading work pack details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCostCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_codes')
        .select('*')
        .order('code');

      if (!error) {
        setCostCodes(data || []);
      }
    } catch (error) {
      console.error('Error loading cost codes:', error);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setNewExpense({
      description: '',
      amount: '',
      category: 'material',
      vendor: '',
      cost_code_id: ''
    });
    setShowAddExpense(true);
    loadCostCodes();
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      vendor: expense.vendor || '',
      cost_code_id: expense.cost_code?.id || ''
    });
    setShowAddExpense(true);
    loadCostCodes();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const { error } = await supabase
        .from('work_pack_expenses')
        .delete()
        .eq('id', expenseId);

      if (!error) {
        await loadWorkPackDetails(); // Refresh the data
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleSaveExpense = async () => {
    try {
      const expenseData = {
        work_pack_id: workPack?.id,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        vendor: newExpense.vendor || null,
        cost_code_id: newExpense.cost_code_id || null
      };

      if (editingExpense) {
        // Update existing expense
        const { error } = await supabase
          .from('work_pack_expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;
      } else {
        // Create new expense
        const { error } = await supabase
          .from('work_pack_expenses')
          .insert(expenseData);

        if (error) throw error;
      }

      // Reset form and close
      setShowAddExpense(false);
      setEditingExpense(null);
      setNewExpense({
        description: '',
        amount: '',
        category: 'material',
        vendor: '',
        cost_code_id: ''
      });
      
      await loadWorkPackDetails(); // Refresh the data
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const formatExpenseDate = (date: string) => {
    const expenseDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - expenseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return expenseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'budget':
        return 'bg-green-500/20 text-green-400';
      case 'standard':
        return 'bg-[#336699]/20 text-[#336699]';
      case 'premium':
        return 'bg-[#F9D71C]/20 text-[#F9D71C]';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleEdit = () => {
    navigate(`/work-packs/${id}/edit`);
  };

  if (loading && !workPack) {
    return (
      <div className="max-w-[1600px] mx-auto p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#1a1a1a] rounded animate-pulse" />
              <div>
                <div className="h-8 w-64 bg-[#1a1a1a] rounded mb-2 animate-pulse" />
                <div className="flex items-center gap-4">
                  <div className="h-6 w-20 bg-[#1a1a1a] rounded animate-pulse" />
                  <div className="h-5 w-32 bg-[#1a1a1a] rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-32 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-10 w-20 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-10 w-10 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-[#181818] rounded-xl animate-pulse" />
          <div className="h-64 bg-[#181818] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!workPack) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Work Pack Not Found</p>
          <button
            onClick={() => navigate('/work-packs')}
            className="px-4 py-2 bg-[#F9D71C] text-black rounded-md text-sm hover:bg-[#E6C419] transition-colors"
          >
            Back to Work Packs
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    totalValue: workPack.base_price,
    productsCount: workPack.items?.length || 0,
    tasksCount: workPack.tasks?.length || 0,
    expensesCount: workPack.expenses?.length || 0,
    usageCount: workPack.usage_count || 0
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {/* Left side - Back button, title, badges */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/work-packs')}
              className="p-2 hover:bg-[#1a1a1a] rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">{workPack.name}</h1>
                <span className="text-gray-400 text-sm">• {workPack.industry?.name || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium uppercase bg-[#F9D71C]/20 text-[#F9D71C] border border-[#F9D71C]/40">
                  📋 Template
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getTierBadgeClass(workPack.tier)}`}>
                  {workPack.tier}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#2a2a2a] transition-colors text-sm rounded-md">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#2a2a2a] transition-colors text-sm rounded-md"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="more-menu-trigger w-9 h-9 flex items-center justify-center border border-[#2a2a2a] bg-[#1a1a1a] rounded-md hover:bg-[#2a2a2a] transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              {showMoreMenu && (
                <div className="more-menu absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg z-50">
                  <button className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#2a2a2a] transition-colors">
                    Duplicate Template
                  </button>
                  <button className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#2a2a2a] transition-colors">
                    Export Template
                  </button>
                  <div className="border-t border-[#2a2a2a]" />
                  <button className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors">
                    Delete Template
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-between mb-8 border-b border-[#2a2a2a]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative text-center after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'overview'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'tasks'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Tasks
          <span className="text-xs text-gray-500">{stats.tasksCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'expenses'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Expenses
          <span className="text-xs text-gray-500">{stats.expensesCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative text-center after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'budget'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Budget
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'products'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Products
          <span className="text-xs text-gray-500">{stats.productsCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative text-center after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'timeline'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 pb-4 text-sm font-medium transition-colors relative text-center after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
            activeTab === 'analytics'
              ? 'text-white after:bg-[#336699]'
              : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699]'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Template Health Section */}
          <section className="bg-[#181818] rounded-xl p-5">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Template Summary</h2>
                <div className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-[#F9D71C]/20 text-[#F9D71C]">
                  <span className="text-[#F9D71C]">●</span>
                  Ready for Use
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#121212] rounded-lg p-4 text-center">
                <div className="text-lg font-bold mb-1 text-[#F9D71C]">
                  {formatCurrency(stats.totalValue)}
                </div>
                <div className="text-[11px] text-gray-300 uppercase tracking-wide">Base Price</div>
              </div>
              
              <div className="bg-[#121212] rounded-lg p-4 text-center">
                <div className="text-lg font-bold mb-1 text-[#336699]">
                  {stats.productsCount}
                </div>
                <div className="text-[11px] text-gray-300 uppercase tracking-wide">Products</div>
              </div>
              
              <div className="bg-[#121212] rounded-lg p-4 text-center">
                <div className="text-lg font-bold mb-1 text-green-400">
                  {stats.tasksCount}
                </div>
                <div className="text-[11px] text-gray-300 uppercase tracking-wide">Template Tasks</div>
              </div>
              
              <div className="bg-[#121212] rounded-lg p-4 text-center">
                <div className="text-lg font-bold mb-1 text-orange-400">
                  {stats.usageCount}
                </div>
                <div className="text-[11px] text-gray-300 uppercase tracking-wide">Times Used</div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-[#181818] rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">Template Description</h3>
            <p className="text-white mb-4">{workPack.description || 'No description provided'}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Industry</div>
                <div className="text-white">{workPack.industry?.name || 'Uncategorized'}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Project Type</div>
                <div className="text-white capitalize">{workPack.project_type?.name || 'Uncategorized'}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Created</div>
                <div className="text-white">{new Date(workPack.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">Last Updated</div>
                <div className="text-white">{new Date(workPack.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </section>

          {/* Recent Usage */}
          <section className="bg-[#181818] rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-6">Recent Usage</h3>
            {/* Mock recent projects using this template */}
            <div className="space-y-4">
              {[
                { name: 'Johnson Master Bath', date: '2 days ago', amount: 13450 },
                { name: 'Chen Bathroom Remodel', date: '1 week ago', amount: 12800 },
                { name: 'Williams Guest Bath', date: '2 weeks ago', amount: 11200 }
              ].map((project, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                    📋
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.date} • {formatCurrency(project.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <WorkPackTaskList 
              workPackId={workPack.id} 
              onTaskUpdate={() => loadWorkPackDetails()} 
            />
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                {viewMode === 'cost-codes' ? 'Cost Categories' : 'Expense Types'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Selector */}
              <div className="relative">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'cost-codes' | 'categories')}
                  className="w-40 bg-[#111827]/50 border border-gray-700 rounded-[4px] pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#336699] appearance-none cursor-pointer"
                >
                  <option value="cost-codes">Cost Codes</option>
                  <option value="categories">Categories</option>
                </select>
                <Filter className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-[#111827]/50 border border-gray-700 rounded-[4px] text-gray-400 hover:text-white transition-colors"
                title={`Sort by amount ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>

              <button
                onClick={handleAddExpense}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#336699] hover:bg-[#5A8BB8] text-white rounded-[4px] text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Add Expense Form - Inline like Projects */}
          {showAddExpense && (
            <div className="bg-[#111827]/50 border border-gray-700 rounded-[4px] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddExpense(false);
                    setEditingExpense(null);
                    setNewExpense({
                      description: '',
                      amount: '',
                      category: 'material',
                      vendor: '',
                      cost_code_id: ''
                    });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    placeholder="What did you pay for?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Vendor (optional)"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#336699]"
                  />
                </div>

                <div>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699] cursor-pointer"
                  >
                    <option value="material">Materials</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="service">Service</option>
                    <option value="permits">Permits</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <select
                    value={newExpense.cost_code_id}
                    onChange={(e) => setNewExpense({ ...newExpense, cost_code_id: e.target.value })}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-[4px] px-3 py-2 text-white focus:outline-none focus:border-[#336699] cursor-pointer"
                  >
                    <option value="">No Cost Code</option>
                    {costCodes.map((code) => (
                      <option key={code.id} value={code.id}>
                        {code.code} - {code.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddExpense(false);
                    setEditingExpense(null);
                    setNewExpense({
                      description: '',
                      amount: '',
                      category: 'material',
                      vendor: '',
                      cost_code_id: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-700 rounded-[4px] text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExpense}
                  className="px-4 py-2 bg-[#336699] hover:bg-[#5A8BB8] text-white rounded-[4px] transition-colors"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </div>
          )}

          {workPack.expenses && workPack.expenses.length > 0 ? (
            <>
              {/* All Summary */}
              <div className="bg-[#F9D71C]/10 border border-[#F9D71C]/20 rounded-[4px] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-[#F9D71C] font-medium">
                      {viewMode === 'cost-codes' ? 'All Categories' : 'All Expenses'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-900/10 text-gray-400 border border-gray-700/30 rounded text-xs flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {workPack.expenses.length}
                      </span>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#F9D71C]">
                    {formatCurrency(workPack.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0))}
                  </div>
                </div>
              </div>

              {/* Collapsible Groups */}
              <div className="space-y-2">
                {(() => {
                  // Group expenses by view mode
                  const groupedExpenses = workPack.expenses.reduce((acc: any, expense: any) => {
                    let groupKey: string;
                    
                    if (viewMode === 'cost-codes') {
                      groupKey = expense.cost_code_id || 'no-cost-code';
                    } else {
                      groupKey = expense.category || 'Other';
                    }
                    
                    if (!acc[groupKey]) {
                      acc[groupKey] = [];
                    }
                    acc[groupKey].push(expense);
                    return acc;
                  }, {});

                  // Calculate totals for each group
                  const groupTotals = Object.keys(groupedExpenses).reduce((acc: any, groupKey) => {
                    acc[groupKey] = groupedExpenses[groupKey].reduce((sum: number, expense: any) => sum + expense.amount, 0);
                    return acc;
                  }, {});

                  // Sort groups by total amount
                  const sortedGroups = Object.keys(groupedExpenses).sort((a, b) => {
                    const comparison = groupTotals[a] - groupTotals[b];
                    return sortOrder === 'asc' ? comparison : -comparison;
                  });

                  return sortedGroups.map((groupKey) => {
                    const isExpanded = expandedGroups.has(groupKey);
                    
                    // Get display information based on view mode
                    let displayCode = '';
                    let displayName = '';
                    
                    if (viewMode === 'cost-codes') {
                      if (groupKey === 'no-cost-code') {
                        displayCode = 'No Code';
                        displayName = 'Unassigned';
                      } else {
                        const costCode = costCodes.find((cc: any) => cc.id === groupKey);
                        displayCode = costCode?.code || groupKey;
                        displayName = costCode?.name || 'Unknown Cost Code';
                      }
                    } else {
                      displayCode = groupKey;
                      displayName = groupKey;
                    }
                    
                    return (
                      <div key={groupKey}>
                        {/* Group Header */}
                        <div 
                          className={`bg-[#111827]/30 border border-gray-800/50 rounded-[4px] p-4 cursor-pointer transition-colors hover:bg-[#111827]/50 ${
                            isExpanded ? 'bg-[#111827]/50' : ''
                          }`}
                          onClick={() => toggleGroup(groupKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                              <div className="font-mono text-sm text-gray-400">
                                {displayCode}
                              </div>
                              <div className="font-medium text-white">
                                {displayName}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-gray-900/10 text-gray-400 border border-gray-700/30 rounded text-xs flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {groupedExpenses[groupKey].length}
                                </span>
                              </div>
                            </div>
                            <div className="text-lg font-semibold text-white">
                              {formatCurrency(groupTotals[groupKey])}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Expense Items */}
                        {isExpanded && (
                          <div className="ml-6 mt-2 space-y-1">
                            {groupedExpenses[groupKey].map((expense: any) => (
                              <div key={expense.id} className="border border-gray-800/30 rounded-[4px] p-3 bg-gray-900/5">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-gray-400" />
                                      <div className="font-medium text-white text-sm">{expense.description}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                      {expense.vendor && <span>{expense.vendor}</span>}
                                      {expense.cost_code && (
                                        <span className="flex items-center gap-1">
                                          <Tag className="w-3 h-3" />
                                          {expense.cost_code.code}
                                        </span>
                                      )}
                                      <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300">
                                        {expense.category}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="font-semibold text-white">{formatCurrency(expense.amount)}</div>
                                    <div className="flex items-center gap-1">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditExpense(expense);
                                        }}
                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteExpense(expense.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No expenses tracked yet</div>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-[#336699] hover:bg-[#5A8BB8] text-white rounded-[4px] transition-colors"
              >
                Add First Expense
              </button>
            </div>
          )}
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Summary Header */}
          <div className="bg-[#F9D71C]/10 border border-[#F9D71C]/20 rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#F9D71C] font-medium text-lg">Template Cost Breakdown</div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#F9D71C]" />
                <span className="text-lg font-bold text-white">
                  {formatCurrency(workPack.base_price)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Base Price</div>
                <div className="text-xl font-bold text-white">{formatCurrency(workPack.base_price)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Template Expenses</div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(workPack.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Estimated Margin</div>
                <div className="text-xl font-bold text-green-400">
                  {(() => {
                    const expenseTotal = workPack.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
                    const margin = workPack.base_price - expenseTotal;
                    return formatCurrency(margin);
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown by Category */}
          <div className="space-y-2">
            {(() => {
              if (!workPack.expenses || workPack.expenses.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No expenses in template budget</div>
                    <div className="text-sm text-gray-500">
                      Add expenses to see detailed cost breakdown
                    </div>
                  </div>
                );
              }

              // Group expenses by category
              const expensesByCategory = workPack.expenses.reduce((acc: any, expense: any) => {
                const category = expense.category || 'Other';
                if (!acc[category]) {
                  acc[category] = { total: 0, count: 0, expenses: [] };
                }
                acc[category].total += expense.amount;
                acc[category].count += 1;
                acc[category].expenses.push(expense);
                return acc;
              }, {});

              // Sort categories by total amount (descending)
              const sortedCategories = Object.entries(expensesByCategory).sort(
                ([, a]: any, [, b]: any) => b.total - a.total
              );

              return sortedCategories.map(([category, data]: any) => {
                const percentOfTotal = workPack.base_price > 0 ? (data.total / workPack.base_price) * 100 : 0;
                const isExpanded = expandedGroups.has(category);
                
                return (
                  <div key={category}>
                    {/* Category Header */}
                    <div 
                      className="bg-[#111827]/30 border border-gray-800/50 rounded-[4px] p-4 cursor-pointer transition-colors hover:bg-[#111827]/50"
                      onClick={() => toggleGroup(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <div className="font-medium text-white">{category}</div>
                          <div className="text-sm text-gray-400">
                            {data.count} item{data.count !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-[#F9D71C]">
                            {percentOfTotal.toFixed(1)}% of budget
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-white">
                          {formatCurrency(data.total)}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Expense Items */}
                    {isExpanded && (
                      <div className="ml-6 mt-2 space-y-1">
                        {data.expenses.map((expense: any) => (
                          <div key={expense.id} className="border border-gray-800/30 rounded-[4px] p-3 bg-gray-900/5">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-white text-sm">{expense.description}</div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                  {expense.vendor && <span>{expense.vendor}</span>}
                                  {expense.cost_code && (
                                    <span className="flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {expense.cost_code.code}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="font-semibold text-white">{formatCurrency(expense.amount)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Template Insights */}
          {workPack.expenses && workPack.expenses.length > 0 && (
            <div className="bg-[#111827]/30 border border-gray-800/50 rounded-[4px] p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Template Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-2">Most Expensive Category</div>
                  <div className="text-white">
                    {(() => {
                      const expensesByCategory = workPack.expenses.reduce((acc: any, expense: any) => {
                        const category = expense.category || 'Other';
                        acc[category] = (acc[category] || 0) + expense.amount;
                        return acc;
                      }, {});
                      const maxCategory = Object.entries(expensesByCategory).reduce(
                        ([maxCat, maxAmount]: any, [cat, amount]: any) => 
                          amount > maxAmount ? [cat, amount] : [maxCat, maxAmount],
                        ['', 0]
                      );
                      return `${maxCategory[0]} (${formatCurrency(maxCategory[1])})`;
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">Average Cost per Item</div>
                  <div className="text-white">
                    {formatCurrency((workPack.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)) / workPack.expenses.length)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <h3 className="text-base font-semibold uppercase tracking-wider mb-6">Template Products</h3>
            <div className="grid gap-4">
              {workPack.items?.map((item: any) => (
                <div key={item.id} className="bg-[#121212] border border-[#2a2a2a] rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {item.product?.name || 'Unknown Product'}
                      </h4>
                      <div className="text-xs text-gray-400">
                        Quantity: {item.quantity} • {item.product?.category || 'Product'}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-[#F9D71C]">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                  
                  {item.product?.description && (
                    <div className="pt-3 border-t border-[#2a2a2a]">
                      <p className="text-sm text-gray-300">{item.product.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <WorkPackTimelineView workPackId={workPack.id} />
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
            <WorkPackAnalytics workPackId={workPack.id} workPackName={workPack.name} />
          </div>
        </div>
      )}
    </div>
  );
}; 