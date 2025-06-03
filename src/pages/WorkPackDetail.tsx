import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreVertical, TrendingUp, Calendar, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WorkPackBudget } from '../components/work-packs/WorkPackBudget';

interface WorkPack {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category?: { name: string; icon: string };
  tier: 'budget' | 'standard' | 'premium';
  base_price: number;
  is_active: boolean;
  tasks?: any[];
  expenses?: any[];
  items?: any[];
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

export const WorkPackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workPack, setWorkPack] = useState<WorkPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'tasks' | 'expenses' | 'budget' | 'analytics'>('products');
  const [selectedCostCode, setSelectedCostCode] = useState<string>('all');

  useEffect(() => {
    if (id) {
      loadWorkPackDetails();
    }
  }, [id]);

  const loadWorkPackDetails = async () => {
    try {
      setLoading(true);
      
      const { data: workPackData, error } = await supabase
        .from('work_packs')
        .select(`
          *,
          category:project_categories(name, icon),
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
      }
    } catch (error) {
      console.error('Error loading work pack details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case 'budget':
        return 'bg-[#0d2818] text-[#4ade80]';
      case 'standard':
        return 'bg-[#1a1a1a] text-[#999]';
      case 'premium':
        return 'bg-[#2d2006] text-[#fbbf24]';
      default:
        return 'bg-[#1a1a1a] text-[#666]';
    }
  };

  const getExpenseIcon = (category: string) => {
    const icons: Record<string, string> = {
      'material': '🧱',
      'labor': '👷',
      'equipment': '🔨',
      'service': '💼',
      'permits': '📋',
      'subcontractor': '🤝',
      'other': '📦'
    };
    return icons[category?.toLowerCase()] || '💰';
  };

  const handleUseInProject = () => {
    // TODO: Implement project selection modal
    console.log('Use in project');
  };

  const handleEdit = () => {
    navigate(`/work-packs/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#fbbf24]"></div>
      </div>
    );
  }

  if (!workPack) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Work Pack Not Found</h2>
          <button
            onClick={() => navigate('/work-packs')}
            className="px-4 py-2 bg-[#fbbf24] text-black rounded-lg text-sm font-semibold hover:bg-[#f59e0b] transition-all"
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex gap-8">
            {/* Icon */}
            <div className="w-20 h-20 border border-[#2a2a2a] rounded-xl bg-[#111] flex items-center justify-center text-[32px] font-semibold text-[#666]">
              {workPack.name.substring(0, 2).toUpperCase()}
            </div>
            
            {/* Info */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <h1 className="text-[32px] font-bold text-white tracking-tight">{workPack.name}</h1>
                <span className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md ${getTierStyle(workPack.tier)}`}>
                  {workPack.tier}
                </span>
              </div>
              <div className="text-base text-[#666]">{workPack.category?.name}</div>
              <p className="text-sm text-[#999] max-w-[600px] leading-relaxed">{workPack.description}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUseInProject}
              className="px-5 py-2.5 bg-[#fbbf24] text-black rounded-lg text-sm font-semibold hover:bg-[#f59e0b] transition-all"
            >
              Use in Project
            </button>
            <button
              onClick={handleEdit}
              className="px-5 py-2.5 bg-transparent border border-[#2a2a2a] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all"
            >
              Edit
            </button>
            <button className="w-10 h-10 bg-transparent border border-[#2a2a2a] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg flex items-center justify-center transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-6 mb-10 p-6 bg-[#111] border border-[#1a1a1a] rounded-xl">
          <div className="flex flex-col gap-1 pr-6 border-r border-[#1a1a1a]">
            <span className="text-[11px] uppercase tracking-[0.5px] text-[#666]">Total Value</span>
            <span className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</span>
            <span className="text-xs text-[#666]">base price</span>
          </div>
          <div className="flex flex-col gap-1 pr-6 border-r border-[#1a1a1a]">
            <span className="text-[11px] uppercase tracking-[0.5px] text-[#666]">Products</span>
            <span className="text-2xl font-bold text-white">{stats.productsCount}</span>
            <span className="text-xs text-[#666]">included</span>
          </div>
          <div className="flex flex-col gap-1 pr-6 border-r border-[#1a1a1a]">
            <span className="text-[11px] uppercase tracking-[0.5px] text-[#666]">Tasks</span>
            <span className="text-2xl font-bold text-white">{stats.tasksCount}</span>
            <span className="text-xs text-[#666]">to complete</span>
          </div>
          <div className="flex flex-col gap-1 pr-6 border-r border-[#1a1a1a]">
            <span className="text-[11px] uppercase tracking-[0.5px] text-[#666]">Expenses</span>
            <span className="text-2xl font-bold text-white">{stats.expensesCount}</span>
            <span className="text-xs text-[#666]">additional</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.5px] text-[#666]">Used In</span>
            <span className="text-2xl font-bold text-white">{stats.usageCount}</span>
            <span className="text-xs text-[#666]">projects</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-[#2a2a2a]">
          {[
            { id: 'products', label: 'Products', count: stats.productsCount },
            { id: 'tasks', label: 'Tasks', count: stats.tasksCount },
            { id: 'expenses', label: 'Expenses', count: stats.expensesCount },
            { id: 'budget', label: 'Budget', count: null },
            { id: 'analytics', label: 'Analytics', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[#666] hover:text-[#999]'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="text-xs text-[#666]">({tab.count})</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fbbf24]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-10">
          {/* Budget Tab */}
          {activeTab === 'budget' && (
            <WorkPackBudget workPackId={workPack.id} />
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="grid gap-4">
              {workPack.items?.map((item: any) => (
                <div key={item.id} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 hover:bg-[#151515] hover:border-[#2a2a2a] transition-all">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <div className="text-[13px] text-[#666]">
                        Quantity: {item.quantity} • {item.product?.category || 'Product'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#fbbf24]">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                  
                  {item.product?.description && (
                    <div className="pt-5 border-t border-[#1a1a1a]">
                      <div className="text-xs uppercase tracking-[0.5px] text-[#666] mb-3">Product Details</div>
                      <p className="text-sm text-[#999] leading-relaxed">{item.product.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6">
              {workPack.tasks?.map((task: any, index: number) => (
                <div key={task.id} className={`flex gap-4 py-4 ${index < (workPack.tasks?.length || 0) - 1 ? 'border-b border-[#1a1a1a]' : ''}`}>
                  <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-sm font-semibold text-[#666]">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] text-white mb-1">{task.title}</div>
                    {task.description && (
                      <div className="text-[13px] text-[#666] leading-relaxed">{task.description}</div>
                    )}
                  </div>
                  {task.estimated_hours > 0 && (
                    <div className="text-[13px] text-[#666] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.estimated_hours} {task.estimated_hours === 1 ? 'hour' : 'hours'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#111] rounded-xl p-6 relative overflow-hidden border border-[#1a1a1a]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#336699]"></div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Total Template Cost</h3>
                  <div className="text-[32px] font-semibold text-white">
                    {formatCurrency(workPack.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {Object.keys(workPack.expenses?.reduce((groups: any, expense: any) => {
                      const costCodeId = expense.cost_code?.id || 'no-cost-code';
                      groups[costCodeId] = true;
                      return groups;
                    }, {}) || {}).length} cost categories
                  </div>
                </div>
                
                <div className="bg-[#111] rounded-xl p-6 relative overflow-hidden border border-[#1a1a1a]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]"></div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Materials</h3>
                  <div className="text-[32px] font-semibold text-white">
                    {formatCurrency(workPack.expenses?.filter((exp: any) => exp.category === 'material').reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round(((workPack.expenses?.filter((exp: any) => exp.category === 'material').reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0) / (workPack.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 1)) * 100)}% of total
                  </div>
                </div>
                
                <div className="bg-[#111] rounded-xl p-6 relative overflow-hidden border border-[#1a1a1a]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#8b5cf6]"></div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Labor</h3>
                  <div className="text-[32px] font-semibold text-white">
                    {formatCurrency(workPack.expenses?.filter((exp: any) => exp.category === 'labor').reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round(((workPack.expenses?.filter((exp: any) => exp.category === 'labor').reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0) / (workPack.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 1)) * 100)}% of total
                  </div>
                </div>
                
                <div className="bg-[#111] rounded-xl p-6 relative overflow-hidden border border-[#1a1a1a]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f59e0b]"></div>
                  <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Active Categories</h3>
                  <div className="text-[32px] font-semibold text-white">
                    {Object.keys(workPack.expenses?.reduce((groups: any, expense: any) => {
                      const costCodeId = expense.cost_code?.id || 'no-cost-code';
                      groups[costCodeId] = true;
                      return groups;
                    }, {}) || {}).length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">of 7 total</div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="space-y-6">
                {/* Cost Code Navigation - Horizontal */}
                <div className="bg-[#111] rounded-xl p-6 border border-[#1a1a1a]">
                  <h2 className="text-base font-semibold text-white mb-4">Cost Categories</h2>
                  <div className="space-y-1">
                    {(() => {
                      const groupedExpenses = workPack.expenses?.reduce((groups: any, expense: any) => {
                        const costCodeId = expense.cost_code?.id || 'no-cost-code';
                        if (!groups[costCodeId]) {
                          groups[costCodeId] = {
                            costCode: expense.cost_code,
                            total: 0,
                            count: 0
                          };
                        }
                        groups[costCodeId].total += expense.amount;
                        groups[costCodeId].count += 1;
                        return groups;
                      }, {});

                      const allTotal = workPack.expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
                      const sortedGroups = Object.values(groupedExpenses || {}).sort((a: any, b: any) => {
                        if (!a.costCode && !b.costCode) return 0;
                        if (!a.costCode) return 1;
                        if (!b.costCode) return -1;
                        return a.costCode.code.localeCompare(b.costCode.code);
                      });

                      return (
                        <>
                          <div 
                            onClick={() => setSelectedCostCode('all')}
                            className={`flex justify-between items-center p-3 rounded-lg font-medium cursor-pointer transition-all ${
                              selectedCostCode === 'all' 
                                ? 'bg-[#336699]/20 border border-[#336699]/40 text-[#336699]' 
                                : 'hover:bg-[#1a1a1a]'
                            }`}
                          >
                            <span><span className="font-semibold">All</span> Categories</span>
                            <span className="text-sm">{formatCurrency(allTotal)}</span>
                          </div>
                          {sortedGroups.map((group: any) => (
                            <div 
                              key={group.costCode?.id || 'no-cost-code'} 
                              onClick={() => setSelectedCostCode(group.costCode?.id || 'no-cost-code')}
                              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                                selectedCostCode === (group.costCode?.id || 'no-cost-code')
                                  ? 'bg-[#336699]/20 border border-[#336699]/40 text-[#336699]'
                                  : 'hover:bg-[#1a1a1a]'
                              }`}
                            >
                              <span className="text-sm">
                                {group.costCode ? (
                                  <><span className="font-semibold">{group.costCode.code}</span> {group.costCode.name}</>
                                ) : (
                                  'No Cost Code'
                                )}
                              </span>
                              <span className="text-sm text-gray-400">{formatCurrency(group.total)}</span>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Expense Table */}
                <div className="bg-[#111] rounded-xl p-8 border border-[#1a1a1a]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Template Expenses</h2>
                      {selectedCostCode !== 'all' && (
                        <p className="text-sm text-gray-400 mt-1">
                          Filtered by: {
                            selectedCostCode === 'no-cost-code' 
                              ? 'No Cost Code' 
                              : workPack.expenses?.find((exp: any) => exp.cost_code?.id === selectedCostCode)?.cost_code?.code + ' ' + 
                                workPack.expenses?.find((exp: any) => exp.cost_code?.id === selectedCostCode)?.cost_code?.name
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 border border-[#2a2a2a] bg-transparent text-gray-400 rounded-md hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all text-sm font-medium">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Export
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-md hover:bg-[#2a5580] transition-all text-sm font-medium">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Expense
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-[#2a2a2a]">
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Cost Code</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Description</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Category</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Vendor</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workPack.expenses
                          ?.filter((expense: any) => {
                            if (selectedCostCode === 'all') return true;
                            return expense.cost_code?.id === selectedCostCode || (selectedCostCode === 'no-cost-code' && !expense.cost_code);
                          })
                          .map((expense: any, index: number) => (
                          <tr 
                            key={expense.id}
                            className="border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-all"
                          >
                            <td className="py-4 px-4">
                              {expense.cost_code ? (
                                <strong className="font-semibold">{expense.cost_code.code}</strong>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm">{expense.description}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                expense.category === 'material' 
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : expense.category === 'labor'
                                  ? 'bg-green-500/10 text-green-500'
                                  : expense.category === 'equipment'
                                  ? 'bg-orange-500/10 text-orange-500'
                                  : expense.category === 'service'
                                  ? 'bg-cyan-500/10 text-cyan-500'
                                  : expense.category === 'subcontractor'
                                  ? 'bg-purple-500/10 text-purple-500'
                                  : expense.category === 'permits'
                                  ? 'bg-yellow-500/10 text-yellow-500'
                                  : expense.category === 'other'
                                  ? 'bg-gray-500/10 text-gray-500'
                                  : 'bg-gray-600/10 text-gray-400'
                              }`}>
                                <span>{getExpenseIcon(expense.category)}</span>
                                <span className="capitalize">{expense.category}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-400">{expense.vendor || '—'}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-xs font-medium border border-[#2a2a2a] bg-transparent text-gray-400 rounded-md hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all">
                                  Edit
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium border border-[#2a2a2a] bg-transparent text-gray-400 rounded-md hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] transition-all">
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Usage Chart Placeholder */}
              <div className="lg:col-span-2 bg-[#111] border border-[#1a1a1a] rounded-xl p-6 h-[300px] flex items-center justify-center text-[#666]">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Usage analytics coming soon</p>
                </div>
              </div>
              
              {/* Recent Projects */}
              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.5px] mb-5 pb-3 border-b border-[#1a1a1a]">
                  Recent Projects Using This Pack
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Johnson Master Bath', date: '2 days ago', amount: 13450 },
                    { name: 'Chen Bathroom Remodel', date: '1 week ago', amount: 12800 },
                    { name: 'Williams Guest Bath', date: '2 weeks ago', amount: 11200 }
                  ].map((project, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-[#1a1a1a] last:border-0">
                      <div>
                        <div className="text-sm text-white">{project.name}</div>
                        <div className="text-xs text-[#666]">{project.date}</div>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(project.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-10 border-t border-[#2a2a2a] flex items-center justify-between">
          <div className="text-[13px] text-[#666]">
            Last updated {new Date(workPack.updated_at || workPack.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all">
              Duplicate Pack
            </button>
            <button className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all">
              Export Template
            </button>
            <button className="px-4 py-2 bg-transparent border border-[#2a2a2a] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm font-medium transition-all">
              Version History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 