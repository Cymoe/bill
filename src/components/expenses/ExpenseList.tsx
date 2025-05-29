import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Receipt, Plus, Trash2, Calendar, DollarSign, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Expense {
  id: string;
  description: string;
  amount: number;
  expense_category: string;
  vendor?: string;
  date: string;
  status: 'pending' | 'approved' | 'paid';
  receipt_url?: string;
  created_at: string;
}

interface ExpenseTemplate {
  id: string;
  description: string;
  typical_amount: number;
  expense_category: string;
  vendor?: string;
}

interface ExpenseListProps {
  projectId: string;
  categoryId?: string;
  projectBudget: number;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ projectId, categoryId, projectBudget }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    expense_category: 'Material',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const
  });

  useEffect(() => {
    loadExpenses();
    if (categoryId) {
      loadTemplates();
    }
  }, [projectId, categoryId]);

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    if (!categoryId) return;
    
    try {
      const { data, error } = await supabase
        .from('expense_templates')
        .select('*')
        .eq('category_id', categoryId)
        .order('display_order');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading expense templates:', error);
    }
  };

  const addExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          project_id: projectId,
          category_id: categoryId,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          expense_category: newExpense.expense_category,
          vendor: newExpense.vendor || null,
          date: newExpense.date,
          status: newExpense.status,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setExpenses([data, ...expenses]);
      setNewExpense({
        description: '',
        amount: '',
        expense_category: 'Material',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
      setShowAddExpense(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const addFromTemplate = (template: ExpenseTemplate) => {
    setNewExpense({
      description: template.description,
      amount: template.typical_amount.toString(),
      expense_category: template.expense_category,
      vendor: template.vendor || '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setShowAddExpense(true);
    setShowSuggestions(false);
  };

  const updateExpenseStatus = async (expenseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: newStatus })
        .eq('id', expenseId);

      if (error) throw error;
      
      setExpenses(expenses.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status: newStatus as any } 
          : expense
      ));
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-[#388E3C] bg-[#388E3C]/20';
      case 'approved': return 'text-[#336699] bg-[#336699]/20';
      default: return 'text-[#F9D71C] bg-[#F9D71C]/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'material': return 'text-[#336699]';
      case 'labor': return 'text-[#F9D71C]';
      case 'permits': return 'text-[#D32F2F]';
      default: return 'text-[#9E9E9E]';
    }
  };

  const getExpenseStats = () => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paid = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const pending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    const approved = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
    const budgetUsed = (total / projectBudget) * 100;

    return { total, paid, pending, approved, budgetUsed };
  };

  const stats = getExpenseStats();

  if (loading) {
    return <div className="text-gray-400">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#333333] rounded p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Total Expenses</p>
          <p className="text-2xl font-mono font-semibold">{formatCurrency(stats.total)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.budgetUsed.toFixed(1)}% of budget</p>
        </div>
        <div className="bg-[#333333] rounded p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Paid</p>
          <p className="text-2xl font-mono font-semibold text-[#388E3C]">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="bg-[#333333] rounded p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Approved</p>
          <p className="text-2xl font-mono font-semibold text-[#336699]">{formatCurrency(stats.approved)}</p>
        </div>
        <div className="bg-[#333333] rounded p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Pending</p>
          <p className="text-2xl font-mono font-semibold text-[#F9D71C]">{formatCurrency(stats.pending)}</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-[#333333] rounded p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">BUDGET UTILIZATION</span>
          <span className="text-sm">
            {formatCurrency(stats.total)} of {formatCurrency(projectBudget)}
          </span>
        </div>
        <div className="h-3 bg-[#1E1E1E] rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              stats.budgetUsed > 90 ? 'bg-[#D32F2F]' : 
              stats.budgetUsed > 75 ? 'bg-[#F9D71C]' : 
              'bg-[#336699]'
            }`}
            style={{ width: `${Math.min(stats.budgetUsed, 100)}%` }}
          />
        </div>
        {stats.budgetUsed > 90 && (
          <p className="text-xs text-[#D32F2F] mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Budget nearly exhausted
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">EXPENSES</h3>
        <div className="flex gap-2">
          {templates.length > 0 && (
            <button
              onClick={() => setShowSuggestions(true)}
              className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-opacity-80 transition-colors flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              SUGGESTIONS
            </button>
          )}
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ADD EXPENSE
          </button>
        </div>
      </div>

      {/* Suggestions Modal */}
      {showSuggestions && templates.length > 0 && (
        <div className="bg-[#1E1E1E] rounded p-4 border border-[#F9D71C]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#F9D71C]" />
              Typical Expenses for this Category
            </h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => addFromTemplate(template)}
                className="text-left p-3 bg-[#333333] rounded hover:bg-opacity-80 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{template.description}</p>
                    <p className="text-xs text-gray-400">{template.expense_category}</p>
                    {template.vendor && (
                      <p className="text-xs text-gray-500">{template.vendor}</p>
                    )}
                  </div>
                  <p className="font-mono text-sm">{formatCurrency(template.typical_amount)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      {showAddExpense && (
        <div className="bg-[#1E1E1E] rounded p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white placeholder-gray-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white placeholder-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={newExpense.expense_category}
              onChange={(e) => setNewExpense({ ...newExpense, expense_category: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white"
            >
              <option value="Material">Material</option>
              <option value="Labor">Labor</option>
              <option value="Permits">Permits</option>
              <option value="Equipment">Equipment</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Vendor (optional)"
              value={newExpense.vendor}
              onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white placeholder-gray-500"
            />
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="px-3 py-2 bg-[#333333] border border-gray-600 rounded text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addExpense}
              className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors"
            >
              CREATE
            </button>
            <button
              onClick={() => {
                setShowAddExpense(false);
                setNewExpense({
                  description: '',
                  amount: '',
                  expense_category: 'Material',
                  vendor: '',
                  date: new Date().toISOString().split('T')[0],
                  status: 'pending'
                });
              }}
              className="px-4 py-2 bg-transparent border border-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Expense Table */}
      <div className="bg-[#333333] rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E1E1E]">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Description</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vendor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-[#1E1E1E] hover:bg-[#1E1E1E] transition-colors">
                <td className="px-4 py-3 text-sm">{expense.description}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={getCategoryColor(expense.expense_category)}>
                    {expense.expense_category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{expense.vendor || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3">
                  <select
                    value={expense.status}
                    onChange={(e) => updateExpenseStatus(expense.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-medium bg-transparent border ${getStatusColor(expense.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-gray-400 hover:text-[#D32F2F] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expenses.length === 0 && !showAddExpense && (
        <div className="text-center py-8 text-gray-400">
          <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">No expenses recorded yet</p>
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-4 py-2 bg-[#336699] text-white rounded hover:bg-opacity-80 transition-colors"
          >
            ADD FIRST EXPENSE
          </button>
        </div>
      )}
    </div>
  );
}; 