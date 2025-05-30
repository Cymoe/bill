import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ChevronDown, ChevronRight, Receipt, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  vendor: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  receipt_url?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

interface ExpensesListProps {
  projectId: string;
  editable?: boolean;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ projectId, editable = true }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaid, setShowPaid] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    thisWeek: true,
    earlier: true
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    vendor: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (user && projectId) {
      loadExpenses();
    }
  }, [user, projectId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
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

  const toggleExpenseStatus = async (expenseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: newStatus })
        .eq('id', expenseId);

      if (error) throw error;
      
      // Update local state
      setExpenses(expenses.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status: newStatus }
          : expense
      ));
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const createExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          vendor: newExpense.vendor || null,
          category: newExpense.category || 'Material',
          date: newExpense.date,
          status: 'pending',
          project_id: projectId,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setExpenses([data, ...expenses]);
      
      // Reset form
      setNewExpense({
        description: '',
        amount: '',
        vendor: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      createExpense();
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewExpense({
        description: '',
        amount: '',
        vendor: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Material': '#3b82f6',
      'Labor': '#f59e0b',
      'Equipment': '#8b5cf6',
      'Permits': '#10b981',
      'Subcontractor': '#ec4899',
      'Other': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const groupExpensesByDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      today: [] as Expense[],
      thisWeek: [] as Expense[],
      earlier: [] as Expense[],
      paid: [] as Expense[]
    };

    expenses.forEach(expense => {
      if (expense.status === 'paid') {
        groups.paid.push(expense);
      } else {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        
        if (expenseDate.getTime() === now.getTime()) {
          groups.today.push(expense);
        } else if (expenseDate > weekAgo) {
          groups.thisWeek.push(expense);
        } else {
          groups.earlier.push(expense);
        }
      }
    });

    return groups;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const setQuickDate = (option: string) => {
    const today = new Date();
    let targetDate = new Date();

    switch (option) {
      case 'today':
        targetDate = today;
        break;
      case 'yesterday':
        targetDate.setDate(today.getDate() - 1);
        break;
      case 'lastWeek':
        targetDate.setDate(today.getDate() - 7);
        break;
    }

    setNewExpense({
      ...newExpense,
      date: targetDate.toISOString().split('T')[0]
    });
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedExpenses = groupExpensesByDate();
  const totalPending = expenses.filter(e => e.status !== 'paid').reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalPending + totalPaid;

  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort categories by total amount
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Top 3 categories

  return (
    <div className="space-y-6">
      {/* KPI Header Strip */}
      <div className="flex divide-x divide-[#2a2a2a] mb-6">
        <div className="pr-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Expenses</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</div>
          <div className="text-xs text-gray-500">({expenses.length} items)</div>
        </div>

        <div className="px-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paid</div>
          <div className="text-2xl font-semibold text-green-500">{formatCurrency(totalPaid)}</div>
          <div className="text-xs text-gray-500">({totalExpenses > 0 ? Math.round((totalPaid / totalExpenses) * 100) : 0}% of total)</div>
        </div>

        <div className="px-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending</div>
          <div className="text-2xl font-semibold text-yellow-500">{formatCurrency(totalPending)}</div>
          <div className="text-xs text-gray-500">(awaiting payment)</div>
        </div>

        <div className="pl-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Top Category</div>
          <div className="text-2xl font-semibold">
            {sortedCategories.length > 0 ? formatCurrency(sortedCategories[0][1]) : '$0.00'}
          </div>
          <div className="text-xs text-gray-500">
            ({sortedCategories.length > 0 ? sortedCategories[0][0] : 'none'})
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="text-sm text-gray-500 hover:text-gray-400">
            ○ all expenses <ChevronDown className="inline w-3 h-3 ml-1" />
          </button>
        </div>
        {!isCreating && editable && (
          <button 
            onClick={() => setIsCreating(true)}
            className="p-2 hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Expense Creation Form */}
      {isCreating && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center">
              <DollarSign className="w-3 h-3 text-gray-600" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  onKeyDown={handleKeyPress}
                  placeholder="What did you pay for?"
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                  autoFocus
                />
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  onKeyDown={handleKeyPress}
                  placeholder="0.00"
                  step="0.01"
                  className="w-24 bg-transparent text-white placeholder-gray-500 outline-none text-sm text-right"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                  onKeyDown={handleKeyPress}
                  placeholder="Vendor (optional)"
                  className="flex-1 bg-transparent text-gray-400 placeholder-gray-600 outline-none text-xs"
                />
                
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400"
                  >
                    <Calendar className="w-3 h-3" />
                    {new Date(newExpense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute top-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2 z-10">
                      <div className="space-y-1">
                        <button
                          onClick={() => setQuickDate('today')}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#2a2a2a] rounded"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setQuickDate('yesterday')}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#2a2a2a] rounded"
                        >
                          Yesterday
                        </button>
                        <button
                          onClick={() => setQuickDate('lastWeek')}
                          className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:bg-[#2a2a2a] rounded"
                        >
                          Last week
                        </button>
                        <div className="border-t border-[#2a2a2a] my-1"></div>
                        <input
                          type="date"
                          value={newExpense.date}
                          onChange={(e) => {
                            setNewExpense({...newExpense, date: e.target.value});
                            setShowDatePicker(false);
                          }}
                          className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="text-xs bg-transparent text-gray-500 hover:text-gray-400 outline-none cursor-pointer"
                >
                  <option value="">Material</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Permits">Permits</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={createExpense}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewExpense({
                    description: '',
                    amount: '',
                    vendor: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="px-3 py-1 text-gray-500 hover:text-gray-400 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Groups */}
      <div className="space-y-6">
        {/* Today's Expenses */}
        {groupedExpenses.today.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('today')}
              className="flex items-center gap-2 text-sm text-gray-400 mb-3"
            >
              {expandedSections.today ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              today
            </button>
            {expandedSections.today && (
              <div className="space-y-2">
                {groupedExpenses.today.map(expense => (
                  <ExpenseItem key={expense.id} expense={expense} onToggle={toggleExpenseStatus} formatDate={formatExpenseDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* This Week's Expenses */}
        {groupedExpenses.thisWeek.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('thisWeek')}
              className="flex items-center gap-2 text-sm text-gray-400 mb-3"
            >
              {expandedSections.thisWeek ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              this week
            </button>
            {expandedSections.thisWeek && (
              <div className="space-y-2">
                {groupedExpenses.thisWeek.map(expense => (
                  <ExpenseItem key={expense.id} expense={expense} onToggle={toggleExpenseStatus} formatDate={formatExpenseDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Earlier Expenses */}
        {groupedExpenses.earlier.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('earlier')}
              className="flex items-center gap-2 text-sm text-gray-400 mb-3"
            >
              {expandedSections.earlier ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              earlier
            </button>
            {expandedSections.earlier && (
              <div className="space-y-2">
                {groupedExpenses.earlier.map(expense => (
                  <ExpenseItem key={expense.id} expense={expense} onToggle={toggleExpenseStatus} formatDate={formatExpenseDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paid Expenses */}
        {groupedExpenses.paid.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#2a2a2a]">
            <button
              onClick={() => setShowPaid(!showPaid)}
              className="flex items-center gap-2 text-sm text-gray-500 mb-3"
            >
              {showPaid ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              paid expenses ({groupedExpenses.paid.length})
            </button>
            {showPaid && (
              <div className="space-y-2 opacity-50">
                {groupedExpenses.paid.map(expense => (
                  <ExpenseItem key={expense.id} expense={expense} onToggle={toggleExpenseStatus} formatDate={formatExpenseDate} getCategoryColor={getCategoryColor} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {expenses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No expenses tracked yet</p>
          {editable && (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
            >
              Add First Expense
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Expense Item Component
const ExpenseItem: React.FC<{
  expense: Expense;
  onToggle: (id: string, status: string) => void;
  formatDate: (date: string) => string;
  getCategoryColor: (category: string) => string;
}> = ({ expense, onToggle, formatDate, getCategoryColor }) => {
  const isPaid = expense.status === 'paid';
  
  return (
    <div className="flex items-start gap-3 group hover:bg-[#0a0a0a] p-2 -mx-2 rounded transition-colors">
      <button
        onClick={() => onToggle(expense.id, expense.status)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isPaid
            ? 'bg-green-500 border-green-500'
            : 'border-gray-600 hover:border-gray-400'
        }`}
      >
        {isPaid && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className={`text-sm ${isPaid ? 'line-through text-gray-500' : 'text-white'}`}>
            {expense.description}
          </span>
          <span className={`text-sm font-semibold ${isPaid ? 'text-gray-500' : 'text-white'}`}>
            {formatCurrency(expense.amount)}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          {expense.vendor && (
            <span className="text-xs text-gray-500">{expense.vendor}</span>
          )}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(expense.date)}
          </span>
          {expense.category && (
            <span 
              className="text-xs px-2 py-0.5 rounded"
              style={{ 
                backgroundColor: `${getCategoryColor(expense.category)}20`,
                color: getCategoryColor(expense.category)
              }}
            >
              {expense.category}
            </span>
          )}
          {expense.receipt_url && (
            <a 
              href={expense.receipt_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              <Receipt className="w-3 h-3" />
              Receipt
            </a>
          )}
        </div>
      </div>
    </div>
  );
}; 