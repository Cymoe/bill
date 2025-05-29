import React, { useState, useEffect } from 'react';
import { X, Target, TrendingUp, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface Goal {
  id: string;
  type: 'revenue' | 'profit' | 'projects' | 'category_revenue';
  categoryId?: string;
  categoryName?: string;
  targetValue: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number;
  quarter?: number;
  createdAt: string;
}

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  onGoalsUpdate?: () => void;
}

export const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  isOpen,
  onClose,
  categories,
  onGoalsUpdate
}) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    type: 'revenue' as Goal['type'],
    categoryId: '',
    targetValue: 0,
    period: 'monthly' as Goal['period'],
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.ceil((new Date().getMonth() + 1) / 3)
  });

  useEffect(() => {
    if (isOpen) {
      loadGoals();
    }
  }, [isOpen]);

  const loadGoals = () => {
    // Load from localStorage for demo (would be from Supabase in production)
    const savedGoals = localStorage.getItem(`goals_${user?.id}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  const saveGoal = () => {
    const newGoal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      type: formData.type,
      categoryId: formData.type === 'category_revenue' ? formData.categoryId : undefined,
      categoryName: formData.type === 'category_revenue' 
        ? categories.find(c => c.id === formData.categoryId)?.name 
        : undefined,
      targetValue: formData.targetValue,
      period: formData.period,
      year: formData.year,
      month: formData.period === 'monthly' ? formData.month : undefined,
      quarter: formData.period === 'quarterly' ? formData.quarter : undefined,
      createdAt: editingGoal?.createdAt || new Date().toISOString()
    };

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = goals.map(g => g.id === editingGoal.id ? newGoal : g);
    } else {
      updatedGoals = [...goals, newGoal];
    }

    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user?.id}`, JSON.stringify(updatedGoals));
    
    resetForm();
    onGoalsUpdate?.();
  };

  const deleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(g => g.id !== goalId);
      setGoals(updatedGoals);
      localStorage.setItem(`goals_${user?.id}`, JSON.stringify(updatedGoals));
      onGoalsUpdate?.();
    }
  };

  const editGoal = (goal: Goal) => {
    setFormData({
      type: goal.type,
      categoryId: goal.categoryId || '',
      targetValue: goal.targetValue,
      period: goal.period,
      year: goal.year,
      month: goal.month || new Date().getMonth() + 1,
      quarter: goal.quarter || Math.ceil((new Date().getMonth() + 1) / 3)
    });
    setEditingGoal(goal);
    setIsCreating(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'revenue',
      categoryId: '',
      targetValue: 0,
      period: 'monthly',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3)
    });
    setEditingGoal(null);
    setIsCreating(false);
  };

  const getGoalLabel = (goal: Goal) => {
    let label = goal.type.charAt(0).toUpperCase() + goal.type.slice(1);
    if (goal.type === 'category_revenue' && goal.categoryName) {
      label = `${goal.categoryName} Revenue`;
    }
    
    let period = '';
    if (goal.period === 'monthly') {
      period = `${new Date(goal.year, (goal.month || 1) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else if (goal.period === 'quarterly') {
      period = `Q${goal.quarter} ${goal.year}`;
    } else {
      period = goal.year.toString();
    }
    
    return `${label} - ${period}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#333333] rounded-[4px] w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
          <h2 className="text-xl font-bold">GOAL SETTING & TRACKING</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isCreating ? (
            <>
              {/* Add New Button */}
              <button
                onClick={() => setIsCreating(true)}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">SET NEW GOAL</span>
              </button>

              {/* Goals List */}
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No goals set yet</p>
                    <p className="text-sm mt-2">Set goals to track your business performance</p>
                  </div>
                ) : (
                  goals.map(goal => (
                    <div key={goal.id} className="bg-[#1E1E1E] rounded-[4px] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-2">{getGoalLabel(goal)}</h3>
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs text-gray-400 uppercase mb-1">Target</p>
                              <p className="text-xl font-mono font-semibold">
                                {goal.type === 'projects' ? goal.targetValue : formatCurrency(goal.targetValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase mb-1">Period</p>
                              <p className="text-sm">{goal.period}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => editGoal(goal)}
                            className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors text-[#D32F2F]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Create/Edit Form */
            <div className="space-y-6">
              <h3 className="text-lg font-medium">
                {editingGoal ? 'EDIT GOAL' : 'SET NEW GOAL'}
              </h3>

              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">GOAL TYPE</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Goal['type'] }))}
                  className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                >
                  <option value="revenue">Total Revenue</option>
                  <option value="profit">Total Profit</option>
                  <option value="projects">Number of Projects</option>
                  <option value="category_revenue">Category Revenue</option>
                </select>
              </div>

              {/* Category Selection (if category_revenue) */}
              {formData.type === 'category_revenue' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">CATEGORY</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  TARGET {formData.type === 'projects' ? 'COUNT' : 'AMOUNT'}
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                  placeholder={formData.type === 'projects' ? '10' : '50000'}
                />
              </div>

              {/* Period */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">PERIOD</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as Goal['period'] }))}
                  className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">YEAR</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    min="2020"
                    max="2030"
                  />
                </div>

                {formData.period === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">MONTH</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.period === 'quarterly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">QUARTER</label>
                    <select
                      value={formData.quarter}
                      onChange={(e) => setFormData(prev => ({ ...prev, quarter: parseInt(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    >
                      <option value={1}>Q1</option>
                      <option value={2}>Q2</option>
                      <option value={3}>Q3</option>
                      <option value={4}>Q4</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E1E1E]">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-[#555555] text-white rounded-[4px] hover:bg-[#404040] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={saveGoal}
                  className="px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
                >
                  {editingGoal ? 'UPDATE GOAL' : 'SET GOAL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 